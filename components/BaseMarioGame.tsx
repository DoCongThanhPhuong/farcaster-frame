'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Play, RotateCcw, Share2, Trophy, Volume2, VolumeX, ArrowLeft, ArrowRight, ArrowUp, Sparkles, Heart, Skull, HelpCircle, X } from 'lucide-react';

interface BaseMarioGameProps {
  fid: number | null;
  onHighScoreChange?: (highScore: number) => void;
}

class RetroAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      if ('AudioContext' in window) {
        this.ctx = new window.AudioContext();
      }
    }
  }

  jump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  coin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1318, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {}
  }

  stomp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  bonk() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  powerUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      const notes = [330, 392, 659, 523, 587, 784];
      notes.forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.06);
      });
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {}
  }

  gameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch {}
  }
}

const audio = new RetroAudio();

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const TROLL_DEATH_MESSAGES = [
  'Bonked head on an invisible block and plunged into the abyss! 😈',
  'Platform dev rugpulled right under your feet! 📉',
  'Greedily grabbed a fake scam 10K$ airdrop coin! 🤡',
  'Goal flagpole ran away to tease you! 🏃💨',
  'Liquidated by the FUD market cap monster! 🐻',
  'Crushed by an instant Base gas fee spike! ⛽',
  'FOMO reckless jump directly into a Syobon trap! 💀',
];

export function BaseMarioGame({ fid, onHighScoreChange }: BaseMarioGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [deathReason, setDeathReason] = useState('Liquidated by market volatility! 📉');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);
  const [showGuide, setShowGuide] = useState(false);

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  const stateRef = useRef({
    gameState: 'idle' as 'idle' | 'playing' | 'gameover' | 'victory',
    score: 0,
    highScore: 0,
    deaths: 0,
    deathReason: 'Liquidated by market volatility! 📉',
    lives: 3,
  });

  useEffect(() => {
    const key = fid ? `fc_farbase_highscore_${fid}` : 'fc_farbase_highscore';
    const deathKey = fid ? `fc_farbase_deaths_${fid}` : 'fc_farbase_deaths';
    try {
      const savedScore = localStorage.getItem(key) || localStorage.getItem(`fc_mario_highscore_${fid}`) || localStorage.getItem('fc_mario_highscore');
      if (savedScore) {
        const val = parseInt(savedScore, 10) || 0;
        setHighScore(val);
        stateRef.current.highScore = val;
        onHighScoreChange?.(val);
      }
      const savedDeaths = localStorage.getItem(deathKey) || localStorage.getItem(`fc_mario_deaths_${fid}`) || localStorage.getItem('fc_mario_deaths');
      if (savedDeaths) {
        const dVal = parseInt(savedDeaths, 10) || 0;
        setDeaths(dVal);
        stateRef.current.deaths = dVal;
      }
    } catch {}
  }, [fid, onHighScoreChange]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
  };

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.lives = 3;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 280;
    const GRAVITY = 0.55;
    const LEVEL_WIDTH = 3400;

    const player = {
      x: 60,
      y: 180,
      width: 20,
      height: 26,
      vx: 0,
      vy: 0,
      speed: 3.5,
      jumpForce: -10.5,
      grounded: false,
      facing: 'right' as 'left' | 'right',
      invulnerable: 0,
      animTick: 0,
    };

    interface Platform {
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'ground' | 'brick' | 'question' | 'pipe' | 'rugpull';
      hit?: boolean;
      shake?: number;
      falling?: boolean;
      fallSpeed?: number;
    }

    const platforms: Platform[] = [
      { x: 0, y: 240, w: 700, h: 40, type: 'ground' },
      { x: 780, y: 240, w: 600, h: 40, type: 'ground' },
      { x: 1460, y: 240, w: 700, h: 40, type: 'ground' },
      { x: 2240, y: 240, w: 1100, h: 40, type: 'ground' },

      { x: 260, y: 205, w: 35, h: 35, type: 'pipe' },
      { x: 540, y: 190, w: 35, h: 50, type: 'pipe' },
      { x: 1050, y: 195, w: 35, h: 45, type: 'pipe' },
      { x: 1780, y: 195, w: 35, h: 45, type: 'pipe' },

      { x: 160, y: 165, w: 25, h: 25, type: 'question' },
      { x: 185, y: 165, w: 25, h: 25, type: 'brick' },
      { x: 210, y: 165, w: 25, h: 25, type: 'question' },
      { x: 235, y: 165, w: 25, h: 25, type: 'brick' },

      { x: 380, y: 145, w: 75, h: 20, type: 'brick' },
      { x: 420, y: 95, w: 25, h: 25, type: 'question' },

      { x: 880, y: 165, w: 25, h: 25, type: 'question' },
      { x: 930, y: 165, w: 60, h: 20, type: 'brick' },
      { x: 1180, y: 155, w: 25, h: 25, type: 'question' },
      { x: 1240, y: 130, w: 75, h: 20, type: 'rugpull' },

      { x: 1560, y: 165, w: 25, h: 25, type: 'brick' },
      { x: 1585, y: 165, w: 25, h: 25, type: 'question' },
      { x: 1610, y: 165, w: 25, h: 25, type: 'brick' },
      { x: 1920, y: 140, w: 90, h: 20, type: 'brick' },

      { x: 2600, y: 220, w: 30, h: 20, type: 'brick' },
      { x: 2630, y: 200, w: 30, h: 40, type: 'brick' },
      { x: 2660, y: 180, w: 30, h: 60, type: 'brick' },
      { x: 2690, y: 160, w: 30, h: 80, type: 'brick' },
    ];

    interface TrollBlock {
      x: number;
      y: number;
      w: number;
      h: number;
      revealed: boolean;
      label: string;
      reason: string;
    }

    const trollBlocks: TrollBlock[] = [
      { x: 742, y: 145, w: 26, h: 26, revealed: false, label: '😈', reason: 'Bonked head on an invisible block and fell into the abyss! 😈' },
      { x: 2160, y: 155, w: 26, h: 26, revealed: false, label: '📉', reason: 'Blocked by an invisible wall right before the goal! 📉' },
    ];

    interface Coin {
      x: number;
      y: number;
      type: 'base' | 'farcaster' | 'fake_airdrop';
      collected: boolean;
      tick: number;
    }

    const coins: Coin[] = [
      { x: 172, y: 135, type: 'base', collected: false, tick: 0 },
      { x: 222, y: 135, type: 'farcaster', collected: false, tick: 1 },
      { x: 395, y: 115, type: 'base', collected: false, tick: 2 },
      { x: 432, y: 65, type: 'farcaster', collected: false, tick: 3 },
      { x: 640, y: 200, type: 'base', collected: false, tick: 4 },
      { x: 892, y: 135, type: 'farcaster', collected: false, tick: 5 },
      { x: 955, y: 135, type: 'fake_airdrop', collected: false, tick: 6 },
      { x: 1192, y: 125, type: 'base', collected: false, tick: 7 },
      { x: 1270, y: 100, type: 'farcaster', collected: false, tick: 8 },
      { x: 1597, y: 135, type: 'farcaster', collected: false, tick: 9 },
      { x: 1965, y: 110, type: 'base', collected: false, tick: 10 },
      { x: 2350, y: 205, type: 'base', collected: false, tick: 11 },
      { x: 2400, y: 205, type: 'farcaster', collected: false, tick: 12 },
    ];

    interface Enemy {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      alive: boolean;
      rangeStart: number;
      rangeEnd: number;
    }

    const enemies: Enemy[] = [
      { x: 420, y: 220, w: 20, h: 20, vx: -1.2, alive: true, rangeStart: 320, rangeEnd: 520 },
      { x: 920, y: 220, w: 20, h: 20, vx: -1.2, alive: true, rangeStart: 800, rangeEnd: 1030 },
      { x: 1200, y: 220, w: 20, h: 20, vx: 1.2, alive: true, rangeStart: 1120, rangeEnd: 1360 },
      { x: 1650, y: 220, w: 20, h: 20, vx: -1.4, alive: true, rangeStart: 1500, rangeEnd: 1760 },
      { x: 2000, y: 220, w: 20, h: 20, vx: -1.5, alive: true, rangeStart: 1850, rangeEnd: 2150 },
      { x: 2450, y: 220, w: 20, h: 20, vx: 1.2, alive: true, rangeStart: 2300, rangeEnd: 2550 },
    ];

    const flag = {
      x: 2850,
      y: 90,
      w: 8,
      h: 150,
      reached: false,
      trolled: false,
    };

    const particles: Particle[] = [];
    const floatingTexts: FloatingText[] = [];

    const spawnParticles = (x: number, y: number, color: string, count = 8) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          color,
          life: 25,
        });
      }
    };

    const spawnFloatingText = (x: number, y: number, text: string, color = '#FCD34D') => {
      floatingTexts.push({ x, y, text, color, life: 35 });
    };

    let animationFrameId: number | null = null;
    let cameraX = 0;

    const recordDeath = (reason?: string) => {
      stateRef.current.lives--;
      setLives(stateRef.current.lives);
      stateRef.current.deaths++;
      setDeaths(stateRef.current.deaths);

      const chosenReason = reason || TROLL_DEATH_MESSAGES[Math.floor(Math.random() * TROLL_DEATH_MESSAGES.length)];
      stateRef.current.deathReason = chosenReason;
      setDeathReason(chosenReason);

      const deathKey = fid ? `fc_farbase_deaths_${fid}` : 'fc_farbase_deaths';
      try {
        localStorage.setItem(deathKey, stateRef.current.deaths.toString());
      } catch {}

      if (stateRef.current.lives <= 0) {
        audio.gameOver();
        endGame('gameover');
      } else {
        audio.bonk();
        const safeCheckpoints = [60, 320, 600, 850, 1100, 1500, 1800, 2300];
        let safeX = 60;
        for (const sx of safeCheckpoints) {
          if (sx <= player.x) {
            safeX = sx;
          }
        }
        player.x = safeX;
        player.y = 150;
        player.vx = 0;
        player.vy = 0;
        player.grounded = false;
        player.invulnerable = 90;
      }
    };

    const gameLoop = () => {
      if (stateRef.current.gameState !== 'playing') return;

      const keys = keysRef.current;
      if (keys.left) {
        player.vx = -player.speed;
        player.facing = 'left';
      } else if (keys.right) {
        player.vx = player.speed;
        player.facing = 'right';
      } else {
        player.vx *= 0.75;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }

      if (keys.jump && player.grounded) {
        player.vy = player.jumpForce;
        player.grounded = false;
        audio.jump();
      }

      player.vy += GRAVITY;
      if (player.vy > 11) player.vy = 11;

      if (player.invulnerable > 0) player.invulnerable--;

      player.x += player.vx;
      if (player.x < 0) player.x = 0;

      for (const p of platforms) {
        if (
          player.x < p.x + p.w &&
          player.x + player.width > p.x &&
          player.y < p.y + p.h &&
          player.y + player.height > p.y
        ) {
          if (player.vx > 0) player.x = p.x - player.width;
          else if (player.vx < 0) player.x = p.x + p.w;
        }
      }

      for (const p of platforms) {
        if (p.type === 'rugpull') {
          if (p.shake && p.shake > 0) {
            p.shake--;
            if (p.shake === 0) {
              p.falling = true;
              p.fallSpeed = 2;
              audio.bonk();
              spawnFloatingText(p.x + 10, p.y - 15, 'RUG PULL! 📉', '#EF4444');
              spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#EF4444', 10);
            }
          } else if (p.falling) {
            p.fallSpeed = (p.fallSpeed || 2) + 0.5;
            p.y += p.fallSpeed;
          }
        }
      }

      player.grounded = false;
      player.y += player.vy;

      for (const p of platforms) {
        if (
          player.x < p.x + p.w &&
          player.x + player.width > p.x &&
          player.y < p.y + p.h &&
          player.y + player.height > p.y
        ) {
          if (player.vy > 0 && player.y + player.height - player.vy <= p.y + 4) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;

            if (p.type === 'rugpull' && !p.falling && !p.shake) {
              p.shake = 16;
            }
          } else if (player.vy < 0 && player.y - player.vy >= p.y + p.h - 6) {
            player.y = p.y + p.h;
            player.vy = 2;

            if (p.type === 'question' && !p.hit) {
              p.hit = true;
              audio.powerUp();
              stateRef.current.score += 50;
              setScore(stateRef.current.score);
              spawnFloatingText(p.x, p.y - 15, '+50', '#855DCD');
              spawnParticles(p.x + p.w / 2, p.y, '#FBBF24', 10);
            } else if (p.type === 'brick') {
              audio.stomp();
              spawnParticles(p.x + p.w / 2, p.y, '#C2410C', 4);
            }
          }
        }
      }

      for (const tb of trollBlocks) {
        if (
          player.x < tb.x + tb.w &&
          player.x + player.width > tb.x &&
          player.y < tb.y + tb.h &&
          player.y + player.height > tb.y
        ) {
          if (!tb.revealed) {
            tb.revealed = true;
            audio.bonk();
            spawnFloatingText(tb.x, tb.y - 15, 'RUG PULL! 😈', '#EF4444');
            spawnParticles(tb.x + tb.w / 2, tb.y + tb.h / 2, '#EF4444', 12);
            stateRef.current.deathReason = tb.reason;
            setDeathReason(tb.reason);
          }
          player.y = tb.y + tb.h;
          player.vy = 5;
          player.vx = 0;
        }
      }

      if (player.y > CANVAS_HEIGHT + 30) {
        recordDeath();
        if (stateRef.current.gameState !== 'playing') return;
      }

      for (const coin of coins) {
        if (!coin.collected) {
          coin.tick++;
          if (
            player.x < coin.x + 16 &&
            player.x + player.width > coin.x - 8 &&
            player.y < coin.y + 16 &&
            player.y + player.height > coin.y - 8
          ) {
            coin.collected = true;

            if (coin.type === 'fake_airdrop') {
              audio.bonk();
              stateRef.current.score = Math.max(0, stateRef.current.score - 50);
              setScore(stateRef.current.score);
              spawnFloatingText(coin.x, coin.y - 15, 'SCAM AIRDROP! 🤡 -50', '#EF4444');
              spawnParticles(coin.x, coin.y, '#EF4444', 15);
              player.vx = player.facing === 'right' ? -8 : 8;
              player.vy = -6;
              stateRef.current.deathReason = 'Greedily grabbed a scam 10K$ airdrop coin! 🤡';
              setDeathReason('Greedily grabbed a scam 10K$ airdrop coin! 🤡');
            } else {
              audio.coin();
              const gain = coin.type === 'farcaster' ? 50 : 20;
              stateRef.current.score += gain;
              setScore(stateRef.current.score);
              spawnFloatingText(coin.x, coin.y - 10, `+${gain}`, coin.type === 'farcaster' ? '#C084FC' : '#60A5FA');
              spawnParticles(coin.x, coin.y, coin.type === 'farcaster' ? '#9333EA' : '#0052FF', 8);
            }
          }
        }
      }

      for (const enemy of enemies) {
        if (enemy.alive) {
          enemy.x += enemy.vx;
          if (enemy.x <= enemy.rangeStart || enemy.x >= enemy.rangeEnd) {
            enemy.vx *= -1;
          }

          if (
            player.x < enemy.x + enemy.w &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.h &&
            player.y + player.height > enemy.y
          ) {
            if (player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 8) {
              enemy.alive = false;
              player.vy = -7;
              audio.stomp();
              stateRef.current.score += 80;
              setScore(stateRef.current.score);
              spawnFloatingText(enemy.x, enemy.y - 10, '+80 STOMP!', '#34D399');
              spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#EF4444', 12);
            } else if (player.invulnerable <= 0) {
              recordDeath('Liquidated by the FUD market cap monster! 🐻');
              if (stateRef.current.gameState !== 'playing') return;
            }
          }
        }
      }

      if (player.x + player.width >= 2810 && !flag.trolled) {
        flag.trolled = true;
        flag.x = 3120;
        audio.bonk();
        spawnFloatingText(2850, 110, 'NOT YET! DYOR! 🏃💨', '#FBBF24');
        spawnParticles(2850, 120, '#FBBF24', 15);
      } else if (player.x + player.width >= flag.x && !flag.reached) {
        flag.reached = true;
        audio.powerUp();
        stateRef.current.score += 500;
        setScore(stateRef.current.score);
        spawnFloatingText(flag.x, flag.y, '+500 REAL GOAL! 🏆', '#FBBF24');
        setTimeout(() => {
          endGame('victory');
        }, 800);
      }

      cameraX = Math.max(0, Math.min(LEVEL_WIDTH - CANVAS_WIDTH, player.x - CANVAS_WIDTH / 3));

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      const cloudOffset = (cameraX * 0.3) % 200;
      for (let cx = -50 - cloudOffset; cx < CANVAS_WIDTH + 100; cx += 160) {
        ctx.beginPath();
        ctx.arc(cx, 50, 24, 0, Math.PI * 2);
        ctx.arc(cx + 25, 45, 30, 0, Math.PI * 2);
        ctx.arc(cx + 50, 50, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(-cameraX, 0);

      for (const p of platforms) {
        if (p.x + p.w < cameraX - 20 || p.x > cameraX + CANVAS_WIDTH + 20) continue;

        if (p.type === 'ground') {
          ctx.fillStyle = '#0052FF';
          ctx.fillRect(p.x, p.y, p.w, 8);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
          ctx.strokeStyle = '#1e293b';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
        } else if (p.type === 'rugpull') {
          const jitterX = p.shake ? (Math.random() - 0.5) * 6 : 0;
          ctx.fillStyle = p.falling ? '#EF4444' : p.shake ? '#DC2626' : '#855DCD';
          ctx.fillRect(p.x + jitterX, p.y, p.w, p.h);
          ctx.strokeStyle = p.shake ? '#B91C1C' : '#4C1D95';
          ctx.strokeRect(p.x + jitterX, p.y, p.w, p.h);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.falling ? 'RUG!' : p.shake ? 'RUN!' : 'SAFE', p.x + p.w / 2 + jitterX, p.y + p.h / 2 + 3);
        } else if (p.type === 'pipe') {
          ctx.fillStyle = '#059669';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#10B981';
          ctx.fillRect(p.x - 3, p.y, p.w + 6, 10);
          ctx.strokeStyle = '#064E3B';
          ctx.strokeRect(p.x - 3, p.y, p.w + 6, 10);
        } else if (p.type === 'question') {
          ctx.fillStyle = p.hit ? '#4B5563' : '#F59E0B';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#78350F';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.hit ? '•' : '?', p.x + p.w / 2, p.y + p.h / 2 + 5);
        } else if (p.type === 'brick') {
          ctx.fillStyle = '#855DCD';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#4C1D95';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#6D28D9';
          ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, p.h / 2 - 2);
        }
      }

      for (const tb of trollBlocks) {
        if (tb.revealed && tb.x > cameraX - 20 && tb.x < cameraX + CANVAS_WIDTH + 20) {
          ctx.fillStyle = '#991B1B';
          ctx.fillRect(tb.x, tb.y, tb.w, tb.h);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(tb.x, tb.y, tb.w, tb.h);
          ctx.lineWidth = 1;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(tb.label, tb.x + tb.w / 2, tb.y + tb.h / 2 + 4);
        }
      }

      for (const coin of coins) {
        if (!coin.collected && coin.x > cameraX - 20 && coin.x < cameraX + CANVAS_WIDTH + 20) {
          const bounce = Math.sin(coin.tick * 0.1) * 3;
          ctx.save();
          ctx.translate(coin.x, coin.y + bounce);

          if (coin.type === 'fake_airdrop') {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('10K$', 0, 3);
          } else if (coin.type === 'farcaster') {
            ctx.fillStyle = '#855DCD';
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🟣', 0, 4);
          } else {
            ctx.fillStyle = '#0052FF';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      for (const enemy of enemies) {
        if (enemy.alive && enemy.x > cameraX - 30 && enemy.x < cameraX + CANVAS_WIDTH + 30) {
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.w / 2, enemy.y + 8, 10, Math.PI, 0);
          ctx.lineTo(enemy.x + enemy.w, enemy.y + enemy.h);
          ctx.lineTo(enemy.x, enemy.y + enemy.h);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(enemy.x + 3, enemy.y + 6, 4, 4);
          ctx.fillRect(enemy.x + 13, enemy.y + 6, 4, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(enemy.x + (enemy.vx > 0 ? 5 : 3), enemy.y + 7, 2, 2);
          ctx.fillRect(enemy.x + (enemy.vx > 0 ? 15 : 13), enemy.y + 7, 2, 2);

          ctx.fillStyle = '#FEF2F2';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FUD', enemy.x + enemy.w / 2, enemy.y + enemy.h - 2);
        }
      }

      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(flag.x, flag.y, flag.w, flag.h);
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.arc(flag.x + flag.w / 2, flag.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = flag.trolled ? '#DC2626' : '#0052FF';
      ctx.beginPath();
      ctx.moveTo(flag.x + flag.w, flag.y + 10);
      ctx.lineTo(flag.x + flag.w + 35, flag.y + 25);
      ctx.lineTo(flag.x + flag.w, flag.y + 40);
      ctx.fill();

      if (player.invulnerable % 8 < 4) {
        ctx.save();
        ctx.translate(player.x, player.y);
        if (player.facing === 'left') {
          ctx.translate(player.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.fillStyle = '#855DCD';
        ctx.fillRect(2, 0, 16, 6);
        ctx.fillRect(6, 2, 14, 4);

        ctx.fillStyle = '#FDE047';
        ctx.fillRect(4, 6, 12, 7);
        ctx.fillStyle = '#1E1B4B';
        ctx.fillRect(12, 7, 3, 3);
        ctx.fillStyle = '#451A03';
        ctx.fillRect(10, 11, 7, 2);

        ctx.fillStyle = '#0052FF';
        ctx.fillRect(3, 13, 14, 8);
        ctx.fillStyle = '#855DCD';
        ctx.fillRect(6, 13, 3, 8);
        ctx.fillRect(12, 13, 3, 8);

        ctx.fillStyle = '#78350F';
        if (player.grounded && Math.abs(player.vx) > 0.5) {
          player.animTick = (player.animTick + 0.25) % 4;
          const legOffset = Math.sin(player.animTick * Math.PI) * 3;
          ctx.fillRect(2 + legOffset, 21, 6, 5);
          ctx.fillRect(11 - legOffset, 21, 6, 5);
        } else {
          ctx.fillRect(2, 21, 6, 5);
          ctx.fillRect(11, 21, 6, 5);
        }

        ctx.restore();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        if (pt.life <= 0) particles.splice(i, 1);
      }

      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.8;
        ft.life--;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        if (ft.life <= 0) floatingTexts.splice(i, 1);
      }

      ctx.restore();

      if (stateRef.current.gameState === 'playing') {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const endGame = (outcome: 'gameover' | 'victory') => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      setGameState(outcome);
      stateRef.current.gameState = outcome;

      const finalScore = stateRef.current.score;
      if (finalScore > stateRef.current.highScore) {
        setHighScore(finalScore);
        stateRef.current.highScore = finalScore;
        const key = fid ? `fc_farbase_highscore_${fid}` : 'fc_farbase_highscore';
        try {
          localStorage.setItem(key, finalScore.toString());
        } catch {}
        onHighScoreChange?.(finalScore);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
  }, [fid, onHighScoreChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.jump = true;
        if (['Space', 'ArrowUp'].includes(e.code)) e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleShareScore = async () => {
    const castText = `💀 I just died ${deaths} times in FarBase Rush: Trap Adventure! 😂\nLast cause: "${deathReason}"\n\nThink you can beat level 1 without rage quitting?`;
    const frameUrl = process.env.NEXT_PUBLIC_HOST
      ? `https://${process.env.NEXT_PUBLIC_HOST}`
      : 'https://farcaster-frame-sepia.vercel.app';

    try {
      if (typeof sdk.actions.composeCast === 'function') {
        await sdk.actions.composeCast({
          text: castText,
          embeds: [frameUrl],
        });
      } else {
        const intentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(frameUrl)}`;
        window.open(intentUrl, '_blank');
      }
    } catch {
      const intentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(frameUrl)}`;
      window.open(intentUrl, '_blank');
    }
  };

  return (
    <div className="bg-[#141522] border border-gray-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-base shadow-lg animate-pulse">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>FarBase Rush</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                Trap Edition
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Survive invisible blocks, rugpull traps, and FUD monsters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGuide(true)}
            className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1 text-xs"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline text-[11px] font-semibold">Guide</span>
          </button>
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-1 bg-yellow-950/40 border border-yellow-800/40 px-2 py-1 rounded-lg text-xs font-bold text-yellow-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{highScore}</span>
          </div>
          <div className="flex items-center gap-1 bg-red-950/40 border border-red-800/40 px-2 py-1 rounded-lg text-xs font-bold text-red-400" title="Total Deaths">
            <Skull className="w-3.5 h-3.5" />
            <span>{deaths}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mb-2 text-xs">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-700'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-medium">
            Score: <strong className="text-white text-sm">{score}</strong>
          </span>
          {score >= 100 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-950/40 border border-green-800/40 px-2 py-0.5 rounded-full font-bold">
              <Sparkles className="w-3 h-3" /> +0.2x Multiplier
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border-2 border-gray-800 bg-[#0a0a14] aspect-[480/280] shadow-inner">
        <canvas
          ref={canvasRef}
          width={480}
          height={280}
          className="w-full h-full block image-pixelated"
        />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center text-2xl shadow-xl mb-3 animate-bounce">
              ⚡
            </div>
            <h4 className="font-extrabold text-white text-base mb-1">FarBase Rush: Trap Adventure</h4>
            <p className="text-xs text-red-300 max-w-xs mb-4">
              Watch out for invisible trap blocks, fake scam coins, and collapsing platforms!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGuide(true)}
                className="py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                <span>HOW TO PLAY</span>
              </button>
              <button
                onClick={startGame}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START RUN</span>
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <span className="text-4xl mb-1 animate-bounce">💀</span>
            <h4 className="font-extrabold text-red-500 text-base mb-0.5">YOU GOT TROLLED!</h4>
            <p className="text-xs text-yellow-300 font-semibold mb-1 italic">
              &quot;{deathReason}&quot;
            </p>
            <p className="text-[11px] text-gray-400 mb-3">
              Total Deaths: <strong className="text-red-400 font-bold text-xs">{deaths}</strong> • Score: {score}
            </p>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleShareScore}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Troll on Warpcast</span>
              </button>
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <span className="text-3xl mb-1">🏆</span>
            <h4 className="font-extrabold text-yellow-400 text-base mb-1">TRAP MASTER! LEVEL CLEARED</h4>
            <p className="text-xs text-gray-300 mb-1">
              You survived all troll traps! Final Score: <strong className="text-yellow-400 font-bold text-sm">{score}</strong>
            </p>
            <p className="text-[11px] text-green-400 font-semibold mb-3">
              Unlocked +0.2x Airdrop Multiplier!
            </p>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
              <button
                onClick={handleShareScore}
                className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Victory on Warpcast</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between gap-4 select-none touch-none">
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              keysRef.current.left = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              keysRef.current.left = false;
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              keysRef.current.left = false;
            }}
            className="w-13 h-12 px-3.5 py-2.5 rounded-xl bg-gray-800/90 active:bg-blue-600 border border-gray-700 text-white flex items-center justify-center font-bold text-base shadow active:scale-90 transition-transform"
            aria-label="Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              keysRef.current.right = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              keysRef.current.right = false;
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              keysRef.current.right = false;
            }}
            className="w-13 h-12 px-3.5 py-2.5 rounded-xl bg-gray-800/90 active:bg-blue-600 border border-gray-700 text-white flex items-center justify-center font-bold text-base shadow active:scale-90 transition-transform"
            aria-label="Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            keysRef.current.jump = true;
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            keysRef.current.jump = false;
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            keysRef.current.jump = false;
          }}
          className="flex-1 max-w-[170px] h-12 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 active:from-purple-700 active:to-blue-700 border border-purple-400/40 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
          aria-label="Jump"
        >
          <ArrowUp className="w-5 h-5" />
          <span>JUMP</span>
        </button>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141522] border border-gray-800 rounded-2xl max-w-md w-full p-5 relative shadow-2xl space-y-4 text-xs text-gray-300">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">How to Play FarBase Rush</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">🎮 Controls</h4>
                <p className="text-gray-400">Desktop: Use Arrow Keys or A / D to run, Space / Up / W to Jump. Mobile: Tap the on-screen Left, Right, and Jump buttons.</p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">🪙 Scoring &amp; Rewards</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>🔵 <strong>Base Coin:</strong> +20 pts</li>
                  <li>🟣 <strong>Farcaster Coin:</strong> +50 pts</li>
                  <li>❓ <strong>Mystery Block:</strong> +50 pts (hit from below)</li>
                  <li>👾 <strong>Stomp FUD:</strong> +80 pts &amp; bounce</li>
                  <li>🏆 <strong>Goal Flag:</strong> +500 pts</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-200">
                <h4 className="font-bold text-red-300 mb-1">⚠️ Trap Warnings (Cat Mario Style)</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• Invisible blocks over pits will block your jump mid-air.</li>
                  <li>• Platforms marked SAFE will collapse in 0.25s.</li>
                  <li>• Glowing 10K$ coins are fake scam traps.</li>
                  <li>• The goal flag flees on first contact!</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-green-950/30 border border-green-800/40 text-green-200">
                <p>✨ <strong>Airdrop Bonus:</strong> Score 100+ points to unlock an active <strong>+0.2x Multiplier</strong> on your airdrop eligibility!</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold"
            >
              Got It, Let&apos;s Play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { BaseMarioGame as FarBaseRushGame };

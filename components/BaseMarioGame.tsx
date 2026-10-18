'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Play, RotateCcw, Share2, Trophy, Volume2, VolumeX, ArrowLeft, ArrowRight, ArrowUp, Sparkles, Heart } from 'lucide-react';

interface BaseMarioGameProps {
  fid: number | null;
  onHighScoreChange?: (highScore: number) => void;
}

// 8-bit sound generator via Web Audio API
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
      osc.frequency.setValueAtTime(280, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
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

export function BaseMarioGame({ fid, onHighScoreChange }: BaseMarioGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);

  // Controller states
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  const stateRef = useRef({
    gameState: 'idle' as 'idle' | 'playing' | 'gameover' | 'victory',
    score: 0,
    highScore: 0,
    lives: 3,
  });

  // Load high score
  useEffect(() => {
    const key = fid ? `fc_mario_highscore_${fid}` : 'fc_mario_highscore';
    const saved = localStorage.getItem(key);
    if (saved) {
      const val = parseInt(saved, 10) || 0;
      setHighScore(val);
      stateRef.current.highScore = val;
      onHighScoreChange?.(val);
    }
  }, [fid, onHighScoreChange]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
  };

  // Game loop handler
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

    // Game Constants & Level
    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 280;
    const GRAVITY = 0.55;
    const LEVEL_WIDTH = 3200;

    // Player
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

    // Platforms: [x, y, w, h, type: 'ground' | 'brick' | 'question' | 'pipe']
    interface Platform {
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'ground' | 'brick' | 'question' | 'pipe';
      hit?: boolean;
    }

    const platforms: Platform[] = [
      // Main ground segments with pits
      { x: 0, y: 240, w: 700, h: 40, type: 'ground' },
      { x: 780, y: 240, w: 600, h: 40, type: 'ground' },
      { x: 1460, y: 240, w: 700, h: 40, type: 'ground' },
      { x: 2240, y: 240, w: 960, h: 40, type: 'ground' },

      // Pipes
      { x: 260, y: 205, w: 35, h: 35, type: 'pipe' },
      { x: 540, y: 190, w: 35, h: 50, type: 'pipe' },
      { x: 1050, y: 195, w: 35, h: 45, type: 'pipe' },
      { x: 1780, y: 195, w: 35, h: 45, type: 'pipe' },

      // Floating Bricks & Questions
      { x: 160, y: 165, w: 25, h: 25, type: 'question' },
      { x: 185, y: 165, w: 25, h: 25, type: 'brick' },
      { x: 210, y: 165, w: 25, h: 25, type: 'question' },
      { x: 235, y: 165, w: 25, h: 25, type: 'brick' },

      // Section 2
      { x: 380, y: 145, w: 75, h: 20, type: 'brick' },
      { x: 420, y: 95, w: 25, h: 25, type: 'question' },

      // Section 3
      { x: 880, y: 165, w: 25, h: 25, type: 'question' },
      { x: 930, y: 165, w: 60, h: 20, type: 'brick' },
      { x: 1180, y: 155, w: 25, h: 25, type: 'question' },
      { x: 1240, y: 130, w: 75, h: 20, type: 'brick' },

      // Section 4
      { x: 1560, y: 165, w: 25, h: 25, type: 'brick' },
      { x: 1585, y: 165, w: 25, h: 25, type: 'question' },
      { x: 1610, y: 165, w: 25, h: 25, type: 'brick' },
      { x: 1920, y: 140, w: 90, h: 20, type: 'brick' },

      // Stairs leading to flag
      { x: 2600, y: 220, w: 30, h: 20, type: 'brick' },
      { x: 2630, y: 200, w: 30, h: 40, type: 'brick' },
      { x: 2660, y: 180, w: 30, h: 60, type: 'brick' },
      { x: 2690, y: 160, w: 30, h: 80, type: 'brick' },
    ];

    // Collectibles: Coins (Base & Farcaster)
    interface Coin {
      x: number;
      y: number;
      type: 'base' | 'farcaster';
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
      { x: 955, y: 135, type: 'base', collected: false, tick: 6 },
      { x: 1192, y: 125, type: 'base', collected: false, tick: 7 },
      { x: 1270, y: 100, type: 'farcaster', collected: false, tick: 8 },
      { x: 1597, y: 135, type: 'farcaster', collected: false, tick: 9 },
      { x: 1965, y: 110, type: 'base', collected: false, tick: 10 },
      { x: 2350, y: 205, type: 'base', collected: false, tick: 11 },
      { x: 2400, y: 205, type: 'farcaster', collected: false, tick: 12 },
    ];

    // Enemies (FUD Monsters)
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

    // Goal Flag Pole
    const flag = {
      x: 2850,
      y: 90,
      w: 8,
      h: 150,
      reached: false,
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

    let animationFrameId: number;
    let cameraX = 0;

    const gameLoop = () => {
      if (stateRef.current.gameState !== 'playing') return;

      // 1. Controls & Player Physics
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

      // Apply Gravity
      player.vy += GRAVITY;
      if (player.vy > 11) player.vy = 11;

      // Invulnerability tick
      if (player.invulnerable > 0) player.invulnerable--;

      // Move X & Check Platform Collision
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

      // Move Y & Check Platform Collision
      player.grounded = false;
      player.y += player.vy;

      for (const p of platforms) {
        if (
          player.x < p.x + p.w &&
          player.x + player.width > p.x &&
          player.y < p.y + p.h &&
          player.y + player.height > p.y
        ) {
          // Landing on platform
          if (player.vy > 0 && player.y + player.height - player.vy <= p.y + 4) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
          }
          // Hitting platform from below (Mario question/brick bump)
          else if (player.vy < 0 && player.y - player.vy >= p.y + p.h - 6) {
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

      // Bottom pit death
      if (player.y > CANVAS_HEIGHT + 30) {
        stateRef.current.lives--;
        setLives(stateRef.current.lives);
        if (stateRef.current.lives <= 0) {
          audio.gameOver();
          endGame('gameover');
          return;
        } else {
          // Respawn at safe spot
          player.x = Math.max(60, player.x - 200);
          player.y = 120;
          player.vy = 0;
          player.invulnerable = 60;
        }
      }

      // 2. Collect Coins
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
            audio.coin();
            const gain = coin.type === 'farcaster' ? 50 : 20;
            stateRef.current.score += gain;
            setScore(stateRef.current.score);
            spawnFloatingText(coin.x, coin.y - 10, `+${gain}`, coin.type === 'farcaster' ? '#C084FC' : '#60A5FA');
            spawnParticles(coin.x, coin.y, coin.type === 'farcaster' ? '#9333EA' : '#0052FF', 8);
          }
        }
      }

      // 3. Enemies movement and collision
      for (const enemy of enemies) {
        if (enemy.alive) {
          enemy.x += enemy.vx;
          if (enemy.x <= enemy.rangeStart || enemy.x >= enemy.rangeEnd) {
            enemy.vx *= -1;
          }

          // Player vs Enemy collision
          if (
            player.x < enemy.x + enemy.w &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.h &&
            player.y + player.height > enemy.y
          ) {
            // Stomp on top
            if (player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 8) {
              enemy.alive = false;
              player.vy = -7; // Bounce
              audio.stomp();
              stateRef.current.score += 80;
              setScore(stateRef.current.score);
              spawnFloatingText(enemy.x, enemy.y - 10, '+80 STOMP!', '#34D399');
              spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#EF4444', 12);
            } else if (player.invulnerable <= 0) {
              // Side hit: lose life
              stateRef.current.lives--;
              setLives(stateRef.current.lives);
              audio.stomp();
              if (stateRef.current.lives <= 0) {
                audio.gameOver();
                endGame('gameover');
                return;
              } else {
                player.invulnerable = 60;
                player.vy = -5;
                player.vx = player.facing === 'right' ? -4 : 4;
              }
            }
          }
        }
      }

      // 4. Flag Goal Reached
      if (player.x + player.width >= flag.x && !flag.reached) {
        flag.reached = true;
        audio.powerUp();
        stateRef.current.score += 500;
        setScore(stateRef.current.score);
        spawnFloatingText(flag.x, flag.y, '+500 GOAL! 🏆', '#FBBF24');
        setTimeout(() => {
          endGame('victory');
        }, 800);
      }

      // 5. Camera follow player
      cameraX = Math.max(0, Math.min(LEVEL_WIDTH - CANVAS_WIDTH, player.x - CANVAS_WIDTH / 3));

      // 6. RENDER EVERYTHING
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sky Background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Parallax Clouds
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

      // Draw Platforms
      for (const p of platforms) {
        if (p.x + p.w < cameraX - 20 || p.x > cameraX + CANVAS_WIDTH + 20) continue;

        if (p.type === 'ground') {
          // Base L2 Blue Ground Block
          ctx.fillStyle = '#0052FF';
          ctx.fillRect(p.x, p.y, p.w, 8); // Top blue beam
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
          // Grid lines
          ctx.strokeStyle = '#1e293b';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
        } else if (p.type === 'pipe') {
          // Retro Tech Pipe
          ctx.fillStyle = '#059669';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#10B981';
          ctx.fillRect(p.x - 3, p.y, p.w + 6, 10);
          ctx.strokeStyle = '#064E3B';
          ctx.strokeRect(p.x - 3, p.y, p.w + 6, 10);
        } else if (p.type === 'question') {
          // Mystery Question block
          ctx.fillStyle = p.hit ? '#4B5563' : '#F59E0B';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#78350F';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.hit ? '•' : '?', p.x + p.w / 2, p.y + p.h / 2 + 5);
        } else if (p.type === 'brick') {
          // Farcaster Purple Brick
          ctx.fillStyle = '#855DCD';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#4C1D95';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          // Brick texture lines
          ctx.fillStyle = '#6D28D9';
          ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, p.h / 2 - 2);
        }
      }

      // Draw Coins
      for (const coin of coins) {
        if (!coin.collected && coin.x > cameraX - 20 && coin.x < cameraX + CANVAS_WIDTH + 20) {
          const bounce = Math.sin(coin.tick * 0.1) * 3;
          ctx.save();
          ctx.translate(coin.x, coin.y + bounce);
          if (coin.type === 'farcaster') {
            // Farcaster Purple Coin
            ctx.fillStyle = '#855DCD';
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🟣', 0, 4);
          } else {
            // Base Blue Coin
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

      // Draw Enemies (FUD Monster)
      for (const enemy of enemies) {
        if (enemy.alive && enemy.x > cameraX - 30 && enemy.x < cameraX + CANVAS_WIDTH + 30) {
          ctx.fillStyle = '#DC2626'; // Red body
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.w / 2, enemy.y + 8, 10, Math.PI, 0);
          ctx.lineTo(enemy.x + enemy.w, enemy.y + enemy.h);
          ctx.lineTo(enemy.x, enemy.y + enemy.h);
          ctx.fill();

          // Angry eyes
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(enemy.x + 3, enemy.y + 6, 4, 4);
          ctx.fillRect(enemy.x + 13, enemy.y + 6, 4, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(enemy.x + (enemy.vx > 0 ? 5 : 3), enemy.y + 7, 2, 2);
          ctx.fillRect(enemy.x + (enemy.vx > 0 ? 15 : 13), enemy.y + 7, 2, 2);

          // "FUD" label
          ctx.fillStyle = '#FEF2F2';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FUD', enemy.x + enemy.w / 2, enemy.y + enemy.h - 2);
        }
      }

      // Draw Flag
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(flag.x, flag.y, flag.w, flag.h);
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.arc(flag.x + flag.w / 2, flag.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Flag Cloth
      ctx.fillStyle = '#0052FF';
      ctx.beginPath();
      ctx.moveTo(flag.x + flag.w, flag.y + 10);
      ctx.lineTo(flag.x + flag.w + 35, flag.y + 25);
      ctx.lineTo(flag.x + flag.w, flag.y + 40);
      ctx.fill();

      // Draw Player (Farcaster Builder Mario)
      if (player.invulnerable % 8 < 4) {
        ctx.save();
        ctx.translate(player.x, player.y);
        if (player.facing === 'left') {
          ctx.translate(player.width, 0);
          ctx.scale(-1, 1);
        }

        // Cap (Farcaster Purple)
        ctx.fillStyle = '#855DCD';
        ctx.fillRect(2, 0, 16, 6);
        ctx.fillRect(6, 2, 14, 4); // Visor

        // Face & Skin
        ctx.fillStyle = '#FDE047';
        ctx.fillRect(4, 6, 12, 7);
        // Eye
        ctx.fillStyle = '#1E1B4B';
        ctx.fillRect(12, 7, 3, 3);
        // Moustache
        ctx.fillStyle = '#451A03';
        ctx.fillRect(10, 11, 7, 2);

        // Overalls (Base Blue Shirt + Purple Suspender)
        ctx.fillStyle = '#0052FF';
        ctx.fillRect(3, 13, 14, 8);
        ctx.fillStyle = '#855DCD';
        ctx.fillRect(6, 13, 3, 8);
        ctx.fillRect(12, 13, 3, 8);

        // Shoes
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

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        if (pt.life <= 0) particles.splice(i, 1);
      }

      // Draw Floating Texts
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

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const endGame = (outcome: 'gameover' | 'victory') => {
      cancelAnimationFrame(animationFrameId);
      setGameState(outcome);
      stateRef.current.gameState = outcome;

      // Update High Score
      const finalScore = stateRef.current.score;
      if (finalScore > stateRef.current.highScore) {
        setHighScore(finalScore);
        stateRef.current.highScore = finalScore;
        const key = fid ? `fc_mario_highscore_${fid}` : 'fc_mario_highscore';
        try {
          localStorage.setItem(key, finalScore.toString());
        } catch {}
        onHighScoreChange?.(finalScore);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fid, onHighScoreChange]);

  // Keyboard Event Listeners
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

  // Share score on Warpcast
  const handleShareScore = async () => {
    const castText = `🎮 I just scored ${score} pts in Base Mario Arcade on @farcaster! 🪂🔥\n\nCan you beat my high score? Play and farm your builder airdrop on Base:`;
    const frameUrl = 'https://farcaster-frame-sepia.vercel.app';

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
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-base shadow-lg">
            🎮
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>Base Mario: Farcaster Jump</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                L2 Canvas
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Nhảy vượt chướng ngại vật &amp; đạp quái FUD nhận Airdrop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-1 bg-yellow-950/40 border border-yellow-800/40 px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{highScore}</span>
          </div>
        </div>
      </div>

      {/* Lives & Score Bar */}
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
            Điểm: <strong className="text-white text-sm">{score}</strong>
          </span>
          {score >= 100 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-950/40 border border-green-800/40 px-2 py-0.5 rounded-full font-bold">
              <Sparkles className="w-3 h-3" /> +0.2x Multiplier
            </span>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full rounded-xl overflow-hidden border-2 border-gray-800 bg-[#0a0a14] aspect-[480/280] shadow-inner">
        <canvas
          ref={canvasRef}
          width={480}
          height={280}
          className="w-full h-full block image-pixelated"
        />

        {/* Start / Idle Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-2xl shadow-xl mb-3 animate-bounce">
              🪂
            </div>
            <h4 className="font-extrabold text-white text-base mb-1">Super Builder Mario</h4>
            <p className="text-xs text-gray-300 max-w-xs mb-4">
              Dùng phím mũi tên hoặc nút cảm ứng để nhảy, ăn Coin 🔵🟣 và đạp quái FUD!
            </p>
            <button
              onClick={startGame}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>BẮT ĐẦU CHƠI</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <span className="text-3xl mb-1">💥</span>
            <h4 className="font-extrabold text-red-500 text-base mb-1">GAME OVER</h4>
            <p className="text-xs text-gray-300 mb-3">
              Điểm đạt được: <strong className="text-yellow-400 font-bold text-sm">{score}</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại</span>
              </button>
              <button
                onClick={handleShareScore}
                className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Warpcast</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <span className="text-3xl mb-1">🏆</span>
            <h4 className="font-extrabold text-yellow-400 text-base mb-1">VICTORY! CLEAR LEVEL</h4>
            <p className="text-xs text-gray-300 mb-1">
              Bạn đã về đích an toàn! Tổng điểm: <strong className="text-yellow-400 font-bold text-sm">{score}</strong>
            </p>
            <p className="text-[11px] text-green-400 font-semibold mb-3">
              Đã mở khóa thưởng Multiplier Airdrop!
            </p>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại</span>
              </button>
              <button
                onClick={handleShareScore}
                className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Khoe điểm Feed</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controller (Dedicated On-Screen D-Pad & Jump) */}
      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between gap-4 select-none touch-none">
        {/* Left & Right D-Pad */}
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
            aria-label="Trái"
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
            aria-label="Phải"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Jump Button */}
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
          aria-label="Nhảy"
        >
          <ArrowUp className="w-5 h-5" />
          <span>NHẢY (JUMP)</span>
        </button>
      </div>
    </div>
  );
}

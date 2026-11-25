'use client';

import { useEffect, useRef, useState, useCallback, type PointerEvent } from 'react';
import {
  Play,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Heart,
  HelpCircle,
  X,
  Lock,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  Flag,
  Zap,
  Clock,
  Trophy,
  Skull,
} from 'lucide-react';
import { shareCast } from './ShareCastCard';
import { LEVELS, POINTS, dailyLevel, dailyNumber, type PlatformType } from '@/lib/levels';
import { formatUtcCountdown, I18N, type DeathCause, type Locale } from '@/lib/i18n';

interface BaseMarioGameProps {
  locale: Locale;
  fid: number | null;
  onHighScoreChange?: (highScore: number) => void;
  onDailyRunEnd?: (run: { day: number; score: number }) => void;
}

class RetroAudio {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private play(
    type: OscillatorType,
    freqs: [number, number] | number[],
    dur: number,
    vol: number,
    ramp?: 'exp' | 'lin'
  ) {
    if (!this.enabled || typeof window === 'undefined' || !('AudioContext' in window)) return;
    try {
      this.ctx ??= new window.AudioContext();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      if (ramp && freqs.length === 2) {
        osc.frequency.setValueAtTime(freqs[0], t0);
        if (ramp === 'lin') osc.frequency.linearRampToValueAtTime(freqs[1], t0 + dur);
        else osc.frequency.exponentialRampToValueAtTime(freqs[1], t0 + dur);
      } else {
        freqs.forEach((f, i) => osc.frequency.setValueAtTime(f, t0 + i * 0.055));
      }
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.01, t0 + dur);
      osc.start(t0);
      osc.stop(t0 + dur);
    } catch {}
  }

  jump() {
    this.play('square', [170, 480], 0.11, 0.13, 'exp');
  }
  coin() {
    this.play('sine', [987, 987, 1318], 0.25, 0.18);
  }
  stomp() {
    this.play('triangle', [210, 48], 0.14, 0.28, 'exp');
  }
  bonk() {
    this.play('sawtooth', [420, 68], 0.2, 0.3, 'exp');
  }
  powerUp() {
    this.play('triangle', [330, 392, 523, 659, 784], 0.34, 0.18);
  }
  gameOver() {
    this.play('sawtooth', [280, 75], 0.45, 0.24, 'lin');
  }
}

const audio = new RetroAudio();

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 280;

const STARS = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 97 + 23) % CANVAS_WIDTH,
  y: (i * 43 + 13) % 140,
  r: i % 4 === 0 ? 1.5 : 1,
  phase: i * 0.7,
}));

const BUILDINGS = [
  { x: 0, w: 38, h: 86, win: true },
  { x: 44, w: 28, h: 62, win: false },
  { x: 78, w: 46, h: 108, win: true },
  { x: 130, w: 32, h: 74, win: false },
  { x: 168, w: 52, h: 96, win: true },
  { x: 226, w: 34, h: 68, win: true },
  { x: 266, w: 44, h: 114, win: true },
  { x: 316, w: 36, h: 78, win: false },
];
const SKYLINE_SPAN = 358;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

function setupHiDpiCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const targetW = Math.round(CANVAS_WIDTH * dpr);
  const targetH = Math.round(CANVAS_HEIGHT * dpr);
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawBackdrop(ctx: CanvasRenderingContext2D, cameraX: number, tick: number, reducedMotion: boolean) {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, '#0a0d12');
  sky.addColorStop(0.6, '#101620');
  sky.addColorStop(1, '#162030');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Base Cobalt orbital beacon
  const moonX = 396 - (cameraX * 0.04) % 80;
  ctx.fillStyle = 'rgba(0, 82, 255, 0.14)';
  ctx.beginPath();
  ctx.arc(moonX, 50, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
  ctx.beginPath();
  ctx.arc(moonX, 50, 16, 0, Math.PI * 2);
  ctx.fill();

  for (const s of STARS) {
    const alpha = reducedMotion ? 0.45 : 0.25 + 0.4 * Math.abs(Math.sin(tick * 0.03 + s.phase));
    ctx.fillStyle = `rgba(203, 213, 225, ${alpha.toFixed(2)})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }

  // Far industrial skyline
  const skyShift = (cameraX * 0.18) % SKYLINE_SPAN;
  for (let rep = -1; rep <= 2; rep++) {
    const base = rep * SKYLINE_SPAN - skyShift;
    for (const b of BUILDINGS) {
      const bx = base + b.x;
      if (bx + b.w < -10 || bx > CANVAS_WIDTH + 10) continue;
      const by = 240 - b.h;
      ctx.fillStyle = '#0e131b';
      ctx.fillRect(bx, by, b.w, b.h);
      ctx.strokeStyle = 'rgba(54, 61, 74, 0.5)';
      ctx.strokeRect(bx + 0.5, by + 0.5, b.w - 1, b.h - 1);

      if (b.win) {
        ctx.fillStyle = 'rgba(96, 165, 250, 0.16)';
        for (let wy = by + 10; wy < 232; wy += 14) {
          ctx.fillRect(bx + 6, wy, 5, 4);
          if (b.w > 36) ctx.fillRect(bx + b.w - 12, wy, 5, 4);
        }
      }
    }
  }

  // Midground slate ridges
  const ridgeShift = (cameraX * 0.38) % 240;
  ctx.fillStyle = '#141c27';
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-20, 242);
  for (let rx = -240; rx <= CANVAS_WIDTH + 240; rx += 120) {
    const px = rx - ridgeShift;
    ctx.lineTo(px + 40, 200);
    ctx.lineTo(px + 85, 218);
    ctx.lineTo(px + 120, 192);
  }
  ctx.lineTo(CANVAS_WIDTH + 20, 242);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawRunner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  facing: 'left' | 'right',
  grounded: boolean,
  vx: number,
  vy: number,
  animTick: number,
  invulnerable: number
) {
  ctx.save();
  ctx.translate(x, y);

  if (invulnerable > 0) {
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, 13, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  if (facing === 'left') {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  // Signal Orange scarf
  const moving = Math.abs(vx) > 0.4 || !grounded;
  const wave = moving ? Math.sin(animTick * 1.8) * 2.5 : 0;
  ctx.fillStyle = '#FF5500';
  ctx.beginPath();
  ctx.moveTo(4, 11);
  ctx.lineTo(-6 - (moving ? 3 : 0), 13 + wave);
  ctx.lineTo(-4, 17 + wave * 0.6);
  ctx.lineTo(5, 14);
  ctx.closePath();
  ctx.fill();

  // White/slate tactical helmet
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(3, 0, 14, 4);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(2, 3, 16, 9);

  // Cyan-blue visor
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(9, 5, 8, 4);
  ctx.fillStyle = '#E0F2FE';
  ctx.fillRect(13, 6, 3, 2);

  // Base Cobalt suit torso
  ctx.fillStyle = '#0052FF';
  ctx.fillRect(3, 12, 14, 9);
  ctx.fillStyle = '#93C5FD';
  ctx.fillRect(7, 14, 6, 5);

  // Boots
  ctx.fillStyle = '#E2E8F0';
  if (!grounded) {
    const tuck = vy < 0 ? -2 : 1;
    ctx.fillRect(2, 20 + tuck, 6, 5);
    ctx.fillRect(12, 19 + tuck, 6, 5);
  } else if (Math.abs(vx) > 0.4) {
    const stride = Math.sin(animTick * Math.PI) * 3.2;
    ctx.fillRect(2 + stride, 21, 6, 5);
    ctx.fillRect(12 - stride, 21, 6, 5);
  } else {
    ctx.fillRect(3, 21, 6, 5);
    ctx.fillRect(11, 21, 6, 5);
  }

  ctx.restore();
}

export function BaseMarioGame({ locale, fid, onHighScoreChange, onDailyRunEnd }: BaseMarioGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const guideRef = useRef<HTMLDialogElement | null>(null);
  const cleanupLoopRef = useRef<(() => void) | null>(null);
  const localeRef = useRef<Locale>(locale);
  localeRef.current = locale;

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [deathCause, setDeathCause] = useState<DeathCause>('pit');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(5);
  const [progressPct, setProgressPct] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [dailyDay, setDailyDay] = useState<number | null>(null);
  const [dailyBest, setDailyBest] = useState(0);
  const [utcCountdown, setUtcCountdown] = useState(() => formatUtcCountdown());
  const [padActive, setPadActive] = useState<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

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
    deathCause: 'pit' as DeathCause,
    lives: 5,
  });

  const t = I18N[locale];
  const unlockedKey = fid ? `fc_farbase_unlocked_${fid}` : 'fc_farbase_unlocked';
  const today = dailyNumber();
  const stageTitle =
    dailyDay !== null
      ? `${t.modeDaily} #${dailyDay}`
      : `${levelIndex + 1}. ${t.levelNames[levelIndex] ?? LEVELS[levelIndex].name}`;

  useEffect(() => {
    const timer = setInterval(() => setUtcCountdown(formatUtcCountdown()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const key = fid ? `fc_farbase_highscore_${fid}` : 'fc_farbase_highscore';
    const deathKey = fid ? `fc_farbase_deaths_${fid}` : 'fc_farbase_deaths';
    try {
      const savedScore = localStorage.getItem(key);
      if (savedScore) {
        const val = parseInt(savedScore, 10) || 0;
        setHighScore(val);
        stateRef.current.highScore = val;
        onHighScoreChange?.(val);
      }

      const savedDeaths = localStorage.getItem(deathKey);
      if (savedDeaths) {
        const dVal = parseInt(savedDeaths, 10) || 0;
        setDeaths(dVal);
        stateRef.current.deaths = dVal;
      }

      const savedUnlocked = parseInt(localStorage.getItem(unlockedKey) || '0', 10) || 0;
      setUnlockedLevel(Math.min(Math.max(savedUnlocked, 0), LEVELS.length - 1));

      const dayKey = fid ? `fc_farbase_daily_${dailyNumber()}_${fid}` : `fc_farbase_daily_${dailyNumber()}`;
      setDailyBest(parseInt(localStorage.getItem(dayKey) || '0', 10) || 0);
    } catch {}
  }, [fid, onHighScoreChange, unlockedKey]);

  useEffect(() => {
    if (gameState !== 'idle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupHiDpiCanvas(canvas);
    if (!ctx) return;

    drawBackdrop(ctx, 0, 12, true);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 240, CANVAS_WIDTH, 40);
    ctx.fillStyle = '#0052FF';
    ctx.fillRect(0, 240, CANVAS_WIDTH, 5);
    ctx.fillStyle = '#60A5FA';
    ctx.fillRect(0, 240, CANVAS_WIDTH, 1.5);
    drawRunner(ctx, 72, 214, 20, 'right', true, 0, 0, 0, 0);
  }, [gameState]);

  useEffect(() => {
    return () => {
      cleanupLoopRef.current?.();
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
  };

  const setKey = (key: 'left' | 'right' | 'jump', pressed: boolean) => {
    keysRef.current[key] = pressed;
    setPadActive((prev) => (prev[key] === pressed ? prev : { ...prev, [key]: pressed }));
  };

  const startGame = useCallback(
    (levelIdx: number | 'daily', keepScore = false) => {
      cleanupLoopRef.current?.();

      const day = dailyNumber();
      const level = levelIdx === 'daily' ? dailyLevel(day) : LEVELS[levelIdx];
      const startScore = keepScore ? stateRef.current.score : 0;

      setGameState('playing');
      if (levelIdx === 'daily') {
        setDailyDay(day);
      } else {
        setDailyDay(null);
        setLevelIndex(levelIdx);
      }
      setScore(startScore);
      setLives(5);
      setProgressPct(0);
      stateRef.current.gameState = 'playing';
      stateRef.current.score = startScore;
      stateRef.current.lives = 5;
      stateRef.current.deathCause = 'pit';

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = setupHiDpiCanvas(canvas);
      if (!ctx) return;

      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      const GRAVITY = 0.55;
      const LEVEL_WIDTH = level.width;
      const finalGoalX = level.fleeTo.length ? level.fleeTo[level.fleeTo.length - 1] : level.flagX;

      const player = {
        x: 60,
        y: 180,
        width: 20,
        height: 26,
        vx: 0,
        vy: 0,
        speed: 3.5,
        jumpForce: -11.0,
        grounded: false,
        wasGrounded: false,
        facing: 'right' as 'left' | 'right',
        invulnerable: 0,
        animTick: 0,
      };

      interface Platform {
        x: number;
        y: number;
        w: number;
        h: number;
        type: PlatformType;
        hit?: boolean;
        shake?: number;
        falling?: boolean;
        fallSpeed?: number;
      }

      const platforms: Platform[] = level.platforms.map((p) => ({ ...p }));
      const trollBlocks = level.trollBlocks.map((tb) => ({ ...tb, revealed: false }));
      const coins = level.coins.map((c, i) => ({ ...c, collected: false, tick: i * 4 }));
      const enemies = level.enemies.map((e) => ({ ...e, y: 220, w: 20, h: 20, alive: true }));

      const flag = {
        x: level.flagX,
        y: 90,
        w: 8,
        h: 150,
        reached: false,
        flees: 0,
      };

      const particles: Particle[] = [];
      const floatingTexts: FloatingText[] = [];
      let shakeTicks = 0;
      let shakeMag = 0;
      let worldTick = 0;
      let pendingCause: DeathCause | null = null;

      const triggerShake = (ticks: number, mag: number) => {
        if (reducedMotion) return;
        shakeTicks = Math.max(shakeTicks, ticks);
        shakeMag = Math.max(shakeMag, mag);
      };

      const spawnParticles = (x: number, y: number, color: string, count = 8, size = 3) => {
        if (reducedMotion) return;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.8 + 0.8;
          const maxLife = 18 + Math.floor(Math.random() * 12);
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            color,
            size,
            life: maxLife,
            maxLife,
          });
        }
      };

      const spawnDust = (x: number, y: number) => spawnParticles(x, y, '#94A3B8', 5, 2.5);

      const spawnFloatingText = (x: number, y: number, text: string, color = '#FBBF24') => {
        floatingTexts.push({ x, y, text, color, life: 38 });
      };

      let animationFrameId: number | null = null;
      let victoryTimer: ReturnType<typeof setTimeout> | null = null;
      let cameraX = 0;

      const endGame = (outcome: 'gameover' | 'victory') => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        if (victoryTimer !== null) {
          clearTimeout(victoryTimer);
          victoryTimer = null;
        }
        setGameState(outcome);
        stateRef.current.gameState = outcome;

        if (levelIdx === 'daily') {
          const dayKey = fid ? `fc_farbase_daily_${day}_${fid}` : `fc_farbase_daily_${day}`;
          try {
            const prevBest = parseInt(localStorage.getItem(dayKey) || '0', 10) || 0;
            if (stateRef.current.score > prevBest) {
              localStorage.setItem(dayKey, stateRef.current.score.toString());
            }
            if (day === dailyNumber()) {
              setDailyBest(Math.max(prevBest, stateRef.current.score));
            }
          } catch {}
          onDailyRunEnd?.({ day, score: stateRef.current.score });
        } else if (outcome === 'victory' && levelIdx + 1 < LEVELS.length) {
          setUnlockedLevel((prev) => {
            const next = Math.max(prev, levelIdx + 1);
            try {
              localStorage.setItem(unlockedKey, next.toString());
            } catch {}
            return next;
          });
        }

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

      const recordDeath = (explicitCause?: DeathCause) => {
        const cause = explicitCause ?? pendingCause ?? 'pit';
        pendingCause = null;

        stateRef.current.lives--;
        setLives(stateRef.current.lives);
        stateRef.current.deaths++;
        setDeaths(stateRef.current.deaths);
        stateRef.current.deathCause = cause;
        setDeathCause(cause);
        triggerShake(14, 5);

        const deathKey = fid ? `fc_farbase_deaths_${fid}` : 'fc_farbase_deaths';
        try {
          localStorage.setItem(deathKey, stateRef.current.deaths.toString());
        } catch {}

        if (stateRef.current.lives <= 0) {
          audio.gameOver();
          endGame('gameover');
        } else {
          audio.bonk();
          let safeX = level.checkpoints[0];
          for (const sx of level.checkpoints) {
            if (sx <= player.x) safeX = sx;
          }
          player.x = safeX;
          player.y = 150;
          player.vx = 0;
          player.vy = 0;
          player.grounded = false;
          player.invulnerable = 120;
        }
      };

      const FRAME_MS = 1000 / 60;
      let lastNow: number | null = null;
      let tickBudget = FRAME_MS;

      const gameLoop = (now: number) => {
        if (stateRef.current.gameState !== 'playing') return;
        tickBudget = Math.min(tickBudget + (lastNow === null ? 0 : now - lastNow), FRAME_MS * 2);
        lastNow = now;
        if (tickBudget < FRAME_MS - 1) {
          animationFrameId = requestAnimationFrame(gameLoop);
          return;
        }
        tickBudget -= FRAME_MS;
        worldTick++;

        const tr = I18N[localeRef.current];
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
          spawnDust(player.x + player.width / 2, player.y + player.height);
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
          if (p.type === 'rugpull' || p.type === 'hollow_column') {
            if (p.shake && p.shake > 0) {
              p.shake--;
              if (p.shake === 0) {
                p.falling = true;
                p.fallSpeed = 2;
                audio.bonk();
                triggerShake(8, 3);
                pendingCause = p.type === 'hollow_column' ? 'hollow' : 'rugpull';
                spawnFloatingText(
                  p.x + p.w / 2,
                  p.y - 12,
                  p.type === 'hollow_column' ? tr.floatHollow : tr.floatRug,
                  '#EF4444'
                );
                spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#FF5500', 10);
              }
            } else if (p.falling) {
              p.fallSpeed = (p.fallSpeed || 2) + 0.6;
              p.y += p.fallSpeed;
            }
          }
        }

        player.wasGrounded = player.grounded;
        player.grounded = false;
        player.y += player.vy;

        const hitQuestion = (p: Platform) => {
          if (p.type !== 'question' || p.hit) return false;
          p.hit = true;
          audio.powerUp();
          stateRef.current.score += POINTS.question;
          setScore(stateRef.current.score);
          spawnFloatingText(p.x + p.w / 2, p.y - 12, `+${POINTS.question}`, '#FBBF24');
          spawnParticles(p.x + p.w / 2, p.y, '#F59E0B', 10);
          return true;
        };

        for (const p of platforms) {
          if (
            player.x < p.x + p.w &&
            player.x + player.width > p.x &&
            player.y < p.y + p.h &&
            player.y + player.height > p.y
          ) {
            if (player.vy > 0 && player.y + player.height - player.vy <= p.y + 4) {
              const impactVy = player.vy;
              player.y = p.y - player.height;
              player.vy = 0;
              player.grounded = true;
              if (!player.wasGrounded && impactVy > 4.5) {
                spawnDust(player.x + player.width / 2, player.y + player.height);
              }

              if (p.type === 'rugpull' && !p.falling && !p.shake) {
                p.shake = 22;
                pendingCause = 'rugpull';
              }
              if (p.type === 'hollow_column' && !p.falling && !p.shake) {
                p.shake = 16;
                pendingCause = 'hollow';
              }
              hitQuestion(p);
            } else if (player.vy < 0 && player.y - player.vy >= p.y + p.h - 6) {
              player.y = p.y + p.h;
              player.vy = 2;

              if (!hitQuestion(p) && p.type === 'brick') {
                audio.stomp();
                spawnParticles(p.x + p.w / 2, p.y + p.h, '#94A3B8', 4);
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
              triggerShake(10, 4);
              pendingCause = tb.gas ? 'gas' : 'invisible';
              spawnFloatingText(tb.x + tb.w / 2, tb.y - 12, tr.floatTrap, '#EF4444');
              spawnParticles(tb.x + tb.w / 2, tb.y + tb.h / 2, '#EF4444', 12);
              player.y = tb.y + tb.h;
              player.vy = 5;
              player.vx = 0;
            } else {
              if (player.vy > 0 && player.y + player.height - player.vy <= tb.y + 6) {
                player.y = tb.y - player.height;
                player.vy = 0;
                player.grounded = true;
              } else if (player.vy < 0) {
                player.y = tb.y + tb.h;
                player.vy = 3;
              } else {
                if (player.vx > 0) player.x = tb.x - player.width;
                else if (player.vx < 0) player.x = tb.x + tb.w;
              }
            }
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
                triggerShake(9, 3.5);
                pendingCause = 'scam';
                stateRef.current.score = Math.max(0, stateRef.current.score - POINTS.fakePenalty);
                setScore(stateRef.current.score);
                spawnFloatingText(coin.x, coin.y - 14, tr.floatScam(POINTS.fakePenalty), '#EF4444');
                spawnParticles(coin.x, coin.y, '#EF4444', 14);
                player.vx = player.facing === 'right' ? -8 : 8;
                player.vy = -6;
              } else {
                audio.coin();
                const gain = POINTS[coin.type];
                stateRef.current.score += gain;
                setScore(stateRef.current.score);
                spawnFloatingText(
                  coin.x,
                  coin.y - 10,
                  `+${gain}`,
                  coin.type === 'farcaster' ? '#FDBA74' : '#93C5FD'
                );
                spawnParticles(
                  coin.x,
                  coin.y,
                  coin.type === 'farcaster' ? '#FF5500' : '#3B82F6',
                  8
                );
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
                triggerShake(5, 2);
                stateRef.current.score += POINTS.stomp;
                setScore(stateRef.current.score);
                spawnFloatingText(enemy.x + 10, enemy.y - 10, tr.floatStomp(POINTS.stomp), '#34D399');
                spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#EF4444', 12);
              } else if (player.invulnerable <= 0) {
                recordDeath('fud');
                if (stateRef.current.gameState !== 'playing') return;
              }
            }
          }
        }

        if (flag.flees < level.fleeTo.length && player.x + player.width >= flag.x - 40) {
          spawnFloatingText(flag.x, 108, tr.floatFakeFlag, '#FBBF24');
          spawnParticles(flag.x, 120, '#FBBF24', 15);
          triggerShake(7, 2.5);
          flag.x = level.fleeTo[flag.flees];
          flag.flees++;
          audio.bonk();
        } else if (player.x + player.width >= flag.x && !flag.reached) {
          flag.reached = true;
          audio.powerUp();
          stateRef.current.score += POINTS.flag;
          setScore(stateRef.current.score);
          setProgressPct(100);
          spawnFloatingText(flag.x, flag.y - 6, tr.floatGoal(POINTS.flag), '#FBBF24');
          spawnParticles(flag.x + 4, flag.y + 24, '#3B82F6', 18);
          victoryTimer = setTimeout(() => {
            endGame('victory');
          }, 750);
        }

        if (worldTick % 6 === 0 && !flag.reached) {
          const pct = Math.min(99, Math.max(0, Math.round((player.x / finalGoalX) * 100)));
          setProgressPct(pct);
        }

        if (player.grounded && Math.abs(player.vx) > 0.5) {
          player.animTick = (player.animTick + 0.24) % 4;
        }

        cameraX = Math.max(0, Math.min(LEVEL_WIDTH - CANVAS_WIDTH, player.x - CANVAS_WIDTH / 3));

        let shakeX = 0;
        let shakeY = 0;
        if (shakeTicks > 0) {
          shakeX = (Math.random() - 0.5) * shakeMag * 2;
          shakeY = (Math.random() - 0.5) * shakeMag * 1.4;
          shakeTicks--;
          if (shakeTicks === 0) shakeMag = 0;
        }

        ctx.save();
        ctx.translate(shakeX, shakeY);
        drawBackdrop(ctx, cameraX, worldTick, reducedMotion);

        ctx.save();
        ctx.translate(-cameraX, 0);

        // Platforms
        for (const p of platforms) {
          if (p.x + p.w < cameraX - 24 || p.x > cameraX + CANVAS_WIDTH + 24) continue;

          if (p.type === 'ground') {
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(p.x, p.y, p.w, p.h);

            ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.beginPath();
            for (let gx = p.x + 24; gx < p.x + p.w; gx += 28) {
              ctx.moveTo(gx, p.y + 6);
              ctx.lineTo(gx, p.y + p.h);
            }
            ctx.stroke();

            ctx.fillStyle = '#0052FF';
            ctx.fillRect(p.x, p.y, p.w, 6);
            ctx.fillStyle = '#60A5FA';
            ctx.fillRect(p.x, p.y, p.w, 1.5);

            ctx.fillStyle = '#1f2937';
            ctx.fillRect(p.x, p.y + 6, 2, p.h - 6);
            ctx.fillRect(p.x + p.w - 2, p.y + 6, 2, p.h - 6);
          } else if (p.type === 'rugpull') {
            const jitterX = p.shake && !reducedMotion ? (Math.random() - 0.5) * 5 : 0;
            const danger = Boolean(p.falling || p.shake);
            ctx.fillStyle = danger ? '#B91C1C' : '#334155';
            ctx.fillRect(p.x + jitterX, p.y, p.w, p.h);
            ctx.fillStyle = danger ? '#FF5500' : '#F59E0B';
            ctx.fillRect(p.x + jitterX, p.y, p.w, 3);
            ctx.strokeStyle = danger ? '#EF4444' : '#64748B';
            ctx.strokeRect(p.x + jitterX + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px ui-sans-serif, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
              p.falling ? tr.tagRug : p.shake ? tr.tagRun : tr.tagSafe,
              p.x + p.w / 2 + jitterX,
              p.y + p.h / 2 + 3.5
            );
          } else if (p.type === 'pipe' || p.type === 'hollow_column') {
            const jitterX = p.shake && !reducedMotion ? (Math.random() - 0.5) * 4 : 0;
            const px = p.x + jitterX;
            const warn = Boolean(p.falling || p.shake);
            ctx.fillStyle = warn ? '#991B1B' : '#065F46';
            ctx.fillRect(px, p.y + 9, p.w, p.h - 9);
            ctx.fillStyle = warn ? '#F87171' : '#34D399';
            ctx.fillRect(px + 5, p.y + 9, 5, p.h - 9);
            ctx.fillStyle = warn ? '#DC2626' : '#10B981';
            ctx.fillRect(px - 3, p.y, p.w + 6, 10);
            ctx.strokeStyle = warn ? '#FCA5A5' : '#6EE7B7';
            ctx.strokeRect(px - 2.5, p.y + 0.5, p.w + 5, 9);
          } else if (p.type === 'question') {
            if (p.hit) {
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(p.x, p.y, p.w, p.h);
              ctx.strokeStyle = '#475569';
              ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
              ctx.fillStyle = '#64748B';
              ctx.fillRect(p.x + p.w / 2 - 2, p.y + p.h / 2 - 2, 4, 4);
            } else {
              const pulse = reducedMotion ? 0 : Math.sin(worldTick * 0.12) * 15;
              ctx.fillStyle = pulse > 0 ? '#FBBF24' : '#F59E0B';
              ctx.fillRect(p.x, p.y, p.w, p.h);
              ctx.fillStyle = '#FEF3C7';
              ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 3);
              ctx.strokeStyle = '#B45309';
              ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
              ctx.fillStyle = '#0F172A';
              ctx.font = '900 13px monospace';
              ctx.textAlign = 'center';
              ctx.fillText('?', p.x + p.w / 2, p.y + p.h / 2 + 5);
            }
          } else if (p.type === 'brick') {
            ctx.fillStyle = '#263040';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#475569';
            ctx.fillRect(p.x + 1, p.y + 1, p.w - 2, 3);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
            ctx.fillStyle = '#94A3B8';
            ctx.fillRect(p.x + 3, p.y + 4, 2, 2);
            ctx.fillRect(p.x + p.w - 5, p.y + 4, 2, 2);
          }
        }

        // Revealed hidden trap blocks
        for (const tb of trollBlocks) {
          if (tb.revealed && tb.x > cameraX - 24 && tb.x < cameraX + CANVAS_WIDTH + 24) {
            ctx.fillStyle = '#7F1D1D';
            ctx.fillRect(tb.x, tb.y, tb.w, tb.h);
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(tb.x + 0.5, tb.y + 0.5, tb.w - 1, tb.h - 1);
            ctx.beginPath();
            ctx.moveTo(tb.x + 3, tb.y + 3);
            ctx.lineTo(tb.x + tb.w - 3, tb.y + tb.h - 3);
            ctx.moveTo(tb.x + tb.w - 3, tb.y + 3);
            ctx.lineTo(tb.x + 3, tb.y + tb.h - 3);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }

        // Collectibles
        for (const coin of coins) {
          if (!coin.collected && coin.x > cameraX - 24 && coin.x < cameraX + CANVAS_WIDTH + 24) {
            const bounce = reducedMotion ? 0 : Math.sin(coin.tick * 0.1) * 2.8;
            ctx.save();
            ctx.translate(coin.x, coin.y + bounce);

            if (coin.type === 'fake_airdrop') {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.24)';
              ctx.beginPath();
              ctx.arc(0, 0, 13, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#F59E0B';
              ctx.beginPath();
              ctx.arc(0, 0, 10, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#EF4444';
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.lineWidth = 1;

              ctx.fillStyle = '#0F172A';
              ctx.font = 'bold 7.5px monospace';
              ctx.textAlign = 'center';
              ctx.fillText('10K', 0, 2.8);
            } else if (coin.type === 'farcaster') {
              // Signal Orange diamond crystal
              ctx.fillStyle = 'rgba(255, 85, 0, 0.22)';
              ctx.beginPath();
              ctx.arc(0, 0, 12, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#FF5500';
              ctx.beginPath();
              ctx.moveTo(0, -10);
              ctx.lineTo(9, 0);
              ctx.lineTo(0, 10);
              ctx.lineTo(-9, 0);
              ctx.closePath();
              ctx.fill();

              ctx.fillStyle = '#FED7AA';
              ctx.beginPath();
              ctx.moveTo(0, -5);
              ctx.lineTo(4.5, 0);
              ctx.lineTo(0, 5);
              ctx.lineTo(-4.5, 0);
              ctx.closePath();
              ctx.fill();
            } else {
              // Base Cobalt orb
              ctx.fillStyle = 'rgba(0, 82, 255, 0.24)';
              ctx.beginPath();
              ctx.arc(0, 0, 11, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#0052FF';
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, 4, 0, Math.PI * 2);
              ctx.stroke();
              ctx.lineWidth = 1;
            }
            ctx.restore();
          }
        }

        // Enemies (FUD Bots)
        for (const enemy of enemies) {
          if (enemy.alive && enemy.x > cameraX - 30 && enemy.x < cameraX + CANVAS_WIDTH + 30) {
            const ex = enemy.x;
            const ey = enemy.y;
            const dir = enemy.vx >= 0 ? 1 : -1;

            ctx.fillStyle = '#FCA5A5';
            ctx.beginPath();
            ctx.moveTo(ex + 2, ey + 5);
            ctx.lineTo(ex - 1, ey - 1);
            ctx.lineTo(ex + 6, ey + 3);
            ctx.moveTo(ex + enemy.w - 2, ey + 5);
            ctx.lineTo(ex + enemy.w + 1, ey - 1);
            ctx.lineTo(ex + enemy.w - 6, ey + 3);
            ctx.fill();

            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(ex + enemy.w / 2, ey + 9, 10, Math.PI, 0);
            ctx.lineTo(ex + enemy.w, ey + enemy.h - 2);
            ctx.lineTo(ex, ey + enemy.h - 2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0F172A';
            ctx.fillRect(ex + 2, ey + 5, enemy.w - 4, 6);
            ctx.fillStyle = '#FDE047';
            ctx.fillRect(ex + 4 + dir, ey + 6.5, 3.5, 3);
            ctx.fillRect(ex + 12 + dir, ey + 6.5, 3.5, 3);

            const step = reducedMotion ? 0 : Math.sin(worldTick * 0.3) * 1.5;
            ctx.fillStyle = '#7F1D1D';
            ctx.fillRect(ex + 1, ey + enemy.h - 3, 7, 3);
            ctx.fillRect(ex + 12, ey + enemy.h - 3 + step * 0.3, 7, 3);

            ctx.fillStyle = '#FEE2E2';
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('FUD', ex + enemy.w / 2, ey + 16.5);
          }
        }

        // Goal Beacon Flagpole
        const beaconColor = flag.flees > 0 ? '#FF5500' : '#0052FF';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.14)';
        ctx.fillRect(flag.x - 2, flag.y, flag.w + 4, flag.h);
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(flag.x + 2, flag.y, 4, flag.h);

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(flag.x + 4, flag.y, 6.5, 0, Math.PI * 2);
        ctx.fill();

        const flutter = reducedMotion ? 0 : Math.sin(worldTick * 0.15) * 3;
        ctx.fillStyle = beaconColor;
        ctx.beginPath();
        ctx.moveTo(flag.x + 6, flag.y + 8);
        ctx.lineTo(flag.x + 42, flag.y + 22 + flutter);
        ctx.lineTo(flag.x + 6, flag.y + 36);
        ctx.closePath();
        ctx.fill();

        if (player.invulnerable % 8 < 5) {
          drawRunner(
            ctx,
            player.x,
            player.y,
            player.width,
            player.facing,
            player.grounded,
            player.vx,
            player.vy,
            player.animTick,
            player.invulnerable
          );
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
          ctx.fillStyle = pt.color;
          ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
          if (pt.life <= 0) particles.splice(i, 1);
        }
        ctx.globalAlpha = 1;

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.y -= 0.75;
          ft.life--;
          ctx.globalAlpha = Math.min(1, ft.life / 14);
          ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeStyle = 'rgba(10, 13, 18, 0.9)';
          ctx.lineWidth = 3;
          ctx.strokeText(ft.text, ft.x, ft.y);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.lineWidth = 1;
          if (ft.life <= 0) floatingTexts.splice(i, 1);
        }
        ctx.globalAlpha = 1;

        ctx.restore();
        ctx.restore();

        if (stateRef.current.gameState === 'playing') {
          animationFrameId = requestAnimationFrame(gameLoop);
        }
      };

      animationFrameId = requestAnimationFrame(gameLoop);

      const cleanup = () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        if (victoryTimer !== null) {
          clearTimeout(victoryTimer);
          victoryTimer = null;
        }
      };
      cleanupLoopRef.current = cleanup;
      return cleanup;
    },
    [fid, onHighScoreChange, onDailyRunEnd, unlockedKey]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && stateRef.current.gameState === 'playing') {
        startGame(dailyDay !== null ? 'daily' : levelIndex);
        return;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) setKey('left', true);
      if (['ArrowRight', 'KeyD'].includes(e.code)) setKey('right', true);
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        setKey('jump', true);
        if (['Space', 'ArrowUp'].includes(e.code)) e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) setKey('left', false);
      if (['ArrowRight', 'KeyD'].includes(e.code)) setKey('right', false);
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) setKey('jump', false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dailyDay, levelIndex, startGame]);

  const handleSelectMode = (target: number | 'daily') => {
    if (target === 'daily') {
      setDailyDay(today);
      if (gameState === 'playing') startGame('daily');
    } else {
      setDailyDay(null);
      setLevelIndex(target);
      if (gameState === 'playing') startGame(target);
    }
  };

  const padEvents = (key: 'left' | 'right' | 'jump') => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      setKey(key, true);
    },
    onPointerUp: (e: PointerEvent) => {
      e.preventDefault();
      setKey(key, false);
    },
    onPointerCancel: () => setKey(key, false),
    onPointerLeave: () => setKey(key, false),
  });

  const handleShareScore = () => {
    const won = gameState === 'victory';
    const castText =
      dailyDay !== null
        ? t.castDaily(dailyDay, score, deaths, won)
        : t.castStage(t.levelNames[levelIndex] ?? LEVELS[levelIndex].name, score, deaths, won);
    return shareCast(castText);
  };

  return (
    <section className="bg-surface border border-line rounded-xl p-3 sm:p-4">
      {/* Console Top Bar: Stage Tabs + Hardware Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-line">
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="group"
            aria-label={t.modeCampaign}
            className="flex items-center rounded-lg bg-canvas border border-line p-0.5"
          >
            {LEVELS.map((lv, i) => {
              const locked = i > unlockedLevel;
              const selected = dailyDay === null && i === levelIndex;
              const localName = t.levelNames[i] ?? lv.name;
              return (
                <button
                  key={lv.name}
                  type="button"
                  onClick={() => handleSelectMode(i)}
                  disabled={locked}
                  aria-pressed={selected}
                  title={locked ? t.levelLockedHint : localName}
                  className={`min-h-[32px] px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    selected
                      ? 'bg-brand text-white'
                      : locked
                      ? 'text-ink-muted/45 cursor-not-allowed'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {locked && <Lock className="w-3 h-3" aria-hidden="true" />}
                  <span>{`${i + 1}`}</span>
                  <span className="hidden sm:inline text-xs">{localName}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSelectMode('daily')}
            aria-pressed={dailyDay !== null}
            title={t.dailySameMap}
            className={`min-h-[36px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              dailyDay !== null
                ? 'bg-gold border-gold text-canvas'
                : 'bg-canvas border-gold/40 text-gold hover:bg-gold/10'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{`${t.modeDaily} #${today}`}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {gameState === 'playing' && (
            <button
              type="button"
              onClick={() => startGame(dailyDay !== null ? 'daily' : levelIndex)}
              aria-label={t.restartBtn}
              title={t.restartBtn}
              className="w-8 h-8 rounded-lg bg-elevated hover:bg-elevated-hover border border-line-strong text-ink-secondary hover:text-ink transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? t.muteBtn : t.unmuteBtn}
            aria-pressed={soundEnabled}
            title={soundEnabled ? t.muteBtn : t.unmuteBtn}
            className="w-8 h-8 rounded-lg bg-elevated hover:bg-elevated-hover border border-line-strong text-ink-secondary hover:text-ink transition-colors flex items-center justify-center"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-brand-bright" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => guideRef.current?.showModal()}
            aria-label={t.guideBtn}
            className="h-8 px-2.5 rounded-lg bg-elevated hover:bg-elevated-hover border border-line-strong text-ink transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5 text-ink-secondary" aria-hidden="true" />
            <span className="hidden sm:inline">{t.guideBtn}</span>
          </button>
        </div>
      </div>

      {/* Recessed Digital Telemetry Readout */}
      <div className="rounded-lg bg-canvas border border-line px-3 py-2 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1 shrink-0" aria-label={`${t.lives}: ${lives}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                aria-hidden="true"
                className={`w-3.5 h-3.5 transition-colors ${
                  i < lives ? 'text-danger fill-danger' : 'text-line-strong'
                }`}
              />
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <span className="w-px h-3.5 bg-line" aria-hidden="true" />
            <div className="w-20 h-1.5 rounded-full bg-elevated overflow-hidden">
              <div
                className="h-full bg-brand-bright transition-[width] duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="tabular-nums text-[11px] text-ink-muted">{progressPct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3 tabular-nums">
          <div>
            <span className="text-[11px] text-ink-muted mr-1.5">{t.score}</span>
            <strong className="text-ink font-bold">{score}</strong>
          </div>
          <span className="w-px h-3.5 bg-line" aria-hidden="true" />
          <div className="flex items-center gap-1" title={`${t.best}: ${highScore}`}>
            <Trophy className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
            <span className="text-ink font-semibold">{highScore}</span>
          </div>
          <span className="w-px h-3.5 bg-line" aria-hidden="true" />
          <div className="flex items-center gap-1" title={`${t.deaths}: ${deaths}`}>
            <Skull className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
            <span className="text-ink-secondary font-semibold">{deaths}</span>
          </div>
        </div>
      </div>

      {/* Screen Viewport */}
      <div className="relative w-full rounded-lg overflow-hidden border border-line-strong bg-canvas aspect-[480/280]">
        <canvas ref={canvasRef} width={480} height={280} className="w-full h-full block" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-canvas/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest bg-signal/15 text-signal border border-signal/30 mb-2">
              <Zap className="w-3 h-3" aria-hidden="true" />
              {t.idleTag}
            </span>

            <h1 className="font-extrabold text-ink text-lg sm:text-2xl tracking-tight mb-1">
              {stageTitle}
            </h1>

            <p className="text-xs text-ink-secondary max-w-sm mb-4 line-clamp-2 sm:line-clamp-none leading-relaxed">
              {t.idleDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => startGame(dailyDay !== null ? 'daily' : levelIndex)}
                className="min-h-[42px] px-5 rounded-lg bg-signal hover:bg-signal-hover border border-[#c23b00] border-b-[3px] text-white font-bold text-xs tracking-wide flex items-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
                <span>{dailyDay !== null ? t.startDaily(today) : t.startStage(levelIndex + 1)}</span>
              </button>

              <button
                type="button"
                onClick={() => guideRef.current?.showModal()}
                className="min-h-[42px] px-3.5 rounded-lg bg-elevated hover:bg-elevated-hover border border-line-strong text-ink font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-ink-secondary" aria-hidden="true" />
                <span>{t.guideBtn}</span>
              </button>
            </div>

            {dailyDay !== null && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-ink-secondary">
                <span>{dailyBest > 0 ? t.dailyYourBest(dailyBest) : t.dailySameMap}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-elevated border border-line-strong text-gold tabular-nums">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {t.dailyResetIn(utcCountdown)}
                </span>
              </div>
            )}
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-canvas/92 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
            <div
              className="w-10 h-10 rounded-lg bg-danger/15 border border-danger/35 flex items-center justify-center mb-2"
              aria-hidden="true"
            >
              <Skull className="w-5 h-5 text-danger" />
            </div>
            <h2 className="font-extrabold text-danger text-base sm:text-lg tracking-wide mb-1">
              {t.gameOverTitle}
            </h2>
            <p className="text-xs text-ink font-medium max-w-sm mb-1.5">
              &ldquo;{t.deathReasons[deathCause]}&rdquo;
            </p>
            <p className="text-xs text-ink-muted tabular-nums mb-3.5">
              {t.deaths}: <strong className="text-ink">{deaths}</strong> • {t.score}:{' '}
              <strong className="text-ink">{score}</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => startGame(dailyDay !== null ? 'daily' : levelIndex)}
                className="min-h-[40px] px-4 rounded-lg bg-signal hover:bg-signal-hover border border-[#c23b00] border-b-[3px] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.tryAgain}</span>
              </button>
              <button
                type="button"
                onClick={handleShareScore}
                className="min-h-[40px] px-4 rounded-lg bg-elevated hover:bg-elevated-hover border border-line-strong text-ink font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.shareFail}</span>
              </button>
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-canvas/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
            <div
              className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center mb-2"
              aria-hidden="true"
            >
              <Trophy className="w-5 h-5 text-gold" />
            </div>
            <h2 className="font-extrabold text-gold text-base sm:text-lg tracking-wide mb-1">
              {dailyDay !== null
                ? t.victoryDailyTitle(dailyDay)
                : levelIndex + 1 < LEVELS.length
                ? t.victoryStageTitle(levelIndex + 1)
                : t.victoryAllTitle}
            </h2>
            <p className="text-xs text-ink tabular-nums mb-1">{t.victorySub(score)}</p>
            {dailyDay !== null && (
              <p className="text-xs text-ok font-semibold tabular-nums mb-2">
                {t.dailyYourBest(Math.max(dailyBest, score))}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {dailyDay === null && levelIndex + 1 < LEVELS.length ? (
                <button
                  type="button"
                  onClick={() => startGame(levelIndex + 1, true)}
                  className="min-h-[40px] px-4 rounded-lg bg-signal hover:bg-signal-hover border border-[#c23b00] border-b-[3px] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{t.nextStage(t.levelNames[levelIndex + 1] ?? LEVELS[levelIndex + 1].name)}</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startGame(dailyDay !== null ? 'daily' : 0)}
                  className="min-h-[40px] px-4 rounded-lg bg-elevated hover:bg-elevated-hover border border-line-strong text-ink font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.playAgain}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleShareScore}
                className="min-h-[40px] px-4 rounded-lg bg-brand hover:bg-brand-bright text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.shareWin}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mechanical Tactile Controller Deck */}
      <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-3 select-none touch-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...padEvents('left')}
            aria-label={t.ctrlLeft}
            className={`w-16 sm:w-20 h-13 rounded-lg border flex items-center justify-center transition-colors duration-75 ${
              padActive.left
                ? 'bg-brand border-brand-bright text-white'
                : 'bg-elevated hover:bg-elevated-hover border-line-strong border-b-[3px] text-ink'
            }`}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            {...padEvents('right')}
            aria-label={t.ctrlRight}
            className={`w-16 sm:w-20 h-13 rounded-lg border flex items-center justify-center transition-colors duration-75 ${
              padActive.right
                ? 'bg-brand border-brand-bright text-white'
                : 'bg-elevated hover:bg-elevated-hover border-line-strong border-b-[3px] text-ink'
            }`}
          >
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="hidden md:block text-xs text-ink-muted">{t.ctrlHintDesktop}</p>

        <button
          type="button"
          {...padEvents('jump')}
          aria-label={t.ctrlJump}
          className={`flex-1 md:flex-none md:min-w-[156px] max-w-[190px] h-13 px-5 rounded-lg border font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-colors duration-75 ${
            padActive.jump
              ? 'bg-brand border-brand-bright text-white'
              : 'bg-signal hover:bg-signal-hover border-[#c23b00] border-b-[3px] text-white'
          }`}
        >
          <ArrowUp className="w-4.5 h-4.5" aria-hidden="true" />
          <span>{t.ctrlJump}</span>
        </button>
      </div>

      {/* Accessible Native How-To-Play Dialog */}
      <dialog
        ref={guideRef}
        aria-labelledby="guide-dialog-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto backdrop:bg-black/75 bg-surface border border-line-strong rounded-xl max-w-md w-[calc(100%-2rem)] p-5 space-y-4 text-xs text-ink-secondary max-h-[85dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4.5 h-4.5 text-brand-bright" aria-hidden="true" />
            <h2 id="guide-dialog-title" className="font-bold text-ink text-sm">
              {t.guideTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => guideRef.current?.close()}
            aria-label="Close"
            className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-elevated flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <h3 className="font-bold text-ink mb-1">{t.guideControlsTitle}</h3>
            <p className="leading-relaxed">{t.guideControlsBody}</p>
          </div>

          <div>
            <h3 className="font-bold text-ink mb-1.5">{t.guideScoreTitle}</h3>
            <ul className="space-y-1.5 text-ink">
              <li className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-brand shrink-0" aria-hidden="true" />
                <span>{t.guideScoreBase(POINTS.base)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-3 h-3 rotate-45 bg-signal shrink-0" aria-hidden="true" />
                <span>{t.guideScoreFc(POINTS.farcaster)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-xs bg-gold shrink-0" aria-hidden="true" />
                <span>{t.guideScoreMystery(POINTS.question)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="w-3.5 h-3.5 text-ok shrink-0" aria-hidden="true" />
                <span>{t.guideScoreStomp(POINTS.stomp)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Flag className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden="true" />
                <span>{t.guideScoreFlag(POINTS.flag)}</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-canvas border border-danger/35 space-y-1.5">
            <h3 className="font-bold text-danger flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.guideTrapTitle}</span>
            </h3>
            <ul className="space-y-1 text-ink-secondary list-disc list-inside">
              {t.guideTraps.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={() => guideRef.current?.close()}
          className="w-full min-h-[40px] rounded-lg bg-brand hover:bg-brand-bright text-white font-semibold transition-colors"
        >
          {t.guideClose}
        </button>
      </dialog>
    </section>
  );
}

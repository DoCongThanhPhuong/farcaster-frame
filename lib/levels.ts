export type PlatformType = 'ground' | 'brick' | 'question' | 'pipe' | 'rugpull' | 'hollow_column';

export interface LevelPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: PlatformType;
}

export interface LevelTrollBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  reason: string;
}

export interface LevelCoin {
  x: number;
  y: number;
  type: 'base' | 'farcaster' | 'fake_airdrop';
}

export interface LevelEnemy {
  x: number;
  vx: number;
  rangeStart: number;
  rangeEnd: number;
}

export interface Level {
  name: string;
  width: number;
  platforms: LevelPlatform[];
  trollBlocks: LevelTrollBlock[];
  coins: LevelCoin[];
  enemies: LevelEnemy[];
  // The flag sits at flagX and runs to each fleeTo position in turn as the player gets close.
  flagX: number;
  fleeTo: number[];
  checkpoints: number[];
}

// Single source of truth for scoring: the game awards these and the leaderboard caps scores with them.
export const POINTS = {
  base: 20,
  farcaster: 50,
  question: 50,
  stomp: 80,
  flag: 500,
  fakePenalty: 50,
};

// Highest score a clean run of this level can reach: every real coin, every ? block, every stomp, the flag.
export function maxScore(level: Level): number {
  const coins = level.coins.reduce((sum, c) => sum + (c.type === 'fake_airdrop' ? 0 : POINTS[c.type]), 0);
  const questions = level.platforms.filter((p) => p.type === 'question').length * POINTS.question;
  return coins + questions + level.enemies.length * POINTS.stomp + POINTS.flag;
}

const ground =(x: number, w: number): LevelPlatform => ({ x, y: 240, w, h: 40, type: 'ground' });
const block = (x: number, y: number, type: PlatformType, w = 25, h = 25): LevelPlatform => ({ x, y, w, h, type });
const stairs = (x: number): LevelPlatform[] => [
  block(x, 220, 'brick', 30, 20),
  block(x + 30, 200, 'brick', 30, 40),
  block(x + 60, 180, 'brick', 30, 60),
  block(x + 90, 160, 'brick', 30, 80),
];

export const LEVELS: Level[] = [
  {
    name: 'Genesis Block',
    width: 3400,
    platforms: [
      ground(0, 715),
      ground(775, 265),
      ground(1095, 285),
      ground(1460, 700),
      ground(2240, 1100),

      block(260, 205, 'pipe', 35, 35),
      block(540, 190, 'pipe', 35, 50),
      block(1050, 195, 'hollow_column', 35, 45),
      block(1780, 195, 'pipe', 35, 45),

      block(160, 165, 'question'),
      block(185, 165, 'brick'),
      block(210, 165, 'question'),
      block(235, 165, 'brick'),

      block(380, 145, 'brick', 75, 20),
      block(405, 72, 'question'),

      block(880, 165, 'question'),
      block(930, 165, 'brick', 60, 20),
      block(1180, 155, 'question'),
      block(1240, 130, 'rugpull', 75, 20),

      block(1560, 165, 'brick'),
      block(1585, 165, 'question'),
      block(1610, 165, 'brick'),
      block(1920, 140, 'brick', 90, 20),

      ...stairs(2600),
    ],
    trollBlocks: [
      { x: 735, y: 170, w: 20, h: 20, label: '😈', reason: 'Bonked head on an invisible block and fell into the abyss! 😈' },
      { x: 2160, y: 170, w: 20, h: 20, label: '📉', reason: 'Blocked by an invisible wall right before the goal! 📉' },
    ],
    coins: [
      { x: 172, y: 135, type: 'base' },
      { x: 222, y: 135, type: 'farcaster' },
      { x: 395, y: 115, type: 'base' },
      { x: 417, y: 40, type: 'farcaster' },
      { x: 640, y: 200, type: 'base' },
      { x: 892, y: 135, type: 'farcaster' },
      { x: 955, y: 135, type: 'fake_airdrop' },
      { x: 1192, y: 125, type: 'base' },
      { x: 1270, y: 100, type: 'farcaster' },
      { x: 1597, y: 135, type: 'farcaster' },
      { x: 1965, y: 110, type: 'base' },
      { x: 2350, y: 205, type: 'base' },
      { x: 2400, y: 205, type: 'farcaster' },
    ],
    enemies: [
      { x: 420, vx: -0.9, rangeStart: 320, rangeEnd: 520 },
      { x: 920, vx: -0.9, rangeStart: 800, rangeEnd: 1020 },
      { x: 1200, vx: 0.9, rangeStart: 1120, rangeEnd: 1360 },
      { x: 1650, vx: -1.0, rangeStart: 1500, rangeEnd: 1760 },
      { x: 2000, vx: -1.0, rangeStart: 1850, rangeEnd: 2140 },
      { x: 2450, vx: 0.9, rangeStart: 2300, rangeEnd: 2550 },
    ],
    flagX: 2850,
    fleeTo: [3120],
    checkpoints: [60, 320, 600, 850, 1100, 1500, 1800, 2300],
  },
  {
    name: 'Gas Wars',
    width: 3600,
    platforms: [
      ground(0, 600),
      ground(670, 300),
      ground(1050, 400),
      ground(1535, 500),
      ground(2110, 400),
      ground(2590, 1000),

      block(300, 205, 'pipe', 35, 35),
      block(820, 190, 'hollow_column', 35, 50),
      block(1300, 195, 'pipe', 35, 45),
      block(2300, 190, 'pipe', 35, 50),

      block(150, 165, 'question'),
      block(175, 165, 'brick'),
      block(200, 165, 'question'),

      block(700, 150, 'brick', 60, 20),
      block(1150, 160, 'question'),
      block(1175, 160, 'brick'),
      block(1200, 160, 'question'),

      // Greedy route: coins sit above two rugpulls in a row.
      block(1600, 150, 'rugpull', 70, 20),
      block(1720, 120, 'rugpull', 70, 20),
      block(2150, 160, 'rugpull', 75, 20),

      ...stairs(2900),
    ],
    trollBlocks: [
      { x: 625, y: 170, w: 20, h: 20, label: '⛽', reason: 'Gas spike froze your jump mid-air over the pit! ⛽' },
      { x: 1480, y: 170, w: 20, h: 20, label: '😈', reason: 'Another invisible block. You never learn! 😈' },
    ],
    coins: [
      { x: 162, y: 135, type: 'base' },
      { x: 212, y: 135, type: 'farcaster' },
      { x: 450, y: 205, type: 'base' },
      { x: 730, y: 120, type: 'farcaster' },
      { x: 1162, y: 130, type: 'base' },
      { x: 1212, y: 130, type: 'base' },
      { x: 1635, y: 120, type: 'farcaster' },
      { x: 1755, y: 90, type: 'fake_airdrop' },
      { x: 1900, y: 205, type: 'base' },
      { x: 2187, y: 130, type: 'farcaster' },
      { x: 2450, y: 205, type: 'fake_airdrop' },
      { x: 2700, y: 205, type: 'base' },
      { x: 2975, y: 130, type: 'farcaster' },
    ],
    enemies: [
      { x: 450, vx: -1.1, rangeStart: 360, rangeEnd: 580 },
      { x: 750, vx: -1.1, rangeStart: 680, rangeEnd: 800 },
      { x: 1100, vx: 1.2, rangeStart: 1060, rangeEnd: 1280 },
      { x: 1700, vx: -1.2, rangeStart: 1545, rangeEnd: 1900 },
      { x: 1950, vx: 1.2, rangeStart: 1800, rangeEnd: 2010 },
      { x: 2200, vx: -1.3, rangeStart: 2120, rangeEnd: 2290 },
      { x: 2700, vx: 1.2, rangeStart: 2600, rangeEnd: 2880 },
      { x: 3100, vx: -1.3, rangeStart: 3030, rangeEnd: 3250 },
    ],
    flagX: 3100,
    fleeTo: [3300, 3500],
    checkpoints: [60, 400, 700, 1080, 1560, 2140, 2620],
  },
  {
    name: 'Bear Market',
    width: 3800,
    platforms: [
      ground(0, 500),
      ground(580, 320),
      ground(985, 415),
      ground(1550, 450),
      ground(2080, 420),
      ground(2650, 1150),

      // Gaps too wide to jump: the only bridge is a rugpull, so land and jump off fast.
      block(1440, 200, 'rugpull', 70, 20),
      block(2540, 200, 'rugpull', 70, 20),

      block(250, 200, 'pipe', 35, 40),
      block(910, 195, 'hollow_column', 35, 45),
      block(1200, 195, 'pipe', 35, 45),
      block(2020, 195, 'hollow_column', 35, 45),
      block(2300, 195, 'pipe', 35, 45),

      block(150, 165, 'question'),
      block(175, 165, 'brick'),
      block(200, 165, 'question'),

      block(620, 150, 'brick', 75, 20),
      block(645, 80, 'question'),
      block(1050, 165, 'question'),
      block(1075, 165, 'brick'),
      block(1100, 165, 'question'),
      block(1650, 140, 'brick', 90, 20),
      block(2150, 165, 'question'),
      block(2175, 165, 'brick'),

      ...stairs(3200),
    ],
    trollBlocks: [
      { x: 530, y: 170, w: 20, h: 20, label: '🐻', reason: 'The bear market blocked your leap of faith! 🐻' },
      { x: 3000, y: 190, w: 20, h: 20, label: '📉', reason: 'Jumped for joy too early. Invisible wall! 📉' },
    ],
    coins: [
      { x: 162, y: 135, type: 'base' },
      { x: 212, y: 135, type: 'farcaster' },
      { x: 657, y: 50, type: 'farcaster' },
      { x: 657, y: 120, type: 'base' },
      { x: 927, y: 165, type: 'fake_airdrop' },
      { x: 1087, y: 135, type: 'base' },
      { x: 1475, y: 170, type: 'farcaster' },
      { x: 1695, y: 110, type: 'farcaster' },
      { x: 2162, y: 135, type: 'base' },
      { x: 2575, y: 170, type: 'farcaster' },
      { x: 2800, y: 205, type: 'fake_airdrop' },
      { x: 3000, y: 150, type: 'base' },
      { x: 3275, y: 130, type: 'farcaster' },
    ],
    enemies: [
      { x: 400, vx: -1.3, rangeStart: 300, rangeEnd: 480 },
      { x: 800, vx: 1.3, rangeStart: 740, rangeEnd: 880 },
      { x: 1300, vx: -1.4, rangeStart: 1240, rangeEnd: 1380 },
      { x: 1700, vx: 1.4, rangeStart: 1560, rangeEnd: 1980 },
      { x: 1900, vx: -1.4, rangeStart: 1560, rangeEnd: 1980 },
      { x: 2200, vx: -1.4, rangeStart: 2090, rangeEnd: 2290 },
      { x: 2800, vx: 1.5, rangeStart: 2660, rangeEnd: 3180 },
      { x: 3100, vx: -1.5, rangeStart: 2660, rangeEnd: 3180 },
      { x: 3500, vx: 1.5, rangeStart: 3330, rangeEnd: 3560 },
    ],
    flagX: 3450,
    fleeTo: [3600, 3750],
    checkpoints: [60, 600, 1000, 1560, 2090, 2670],
  },
];

// Daily Challenge: one generated level per UTC day, identical for every player.
const DAILY_EPOCH = Date.UTC(2026, 9, 26);
const DAY_MS = 24 * 60 * 60 * 1000;

export const dailyNumber = (now = Date.now()) => Math.floor((now - DAILY_EPOCH) / DAY_MS) + 1;

// mulberry32: tiny seeded PRNG so the same day always yields the same layout.
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAILY_TROLL_REASONS = [
  'Bonked an invisible block mid-jump. Classic daily rug! 😈',
  'Today\'s gas spike froze you over the pit! ⛽',
  'Invisible wall. The daily dev saw you coming! 📉',
];

export function dailyLevel(day: number): Level {
  const rand = seededRandom(Math.imul(day, 2654435761));
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const chance = (p: number) => rand() < p;
  const enemySpeed = 0.9 + rand() * 0.6;

  const platforms: LevelPlatform[] = [ground(0, 500), block(150, 165, 'question'), block(175, 165, 'brick'), block(200, 165, 'question')];
  const trollBlocks: LevelTrollBlock[] = [];
  const coins: LevelCoin[] = [{ x: 162, y: 135, type: 'base' }, { x: 212, y: 135, type: 'farcaster' }];
  const enemies: LevelEnemy[] = [];
  const checkpoints = [60];

  let x = 500;
  for (let i = 0; i < 5; i++) {
    // Gap: either jumpable (maybe hiding a troll block or hollow column) or too wide, bridged by a rugpull.
    let gap: number;
    if (i > 0 && chance(0.3)) {
      gap = int(140, 160);
      const bx = x + Math.round((gap - 70) / 2);
      platforms.push(block(bx, 200, 'rugpull', 70, 20));
      coins.push({ x: bx + 35, y: 170, type: 'farcaster' });
    } else {
      gap = int(55, 90);
      if (chance(0.25)) {
        platforms.push(block(x + Math.round(gap / 2) - 17, 195, 'hollow_column', 35, 45));
      } else if (trollBlocks.length < 2 && chance(0.5)) {
        trollBlocks.push({
          x: x + Math.round(gap / 2) - 10, y: 170, w: 20, h: 20, label: '😈',
          reason: DAILY_TROLL_REASONS[trollBlocks.length % DAILY_TROLL_REASONS.length],
        });
      }
    }
    x += gap;

    const w = int(300, 480);
    platforms.push(ground(x, w));
    checkpoints.push(x + 15);

    let enemyStart = x + 20;
    if (chance(0.5)) {
      const ph = int(35, 50);
      platforms.push(block(x + 70, 240 - ph, 'pipe', 35, ph));
      enemyStart = x + 120;
    }
    if (chance(0.7)) {
      const bx = x + int(140, w - 140);
      platforms.push(block(bx, 165, 'question'), block(bx + 25, 165, 'brick'), block(bx + 50, 165, 'question'));
      coins.push({ x: bx + 12, y: 135, type: chance(0.2) ? 'fake_airdrop' : 'farcaster' });
    }
    if (x + w - 30 - enemyStart >= 150) {
      const rangeStart = enemyStart;
      const rangeEnd = x + w - 30;
      enemies.push({ x: Math.round((rangeStart + rangeEnd) / 2), vx: chance(0.5) ? enemySpeed : -enemySpeed, rangeStart, rangeEnd });
    }
    coins.push({ x: x + Math.round(w / 2), y: 205, type: chance(0.15) ? 'fake_airdrop' : 'base' });
    x += w;
  }

  // Final stretch: stairs, then a flag that runs once or twice.
  x += int(55, 85);
  const finalW = 1000;
  platforms.push(ground(x, finalW), ...stairs(x + 150));
  checkpoints.push(x + 15);
  enemies.push({ x: x + 400, vx: -enemySpeed, rangeStart: x + 300, rangeEnd: x + 600 });

  return {
    name: `Daily #${day}`,
    width: x + finalW,
    platforms,
    trollBlocks,
    coins,
    enemies,
    flagX: x + 450,
    fleeTo: chance(0.5) ? [x + 700] : [x + 650, x + 900],
    checkpoints,
  };
}

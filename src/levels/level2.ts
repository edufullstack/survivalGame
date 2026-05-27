import { LevelConfig } from './LevelConfig';

export const level2: LevelConfig = {
  name: 'Rising Tide',
  backgroundColor: 0x0d1b2a,
  worldWidth: 2000,
  worldHeight: 2000,

  enemyTypes: [
    {
      key: 'basic',
      speed: 110,     // was 90
      health: 60,     // was 40
      damage: 18,     // was 12 — 5 hits = dead with starting HP
      xpValue: 12,
      color: 0xe74c3c,
      size: 14,
    },
    {
      key: 'fast',
      speed: 190,     // was 155 — very hard to outrun
      health: 30,     // was 20
      damage: 12,
      xpValue: 15,
      color: 0xff6b35,
      size: 10,
    },
    {
      key: 'tank',
      speed: 60,      // was 45 — tanks now actually catch you
      health: 220,    // was 120
      damage: 28,     // was 20
      xpValue: 35,
      color: 0x8b0000,
      size: 20,
    },
  ],

  baseSpawnInterval: 1000,  // was 1400 — immediately stressful
  spawnIntervalDecay: 250,  // was 150
  minSpawnInterval: 350,    // was 400

  enemyScaling: { healthPerMinute: 0.25, speedPerMinute: 0.12 },

  initialPlayerStats: {
    maxHealth: 65,          // was 80 — fragile
    speed: 152,
    attackDamage: 25,
    attackCooldown: 1100,
    projectileSpeed: 400,
    projectileCount: 1,
  },

  // XP curve: 180 → 410 → WIN
  xpToLevel: (level) => Math.floor(180 * Math.pow(2.3, level - 1)),

  availableUpgrades: [
    {
      id: 'speed_up',
      label: 'Swift Feet',
      description: '+22 Movement Speed',
      apply: (s) => { s.speed += 22; },
    },
    {
      id: 'damage_up',
      label: 'Power Strike',
      description: '+15 Attack Damage',
      apply: (s) => { s.attackDamage += 15; },
    },
    {
      id: 'cooldown_down',
      label: 'Rapid Fire',
      description: '-220ms Attack Cooldown',
      apply: (s) => { s.attackCooldown = Math.max(250, s.attackCooldown - 220); },
    },
    {
      id: 'health_up',
      label: 'Vitality',
      description: '+35 Max Health',
      apply: (s) => { s.maxHealth += 35; },
    },
    {
      id: 'proj_speed',
      label: 'Sharpshot',
      description: '+60 Projectile Speed',
      apply: (s) => { s.projectileSpeed += 60; },
    },
    {
      id: 'multishot',
      label: 'Burst Fire',
      description: '+1 Projectile (sequential)',
      apply: (s) => { s.projectileCount += 1; },
    },
  ],

  maxPlayerLevel: 3,
};

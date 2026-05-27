import { LevelConfig } from './LevelConfig';

export const level1: LevelConfig = {
  name: 'The Beginning',
  backgroundColor: 0x1a1a2e,
  worldWidth: 2000,
  worldHeight: 2000,

  enemyTypes: [
    {
      key: 'basic',
      speed: 90,      // was 65 — noticeably faster
      health: 45,     // was 30
      damage: 15,     // was 10 — 7 hits to die (1 hit/0.8s = dead in ~5.5s of contact)
      xpValue: 10,
      color: 0xe74c3c,
      size: 14,
    },
  ],

  // Spawns faster, ramps up quicker
  baseSpawnInterval: 1600,  // was 2000
  spawnIntervalDecay: 160,  // was 100 — every 30s: -160ms
  minSpawnInterval: 500,    // was 700

  // Enemies scale 20% health and 10% speed per minute
  enemyScaling: { healthPerMinute: 0.20, speedPerMinute: 0.10 },

  initialPlayerStats: {
    maxHealth: 80,          // was 100 — starts more vulnerable
    speed: 145,
    attackDamage: 20,
    attackCooldown: 1200,   // was 1000 — slower start, forces upgrade choices
    projectileSpeed: 350,
    projectileCount: 1,
  },

  // XP curve: 150 → 350 → WIN
  // Level 3 gives WIN (maxPlayerLevel defaults to 3)
  xpToLevel: (level) => Math.floor(150 * Math.pow(2.3, level - 1)),

  availableUpgrades: [
    {
      id: 'speed_up',
      label: 'Swift Feet',
      description: '+20 Movement Speed',
      apply: (s) => { s.speed += 20; },
    },
    {
      id: 'damage_up',
      label: 'Power Strike',
      description: '+12 Attack Damage',
      apply: (s) => { s.attackDamage += 12; },
    },
    {
      id: 'cooldown_down',
      label: 'Rapid Fire',
      description: '-200ms Attack Cooldown',
      apply: (s) => { s.attackCooldown = Math.max(250, s.attackCooldown - 200); },
    },
    {
      id: 'health_up',
      label: 'Vitality',
      description: '+30 Max Health',
      apply: (s) => { s.maxHealth += 30; },
    },
    {
      id: 'multishot',
      label: 'Burst Fire',
      description: '+1 Projectile (sequential)',
      apply: (s) => { s.projectileCount += 1; },
    },
  ],

  maxPlayerLevel: 3,

  // No winCondition by time — victory is reaching player level 4 via XP
};

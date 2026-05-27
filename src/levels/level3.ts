import { LevelConfig } from './LevelConfig';

/**
 * Level 3 — "The Abyss"
 * Designed to be brutally hard. Most players will not finish this.
 *
 * Key design decisions:
 * - Player starts with low HP and a slow attack rate.
 * - Four enemy types including the fast 'phantom' that outruns most movement builds.
 * - Spawn interval hits the floor (200ms) in ~3 minutes — essentially a constant stream.
 * - Enemies scale 35% health per minute so late game tanks have 5x base health.
 * - XP curve requires 220 → 500 → WIN, meaning a lot of kills under constant pressure.
 * - Level-up waves are 6 and 12 enemies — nearly impossible to survive without upgrades.
 */
export const level3: LevelConfig = {
  name: 'The Abyss',
  backgroundColor: 0x050510,
  worldWidth: 2400,
  worldHeight: 2400,

  enemyTypes: [
    {
      key: 'basic',
      speed: 130,     // fast — hard to kite
      health: 70,
      damage: 20,     // 3 hits = dead with starting 55 HP
      xpValue: 14,
      color: 0xe74c3c,
      size: 14,
    },
    {
      key: 'fast',
      speed: 215,     // outruns the player without a speed upgrade
      health: 35,
      damage: 15,
      xpValue: 18,
      color: 0xff6b35,
      size: 10,
    },
    {
      key: 'tank',
      speed: 70,      // slow but catches you if you stop moving
      health: 350,    // requires 18 projectile hits at base damage
      damage: 35,     // 2 hits = dead
      xpValue: 45,
      color: 0x8b0000,
      size: 20,
    },
    {
      key: 'phantom',
      speed: 155,     // medium-fast, hard to consistently dodge
      health: 100,
      damage: 32,     // 2 hits = dead — must be respected
      xpValue: 28,
      color: 0x9b59b6,
      size: 16,
    },
  ],

  baseSpawnInterval: 750,   // immediately overwhelming
  spawnIntervalDecay: 350,  // reaches floor in ~3 min
  minSpawnInterval: 200,    // 5 enemies per second at peak

  // Brutal scaling: at 3 min enemies have ~2x health and 1.5x speed
  enemyScaling: { healthPerMinute: 0.35, speedPerMinute: 0.15 },

  initialPlayerStats: {
    maxHealth: 55,          // extremely fragile — 2 phantom hits = dead
    speed: 162,             // slightly faster base to compensate fragility
    attackDamage: 30,
    attackCooldown: 1300,   // slowest attack start of all levels
    projectileSpeed: 430,
    projectileCount: 1,
  },

  // XP curve: 220 → 506 → WIN  (~22 kills at lv1 | ~35 kills at lv2 | ~36 kills at lv3)
  xpToLevel: (level) => Math.floor(220 * Math.pow(2.3, level - 1)),

  availableUpgrades: [
    {
      id: 'speed_up',
      label: 'Swift Feet',
      description: '+25 Movement Speed',
      apply: (s) => { s.speed += 25; },
    },
    {
      id: 'damage_up',
      label: 'Power Strike',
      description: '+18 Attack Damage',
      apply: (s) => { s.attackDamage += 18; },
    },
    {
      id: 'cooldown_down',
      label: 'Rapid Fire',
      description: '-250ms Attack Cooldown',
      apply: (s) => { s.attackCooldown = Math.max(250, s.attackCooldown - 250); },
    },
    {
      id: 'health_up',
      label: 'Vitality',
      description: '+40 Max Health',
      apply: (s) => { s.maxHealth += 40; },
    },
    {
      id: 'proj_speed',
      label: 'Sharpshot',
      description: '+70 Projectile Speed',
      apply: (s) => { s.projectileSpeed += 70; },
    },
    {
      id: 'multishot',
      label: 'Burst Fire',
      description: '+1 Projectile (sequential)',
      apply: (s) => { s.projectileCount += 1; },
    },
    // High-risk option unique to this level
    {
      id: 'berserker',
      label: 'Berserker',
      description: '+30 Damage, -15 Max HP',
      apply: (s) => {
        s.attackDamage += 30;
        s.maxHealth = Math.max(20, s.maxHealth - 15);
      },
    },
  ],

  maxPlayerLevel: 3,

  xpOrbStyle:       { color: 0xbd6aff, size: 6 },
  projectileStyle:  { color: 0x00e5ff, size: 5 },
};

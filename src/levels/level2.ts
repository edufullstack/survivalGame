import { LevelConfig } from './LevelConfig';

export const level2: LevelConfig = {
  name: 'Rising Tide',
  backgroundColor: 0x0d1b2a,
  worldWidth: 2000,
  worldHeight: 2000,

  // Three enemy types: fast basic, speedy scout, slow tank
  enemyTypes: [
    {
      key: 'basic',
      speed: 90,
      health: 40,
      damage: 12,
      xpValue: 12,
      color: 0xe74c3c,
      size: 14,
    },
    {
      key: 'fast',
      speed: 155,
      health: 20,
      damage: 8,
      xpValue: 15,
      color: 0xff6b35,
      size: 10,
    },
    {
      key: 'tank',
      speed: 45,
      health: 120,
      damage: 20,
      xpValue: 30,
      color: 0x8b0000,
      size: 20,
    },
  ],

  baseSpawnInterval: 1400,
  spawnIntervalDecay: 150,
  minSpawnInterval: 400,

  initialPlayerStats: {
    maxHealth: 80,
    speed: 150,
    attackDamage: 25,
    attackCooldown: 900,
    projectileSpeed: 400,
    projectileCount: 1,
  },

  availableUpgrades: [
    {
      id: 'speed_up',
      label: 'Swift Feet',
      description: '+20 Movement Speed',
      apply: (stats) => { stats.speed += 20; },
    },
    {
      id: 'damage_up',
      label: 'Power Strike',
      description: '+15 Attack Damage',
      apply: (stats) => { stats.attackDamage += 15; },
    },
    {
      id: 'cooldown_down',
      label: 'Rapid Fire',
      description: '-200ms Attack Cooldown',
      apply: (stats) => { stats.attackCooldown = Math.max(200, stats.attackCooldown - 200); },
    },
    {
      id: 'health_up',
      label: 'Vitality',
      description: '+30 Max Health',
      apply: (stats) => { stats.maxHealth += 30; },
    },
    {
      id: 'proj_speed',
      label: 'Sharpshot',
      description: '+50 Projectile Speed',
      apply: (stats) => { stats.projectileSpeed += 50; },
    },
    {
      id: 'multishot',
      label: 'Multi-Shot',
      description: '+1 Projectile per shot',
      apply: (stats) => { stats.projectileCount += 1; },
    },
  ],

  xpToLevel: (level) => Math.floor(80 * Math.pow(1.5, level - 1)),

  winCondition: { type: 'survival', duration: 600 },
};

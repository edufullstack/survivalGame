import { LevelConfig } from './LevelConfig';

export const level1: LevelConfig = {
  name: 'The Beginning',
  backgroundColor: 0x1a1a2e,
  worldWidth: 2000,
  worldHeight: 2000,

  enemyTypes: [
    {
      key: 'basic',
      speed: 65,
      health: 30,
      damage: 10,
      xpValue: 10,
      color: 0xe74c3c,
      size: 14,
    },
  ],

  baseSpawnInterval: 2000,
  spawnIntervalDecay: 100,
  minSpawnInterval: 700,

  initialPlayerStats: {
    maxHealth: 100,
    speed: 140,
    attackDamage: 20,
    attackCooldown: 1000,
    projectileSpeed: 350,
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
      description: '+10 Attack Damage',
      apply: (stats) => { stats.attackDamage += 10; },
    },
    {
      id: 'cooldown_down',
      label: 'Rapid Fire',
      description: '-150ms Attack Cooldown',
      apply: (stats) => { stats.attackCooldown = Math.max(200, stats.attackCooldown - 150); },
    },
    {
      id: 'health_up',
      label: 'Vitality',
      description: '+25 Max Health',
      apply: (stats) => { stats.maxHealth += 25; },
    },
    {
      id: 'multishot',
      label: 'Multi-Shot',
      description: '+1 Projectile per shot',
      apply: (stats) => { stats.projectileCount += 1; },
    },
  ],

  xpToLevel: (level) => Math.floor(100 * Math.pow(1.4, level - 1)),

  winCondition: { type: 'survival', duration: 300 },
};

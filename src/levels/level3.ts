import { LevelConfig } from './LevelConfig';

/**
 * Level 3 — "The Abyss"
 *
 * How to use this file as a boilerplate:
 * 1. Copy it and rename (e.g. level4.ts)
 * 2. Change the fields below — every field is commented
 * 3. Import your new level in src/scenes/MenuScene.ts and add a button
 * 4. To add a NEW enemy key (e.g. 'dragon'), just add it to enemyTypes[] —
 *    GameScene will auto-create the texture from color + size. No BootScene changes needed.
 * 5. To override the XP orb or projectile look, fill in xpOrbStyle / projectileStyle.
 */
export const level3: LevelConfig = {
  // ── Identity ───────────────────────────────────────────────────────────────
  name: 'The Abyss',

  // ── World ──────────────────────────────────────────────────────────────────
  backgroundColor: 0x050510, // deep dark blue-black
  worldWidth: 2400,
  worldHeight: 2400,

  // ── Enemy types ────────────────────────────────────────────────────────────
  // All fields are required. GameScene creates the texture from color + size.
  // key must be unique within this level (it becomes the texture key 'enemy_<key>').
  enemyTypes: [
    {
      key: 'basic',    // fast, easy — plenty of these
      speed: 110,
      health: 50,
      damage: 14,
      xpValue: 14,
      color: 0xe74c3c,
      size: 14,
    },
    {
      key: 'fast',     // very fast, fragile — punishes stationary players
      speed: 185,
      health: 25,
      damage: 10,
      xpValue: 18,
      color: 0xff6b35,
      size: 10,
    },
    {
      key: 'tank',     // slow, tanky — forces players to use damage upgrades
      speed: 55,
      health: 200,
      damage: 25,
      xpValue: 40,
      color: 0x8b0000,
      size: 20,
    },
    // ── Custom enemy unique to this level ────────────────────────────────────
    // This key ('phantom') doesn't exist in other levels, and that's fine —
    // GameScene creates the texture automatically from color + size below.
    {
      key: 'phantom',  // medium speed, medium health, hits hard
      speed: 100,
      health: 70,
      damage: 22,
      xpValue: 25,
      color: 0x9b59b6, // purple
      size: 16,
    },
  ],

  // ── Spawn difficulty ───────────────────────────────────────────────────────
  // baseSpawnInterval: time in ms between spawns at t=0
  // spawnIntervalDecay: ms subtracted every 30 seconds
  // minSpawnInterval: hard floor (ms) — game never spawns faster than this
  //
  // Formula: interval = max(minSpawnInterval, baseSpawnInterval - floor(t/30) * decay)
  // At t=0: 1200ms  →  ~0.8 enemies/second
  // At t=120s: 1200 - 4*180 = 480ms  →  ~2 enemies/second
  baseSpawnInterval: 1200,
  spawnIntervalDecay: 180,
  minSpawnInterval: 300,

  // ── Player starting stats ─────────────────────────────────────────────────
  // Lower maxHealth + higher attackCooldown = punishing start
  initialPlayerStats: {
    maxHealth: 70,
    speed: 155,
    attackDamage: 28,
    attackCooldown: 850,   // ms — the cooldown the FIRST shot fires at
    projectileSpeed: 420,
    projectileCount: 1,
  },

  // ── Upgrades available on level-up ────────────────────────────────────────
  // The engine picks 3 at random from this list each time.
  // You can add custom upgrades here without touching any engine file.
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
      description: '+18 Attack Damage',
      apply: (stats) => { stats.attackDamage += 18; },
    },
    {
      id: 'cooldown_down',
      label: 'Rapid Fire',
      description: '-180ms Attack Cooldown',
      apply: (stats) => { stats.attackCooldown = Math.max(200, stats.attackCooldown - 180); },
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
      description: '+60 Projectile Speed',
      apply: (stats) => { stats.projectileSpeed += 60; },
    },
    {
      id: 'multishot',
      label: 'Burst Fire',
      description: '+1 Projectile (sequential burst)',
      apply: (stats) => { stats.projectileCount += 1; },
    },
    // ── Custom upgrade example ───────────────────────────────────────────────
    {
      id: 'berserker',
      label: 'Berserker',
      description: '+25 Damage, -10 Max HP',
      apply: (stats) => {
        stats.attackDamage += 25;
        stats.maxHealth = Math.max(20, stats.maxHealth - 10);
      },
    },
  ],

  // ── XP curve ──────────────────────────────────────────────────────────────
  // xpToLevel(n) = XP needed to go from level n to level n+1
  // Raise the base or exponent to make leveling slower
  xpToLevel: (level) => Math.floor(120 * Math.pow(1.5, level - 1)),

  // ── Win condition ─────────────────────────────────────────────────────────
  // duration is in SECONDS. Change this number to adjust the run length.
  // Remove this field entirely for an endless level (no win screen).
  winCondition: { type: 'survival', duration: 480 }, // 8 minutes

  // ── Visual customisation ───────────────────────────────────────────────────
  // These are OPTIONAL. Remove either block to use the default look.
  // size = radius in pixels (must match the hitbox — XPOrb uses radius 6,
  // Projectile uses radius 4, so keep size near those values).
  xpOrbStyle: {
    color: 0xbd6aff, // violet orbs to match the purple phantom enemies
    size: 6,
  },
  projectileStyle: {
    color: 0x00e5ff, // cyan projectiles for visual contrast on dark background
    size: 5,         // slightly larger than default (4) — purely cosmetic
  },
};

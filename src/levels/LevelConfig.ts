/** Configuration for a single enemy type within a level. */
export interface EnemyTypeConfig {
  key: string;           // unique key, must match 'enemy_<key>' texture in BootScene
  speed: number;         // pixels per second
  health: number;
  damage: number;        // HP removed per hit (uses invincibility frames)
  xpValue: number;       // XP orb value on death
  color: number;         // Phaser hex color e.g. 0xe74c3c
  size: number;          // circle radius in pixels
}

/** Player stats that upgrades can modify. */
export interface PlayerStats {
  maxHealth: number;
  speed: number;           // pixels per second
  attackDamage: number;
  attackCooldown: number;  // ms between auto-attacks
  projectileSpeed: number; // pixels per second
  projectileCount: number; // projectiles fired per attack
}

/** A single upgrade option shown on level-up. */
export interface UpgradeOption {
  id: string;
  label: string;
  description: string;
  apply: (stats: PlayerStats) => void;
}

/** Visual style for XP orbs or projectiles. Optional — falls back to defaults. */
export interface CircleStyle {
  color: number;  // Phaser hex e.g. 0x9b59b6
  size: number;   // radius in pixels
}

/** Full configuration for one level. Drop a new file in /levels to create a new level. */
export interface LevelConfig {
  name: string;
  backgroundColor: number;
  worldWidth: number;
  worldHeight: number;
  enemyTypes: EnemyTypeConfig[];
  baseSpawnInterval: number;   // ms between enemy spawns at start
  spawnIntervalDecay: number;  // ms reduction every 30 seconds
  minSpawnInterval: number;    // ms floor for spawn interval
  initialPlayerStats: PlayerStats;
  availableUpgrades: UpgradeOption[];
  /** XP required to go from level N to N+1 */
  xpToLevel: (level: number) => number;
  winCondition?: { type: 'survival'; duration: number }; // duration in seconds
  // ── Difficulty scaling (optional) ────────────────────────────────────────
  /**
   * How much enemy stats grow per minute of play.
   * healthPerMinute: 0.20 = +20% health every 60 s
   * speedPerMinute:  0.10 = +10% speed every 60 s
   * Defaults to { healthPerMinute: 0.15, speedPerMinute: 0.08 } if omitted.
   */
  enemyScaling?: { healthPerMinute: number; speedPerMinute: number };

  /**
   * Max XP level the player can reach before the game ends (win).
   * Defaults to 3. When player XP would push beyond this level → YOU WIN.
   */
  maxPlayerLevel?: number;

  // ── Visual overrides (optional) ─────────────────────────────────────────
  /** Custom look for XP orbs in this level. Omit to use the default green. */
  xpOrbStyle?: CircleStyle;
  /** Custom look for projectiles in this level. Omit to use the default yellow. */
  projectileStyle?: CircleStyle;
}

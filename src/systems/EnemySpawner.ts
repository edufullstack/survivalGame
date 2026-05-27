import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { EnemyTypeConfig, LevelConfig } from '../levels/LevelConfig';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  private config: LevelConfig;
  private player: Player;
  private spawnTimer: number = 0;
  private lastElapsed: number = 0;  // stored so spawnWave can use it

  constructor(
    scene: Phaser.Scene,
    enemies: Phaser.Physics.Arcade.Group,
    config: LevelConfig,
    player: Player,
  ) {
    this.scene   = scene;
    this.enemies = enemies;
    this.config  = config;
    this.player  = player;
  }

  update(_time: number, delta: number, elapsedSeconds: number): void {
    this.lastElapsed = elapsedSeconds;
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.getCurrentInterval(elapsedSeconds)) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
  }

  /**
   * Spawn `count` enemies in rapid succession close to the player.
   * Used when the player levels up — creates a threatening incoming wave.
   */
  spawnWave(count: number): void {
    for (let i = 0; i < count; i++) {
      // Stagger spawns by 160 ms so enemies don't all appear at exactly the same frame
      this.scene.time.delayedCall(i * 160, () => {
        this.spawnEnemy(260); // spawn closer than usual (260 px from player)
      });
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  /** Spawn interval shrinks over time — the longer you survive, the faster they come. */
  private getCurrentInterval(elapsedSeconds: number): number {
    const periods = Math.floor(elapsedSeconds / 30);
    return Math.max(
      this.config.minSpawnInterval,
      this.config.baseSpawnInterval - periods * this.config.spawnIntervalDecay,
    );
  }

  /**
   * Apply time-based stat scaling so enemies get progressively tougher.
   * Rates come from the level config (enemyScaling), with sensible defaults.
   */
  private scaleConfig(base: EnemyTypeConfig, elapsedSeconds: number): EnemyTypeConfig {
    const { healthPerMinute = 0.15, speedPerMinute = 0.08 } =
      this.config.enemyScaling ?? {};

    const minutes = elapsedSeconds / 60;
    return {
      ...base,
      health: Math.round(base.health * (1 + minutes * healthPerMinute)),
      speed:  Math.round(base.speed  * (1 + minutes * speedPerMinute)),
      // damage is intentionally NOT scaled — keeps the game fair
    };
  }

  private spawnEnemy(spawnDistance?: number): void {
    const types      = this.config.enemyTypes;
    const baseConfig = types[Math.floor(Math.random() * types.length)];
    const typeConfig = this.scaleConfig(baseConfig, this.lastElapsed);

    const angle    = Math.random() * Math.PI * 2;
    const distance = spawnDistance ?? (380 + Math.random() * 120);
    const x = Phaser.Math.Clamp(
      this.player.x + Math.cos(angle) * distance,
      50, this.config.worldWidth - 50,
    );
    const y = Phaser.Math.Clamp(
      this.player.y + Math.sin(angle) * distance,
      50, this.config.worldHeight - 50,
    );

    const existing = this.enemies.getFirstDead(false) as Enemy | null;
    if (existing) {
      existing.activate(x, y, typeConfig);
    } else {
      const enemy = new Enemy(this.scene, x, y, typeConfig, this.player);
      this.enemies.add(enemy);
    }
  }
}

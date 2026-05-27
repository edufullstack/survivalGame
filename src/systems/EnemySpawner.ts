import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { LevelConfig } from '../levels/LevelConfig';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  private config: LevelConfig;
  private player: Player;
  private spawnTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    enemies: Phaser.Physics.Arcade.Group,
    config: LevelConfig,
    player: Player,
  ) {
    this.scene = scene;
    this.enemies = enemies;
    this.config = config;
    this.player = player;
  }

  update(_time: number, delta: number, elapsedSeconds: number): void {
    this.spawnTimer += delta;

    const currentInterval = this.getCurrentInterval(elapsedSeconds);
    if (this.spawnTimer >= currentInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
  }

  /** Spawn interval shrinks as the game goes on, making it progressively harder. */
  private getCurrentInterval(elapsedSeconds: number): number {
    const periods = Math.floor(elapsedSeconds / 30);
    return Math.max(
      this.config.minSpawnInterval,
      this.config.baseSpawnInterval - periods * this.config.spawnIntervalDecay,
    );
  }

  private spawnEnemy(): void {
    const types = this.config.enemyTypes;
    const typeConfig = types[Math.floor(Math.random() * types.length)];

    // Spawn off-screen relative to the player
    const angle = Math.random() * Math.PI * 2;
    const distance = 380 + Math.random() * 120;
    const x = Phaser.Math.Clamp(
      this.player.x + Math.cos(angle) * distance,
      50, this.config.worldWidth - 50,
    );
    const y = Phaser.Math.Clamp(
      this.player.y + Math.sin(angle) * distance,
      50, this.config.worldHeight - 50,
    );

    // Try to reuse a pooled (dead) enemy before allocating a new one
    const existing = this.enemies.getFirstDead(false) as Enemy | null;
    if (existing) {
      existing.activate(x, y, typeConfig);
    } else {
      const enemy = new Enemy(this.scene, x, y, typeConfig, this.player);
      this.enemies.add(enemy);
    }
  }
}

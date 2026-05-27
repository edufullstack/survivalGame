import Phaser from 'phaser';
import { EnemyTypeConfig } from '../levels/LevelConfig';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  enemyConfig: EnemyTypeConfig;
  private currentHealth: number;
  private target: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyTypeConfig,
    target: Phaser.Physics.Arcade.Sprite,
  ) {
    super(scene, x, y, `enemy_${config.key}`);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyConfig = config;
    this.currentHealth = config.health;
    this.target = target;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(config.size, 0, 0);
  }

  /** Restore an inactive enemy from the pool. */
  activate(x: number, y: number, config: EnemyTypeConfig): void {
    this.enemyConfig = config;
    this.currentHealth = config.health;
    this.setTexture(`enemy_${config.key}`);
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(x, y);
    body.setCircle(config.size, 0, 0);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  /**
   * Apply damage and return true if the enemy died.
   */
  takeDamage(amount: number): boolean {
    this.currentHealth -= amount;
    return this.currentHealth <= 0;
  }

  // Called automatically each frame because the group has runChildUpdate: true
  update(_time: number, _delta: number): void {
    if (!this.active) return;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        (dx / dist) * this.enemyConfig.speed,
        (dy / dist) * this.enemyConfig.speed,
      );
    }
  }
}

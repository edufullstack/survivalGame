import Phaser from 'phaser';
import { PlayerStats } from '../levels/LevelConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats;
  health: number;
  xp: number;
  level: number;

  private invincibleTimer: number = 0;
  private readonly invincibleDuration: number = 800; // ms of iframes after a hit

  constructor(scene: Phaser.Scene, x: number, y: number, stats: PlayerStats) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.stats = { ...stats };
    this.health = stats.maxHealth;
    this.xp = 0;
    this.level = 1;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    // Circle hitbox centered on the 32×32 texture
    body.setCircle(15, 1, 1);
  }

  takeDamage(amount: number): void {
    if (this.invincibleTimer > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.invincibleTimer = this.invincibleDuration;

    // Brief flash to signal a hit
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => { if (this.active) this.alpha = 1; },
    });
  }

  /**
   * Add XP and return true if the player leveled up.
   * The caller is responsible for showing the upgrade menu.
   */
  gainXP(amount: number, xpToLevel: (level: number) => number): boolean {
    this.xp += amount;
    const needed = xpToLevel(this.level);
    if (this.xp >= needed) {
      this.xp -= needed;
      this.level += 1;
      return true;
    }
    return false;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  update(delta: number): void {
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.alpha = 1;
      }
    }
  }
}

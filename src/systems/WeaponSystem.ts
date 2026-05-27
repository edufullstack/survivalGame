import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from './Projectile';

export class WeaponSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private projectiles: Phaser.Physics.Arcade.Group;
  private enemies: Phaser.Physics.Arcade.Group;
  private projTextureKey: string;
  private cooldownTimer: number = 0;

  /** ms of delay between each shot in a burst (multi-shot upgrade). */
  private readonly BURST_DELAY = 110;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    projectiles: Phaser.Physics.Arcade.Group,
    enemies: Phaser.Physics.Arcade.Group,
    projTextureKey: string = 'projectile',
  ) {
    this.scene           = scene;
    this.player          = player;
    this.projectiles     = projectiles;
    this.enemies         = enemies;
    this.projTextureKey  = projTextureKey;
  }

  update(_time: number, delta: number): void {
    this.cooldownTimer -= delta;
    if (this.cooldownTimer <= 0) {
      this.fire();
      this.cooldownTimer = this.player.stats.attackCooldown;
    }
  }

  private fire(): void {
    const count = this.player.stats.projectileCount;

    if (count === 1) {
      // Single shot: fire immediately at nearest enemy
      const target = this.findNearestEnemy();
      if (!target) return;
      const angle = Phaser.Math.Angle.Between(
        this.player.x, this.player.y, target.x, target.y,
      );
      this.spawnProjectile(angle);
      return;
    }

    // ── Burst mode ────────────────────────────────────────────────────────
    // Each shot fires BURST_DELAY ms after the previous one.
    // Each shot re-targets the nearest enemy at the moment it fires,
    // so direction can shift naturally as enemies move.
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * this.BURST_DELAY, () => {
        const target = this.findNearestEnemy();
        if (!target) return;
        const angle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y, target.x, target.y,
        );
        this.spawnProjectile(angle);
      });
    }
  }

  private findNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = Infinity;

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, enemy.x, enemy.y,
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private spawnProjectile(angle: number): void {
    const speed = this.player.stats.projectileSpeed;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const existing = this.projectiles.getFirstDead(false) as Projectile | null;
    if (existing) {
      existing.activate(this.player.x, this.player.y, vx, vy);
    } else {
      const proj = new Projectile(
        this.scene, this.player.x, this.player.y, vx, vy,
        this.projTextureKey,
      );
      this.projectiles.add(proj);
    }
  }
}

import Phaser from 'phaser';

/**
 * BootScene runs once at startup.
 * It creates all game textures programmatically so no external art files are needed.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    // Player: blue circle, 32×32
    this.makeCircleTexture('player', 32, 0x4fc3f7);

    // Enemy variants – sizes must match EnemyTypeConfig.size * 2
    this.makeCircleTexture('enemy_basic', 28, 0xe74c3c);
    this.makeCircleTexture('enemy_fast',  20, 0xff6b35);
    this.makeCircleTexture('enemy_tank',  40, 0x8b0000);

    // XP orb: green/yellow circle, 12×12
    this.makeCircleTexture('xp_orb', 12, 0x2ecc71);

    // Projectile: bright yellow circle, 8×8
    this.makeCircleTexture('projectile', 8, 0xffee00);

    this.scene.start('NameInputScene');
  }

  /**
   * Draws a filled circle into a texture of size diameter×diameter.
   * @param key   Texture key used throughout the game
   * @param diameter  Pixel size of the square texture (= circle diameter)
   * @param color Phaser hex color
   */
  private makeCircleTexture(key: string, diameter: number, color: number): void {
    const r = diameter / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(color, 1);
    gfx.fillCircle(r, r, r);
    gfx.generateTexture(key, diameter, diameter);
    gfx.destroy();
  }
}

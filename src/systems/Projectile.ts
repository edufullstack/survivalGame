import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param textureKey  Pass a level-specific key if the level defines projectileStyle,
   *                    otherwise leave as default 'projectile'.
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    vx: number,
    vy: number,
    textureKey: string = 'projectile',
  ) {
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(4, 0, 0);
    body.setVelocity(vx, vy);
  }

  activate(x: number, y: number, vx: number, vy: number): void {
    this.setActive(true);
    this.setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(x, y);
    body.setVelocity(vx, vy);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}

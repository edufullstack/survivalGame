import Phaser from 'phaser';

export class XPOrb extends Phaser.Physics.Arcade.Sprite {
  value: number;

  /**
   * @param textureKey  Pass a level-specific key if the level defines xpOrbStyle,
   *                    otherwise leave as default 'xp_orb'.
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    value: number,
    textureKey: string = 'xp_orb',
  ) {
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = value;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setCircle(6, 0, 0);
  }

  activate(x: number, y: number, value: number): void {
    this.value = value;
    this.setActive(true);
    this.setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(x, y);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
  }
}

import Phaser from 'phaser';

/** On-screen virtual joystick for touch/mobile input. Appears in the lower-left quadrant. */
export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Arc;
  private thumb: Phaser.GameObjects.Arc;

  private direction: { x: number; y: number } = { x: 0, y: 0 };
  private isDown: boolean = false;
  private activePointerId: number = -1;

  // Home position of the joystick base
  private homeX: number;
  private homeY: number;
  // Current position (floats when touched)
  private baseX: number;
  private baseY: number;

  private readonly MAX_RADIUS = 55;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const camH = scene.cameras.main.height;
    this.homeX = 90;
    this.homeY = camH - 90;
    this.baseX = this.homeX;
    this.baseY = this.homeY;

    // Outer ring (the "base")
    this.base = scene.add
      .arc(this.homeX, this.homeY, 55, 0, 360, false, 0xffffff, 0.15)
      .setStrokeStyle(2, 0xffffff, 0.4)
      .setScrollFactor(0)
      .setDepth(300);

    // Inner thumb
    this.thumb = scene.add
      .arc(this.homeX, this.homeY, 28, 0, 360, false, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(301);

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.isDown) return;

    // Only activate when touch starts in the lower-left half of the screen
    const cam = this.scene.cameras.main;
    if (pointer.x < cam.width / 2 && pointer.y > cam.height / 2) {
      this.isDown = true;
      this.activePointerId = pointer.id;
      // Float the base to wherever the player touched
      this.baseX = pointer.x;
      this.baseY = pointer.y;
      this.base.setPosition(pointer.x, pointer.y);
      this.thumb.setPosition(pointer.x, pointer.y);
    }
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDown || pointer.id !== this.activePointerId) return;

    const dx = pointer.x - this.baseX;
    const dy = pointer.y - this.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.MAX_RADIUS) {
      // Clamp thumb to max radius
      const ratio = this.MAX_RADIUS / dist;
      this.thumb.setPosition(this.baseX + dx * ratio, this.baseY + dy * ratio);
      this.direction.x = dx / dist;
      this.direction.y = dy / dist;
    } else {
      this.thumb.setPosition(pointer.x, pointer.y);
      if (dist > 0) {
        this.direction.x = dx / this.MAX_RADIUS;
        this.direction.y = dy / this.MAX_RADIUS;
      }
    }
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.activePointerId) return;
    this.reset();
  }

  private reset(): void {
    this.isDown = false;
    this.activePointerId = -1;
    this.direction.x = 0;
    this.direction.y = 0;
    this.baseX = this.homeX;
    this.baseY = this.homeY;
    this.base.setPosition(this.homeX, this.homeY);
    this.thumb.setPosition(this.homeX, this.homeY);
  }

  /** Returns a normalised or partial direction vector. Zero vector when idle. */
  getDirection(): { x: number; y: number } {
    return this.direction;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.scene.input.off('pointerupoutside', this.onUp, this);
    this.base.destroy();
    this.thumb.destroy();
  }
}

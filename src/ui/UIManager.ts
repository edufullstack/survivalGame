import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { LevelConfig } from '../levels/LevelConfig';

/** Renders all HUD elements fixed to the camera (scroll factor 0). */
export class UIManager {
  private player: Player;
  private config: LevelConfig;

  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private healthText: Phaser.GameObjects.Text;

  private xpBarBg: Phaser.GameObjects.Rectangle;
  private xpBarFill: Phaser.GameObjects.Rectangle;

  private levelText: Phaser.GameObjects.Text;
  private timeText: Phaser.GameObjects.Text;

  private readonly BAR_W = 220;

  constructor(scene: Phaser.Scene, player: Player, config: LevelConfig) {
    this.player = player;
    this.config = config;

    const depth = 200;

    // Health bar background + fill (top-left)
    this.healthBarBg = scene.add
      .rectangle(10, 12, this.BAR_W, 18, 0x555555)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth);

    this.healthBarFill = scene.add
      .rectangle(10, 12, this.BAR_W, 18, 0xe74c3c)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    this.healthText = scene.add
      .text(14, 13, '', { fontSize: '12px', color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(depth + 2);

    // XP bar (just below health bar)
    this.xpBarBg = scene.add
      .rectangle(10, 34, this.BAR_W, 8, 0x333333)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth);

    this.xpBarFill = scene.add
      .rectangle(10, 34, 0, 8, 0x2ecc71)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    // Level indicator (right of health bar)
    this.levelText = scene.add
      .text(240, 12, 'LVL 1', { fontSize: '16px', color: '#f1c40f', fontStyle: 'bold' })
      .setScrollFactor(0)
      .setDepth(depth);

    // Survival timer (top-center)
    const camW = scene.cameras.main.width;
    this.timeText = scene.add
      .text(camW / 2, 10, '0:00', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(depth);
  }

  update(elapsedSeconds: number): void {
    const { maxHealth } = this.player.stats;
    const healthPct = Math.max(0, this.player.health / maxHealth);
    this.healthBarFill.width = this.BAR_W * healthPct;
    this.healthText.setText(`HP ${Math.ceil(Math.max(0, this.player.health))} / ${maxHealth}`);

    const xpNeeded = this.config.xpToLevel(this.player.level);
    const xpPct = Math.min(1, this.player.xp / xpNeeded);
    this.xpBarFill.width = this.BAR_W * xpPct;

    this.levelText.setText(`LVL ${this.player.level}`);

    const m = Math.floor(elapsedSeconds / 60);
    const s = Math.floor(elapsedSeconds % 60);
    this.timeText.setText(`${m}:${s.toString().padStart(2, '0')}`);
  }
}

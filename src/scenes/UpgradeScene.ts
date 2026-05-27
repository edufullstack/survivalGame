import Phaser from 'phaser';
import { UpgradeOption } from '../levels/LevelConfig';

interface UpgradeSceneData {
  options: UpgradeOption[];
  gameSceneKey: string;
}

/**
 * Launched on top of the paused GameScene when the player levels up.
 * Shows 3 upgrade cards; clicking one applies the upgrade and resumes the game.
 */
export class UpgradeScene extends Phaser.Scene {
  private options: UpgradeOption[] = [];
  private gameSceneKey: string = 'GameScene';

  constructor() {
    super('UpgradeScene');
  }

  init(data: UpgradeSceneData): void {
    this.options = data.options;
    this.gameSceneKey = data.gameSceneKey;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Dim overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78);

    this.add
      .text(width / 2, height * 0.18, 'LEVEL UP!', {
        fontSize: '52px',
        color: '#f1c40f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.30, 'Choose an upgrade', {
        fontSize: '22px',
        color: '#cccccc',
      })
      .setOrigin(0.5);

    this.layoutCards(width, height);
  }

  private layoutCards(width: number, height: number): void {
    const count  = this.options.length;
    const cardW  = Math.min(190, (width - 80) / count);
    const cardH  = 160;
    const gap    = 20;
    const totalW = count * cardW + (count - 1) * gap;
    const startX = (width - totalW) / 2 + cardW / 2;
    const cardY  = height * 0.56;

    this.options.forEach((opt, i) => {
      const cx = startX + i * (cardW + gap);
      this.createCard(cx, cardY, cardW, cardH, opt);
    });
  }

  private createCard(
    cx: number,
    cy: number,
    w: number,
    h: number,
    option: UpgradeOption,
  ): void {
    const bg = this.add
      .rectangle(cx, cy, w, h, 0x1e3a5f)
      .setInteractive({ useHandCursor: true });

    this.add.rectangle(cx, cy, w, h).setStrokeStyle(2, 0x4fc3f7);

    this.add
      .text(cx, cy - 45, option.label, {
        fontSize: '17px',
        color: '#f1c40f',
        fontStyle: 'bold',
        wordWrap: { width: w - 16 },
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 10, option.description, {
        fontSize: '14px',
        color: '#ccddee',
        wordWrap: { width: w - 16 },
        align: 'center',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x2e5a8f));
    bg.on('pointerout',  () => bg.setFillStyle(0x1e3a5f));

    bg.on('pointerdown', () => {
      // Emit the chosen upgrade to the waiting GameScene listener
      const gameScene = this.scene.get(this.gameSceneKey);
      gameScene.events.emit('upgrade-chosen', option);
      this.scene.stop();
      this.scene.resume(this.gameSceneKey);
    });
  }
}

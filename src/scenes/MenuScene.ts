import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import { level2 } from '../levels/level2';
import { level3 } from '../levels/level3';
import { LevelConfig } from '../levels/LevelConfig';

/** Level selection menu. Shown after NameInputScene. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const playerName = (this.registry.get('playerName') as string) || 'Player';

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // Greeting with player name
    this.add
      .text(width / 2, height * 0.11, `Hola, ${playerName}!`, {
        fontSize: '20px',
        color: '#4fc3f7',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.21, 'SURVIVAL ARENA', {
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.33, 'Elige un nivel', {
        fontSize: '18px',
        color: '#778899',
      })
      .setOrigin(0.5);

    this.createLevelButton(width / 2, height * 0.46, level1, '1');
    this.createLevelButton(width / 2, height * 0.59, level2, '2');
    this.createLevelButton(width / 2, height * 0.72, level3, '3');

    // "Change player" link at bottom
    const changeText = this.add
      .text(width / 2, height * 0.90, '← Cambiar jugador', {
        fontSize: '14px',
        color: '#445566',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    changeText.on('pointerover', () => changeText.setColor('#4fc3f7'));
    changeText.on('pointerout',  () => changeText.setColor('#445566'));
    changeText.on('pointerdown', () => this.scene.start('NameInputScene'));
  }

  private createLevelButton(x: number, y: number, config: LevelConfig, num: string): void {
    const w = 320;
    const h = 58;

    const bg = this.add
      .rectangle(x, y, w, h, 0x1a2d3f)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y - 9, `Nivel ${num}: ${config.name}`, {
        fontSize: '19px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const hint = config.winCondition
      ? `Sobrevive ${config.winCondition.duration / 60} min`
      : 'Sin fin';
    this.add
      .text(x, y + 13, hint, { fontSize: '13px', color: '#6688aa' })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x2e4a60));
    bg.on('pointerout',  () => bg.setFillStyle(0x1a2d3f));
    bg.on('pointerdown', () => this.scene.start('GameScene', { levelConfig: config }));
  }
}

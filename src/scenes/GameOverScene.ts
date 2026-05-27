import Phaser from 'phaser';
import { ScoreManager, ScoreEntry, calcScore, formatTime } from '../utils/ScoreManager';

interface GameOverData {
  survived: number;    // seconds
  level: number;       // player level reached
  kills: number;
  playerName: string;
  levelName: string;
  isWin: boolean;
}

/**
 * Displayed on top of the paused GameScene when the player wins or dies.
 * Saves the run to localStorage and shows the full leaderboard.
 */
export class GameOverScene extends Phaser.Scene {
  private runData!: GameOverData;  // "data" is reserved by Phaser.Scene
  private score: number = 0;

  constructor() {
    super('GameOverScene');
  }

  init(runData: GameOverData): void {
    this.runData = runData;
    this.score   = calcScore(runData.survived, runData.kills, runData.level, runData.isWin);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Persist score to leaderboard
    ScoreManager.save({
      name:      this.runData.playerName,
      score:     this.score,
      level:     this.runData.level,
      survived:  this.runData.survived,
      kills:     this.runData.kills,
      levelName: this.runData.levelName,
      isWin:     this.runData.isWin,
      date:      new Date().toISOString(),
    });

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.88);

    // ── Result header ─────────────────────────────────────────────────────
    const title      = this.runData.isWin ? 'YOU WIN!' : 'GAME OVER';
    const titleColor = this.runData.isWin ? '#2ecc71'    : '#e74c3c';

    this.add
      .text(width / 2, height * 0.07, title, {
        fontSize: '48px', color: titleColor, fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Player name + score (large, prominent)
    this.add
      .text(width / 2, height * 0.18, this.runData.playerName, {
        fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.27, this.score.toLocaleString() + ' pts', {
        fontSize: '36px', color: '#f1c40f', fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stats row
    const stats = [
      `⏱ ${formatTime(this.runData.survived)}`,
      `💀 ${this.runData.kills} kills`,
      `⬆ Lv.${this.runData.level}`,
      `📍 ${this.runData.levelName}`,
    ].join('     ');

    this.add
      .text(width / 2, height * 0.36, stats, {
        fontSize: '14px', color: '#8899aa',
      })
      .setOrigin(0.5);

    // Divider
    const gfx = this.add.graphics();
    gfx.lineStyle(1, 0x334455, 1);
    gfx.lineBetween(width * 0.08, height * 0.41, width * 0.92, height * 0.41);

    // ── Leaderboard ───────────────────────────────────────────────────────
    this.add
      .text(width / 2, height * 0.44, '🏆  LEADERBOARD', {
        fontSize: '16px', color: '#f1c40f', fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.drawLeaderboard(width, height);

    // ── Buttons ───────────────────────────────────────────────────────────
    this.createButton(width * 0.30, height * 0.90, 'Play Again', 0x1a3a20, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MenuScene');
    });

    this.createButton(width * 0.70, height * 0.90, 'Next Player', 0x1a2a3a, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('NameInputScene');
    });
  }

  // ── Leaderboard table ──────────────────────────────────────────────────────

  private drawLeaderboard(width: number, height: number): void {
    const entries = ScoreManager.loadAll();

    // Column X positions
    const C = {
      rank:  width * 0.10,
      name:  width * 0.28,
      score: width * 0.50,
      time:  width * 0.66,
      level: width * 0.80,
      map:   width * 0.92,
    };

    // Header
    const headerY = height * 0.49;
    const headerStyle = { fontSize: '12px', color: '#556677' };
    this.add.text(C.rank,  headerY, 'POS',   headerStyle).setOrigin(0.5);
    this.add.text(C.name,  headerY, 'NAME',  headerStyle).setOrigin(0.5);
    this.add.text(C.score, headerY, 'PTS',   headerStyle).setOrigin(0.5);
    this.add.text(C.time,  headerY, 'TIME',  headerStyle).setOrigin(0.5);
    this.add.text(C.level, headerY, 'LV',    headerStyle).setOrigin(0.5);
    this.add.text(C.map,   headerY, 'MAP',   headerStyle).setOrigin(0.5);

    const rowH  = 24;
    const top8  = entries.slice(0, 8);
    const nameKey = this.runData.playerName.trim().toLowerCase();

    top8.forEach((e: ScoreEntry, i: number) => {
      const y = headerY + 18 + i * rowH;

      // Highlight the row that matches the just-finished run
      const isCurrentRun =
        e.name.trim().toLowerCase() === nameKey &&
        e.score === this.score;

      const rowBg  = isCurrentRun ? 0x1a3a20 : (i % 2 === 0 ? 0x0d1520 : 0x0a1018);
      this.add.rectangle(width / 2, y, width * 0.88, rowH - 2, rowBg).setOrigin(0.5);

      const rankColor =
        i === 0 ? '#f1c40f' :
        i === 1 ? '#aaaaaa' :
        i === 2 ? '#cd7f32' : '#667788';

      const textColor = isCurrentRun ? '#2ecc71' : '#ccddee';
      const st = (color: string = textColor): Phaser.Types.GameObjects.Text.TextStyle =>
        ({ fontSize: '13px', color });

      this.add.text(C.rank,  y, `#${i + 1}`,              st(rankColor)).setOrigin(0.5);
      this.add.text(C.name,  y, e.name.substring(0, 12),  st()).setOrigin(0.5);
      this.add.text(C.score, y, e.score.toLocaleString(),  { fontSize: '13px', color: isCurrentRun ? '#f1c40f' : '#4fc3f7', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(C.time,  y, formatTime(e.survived),   st()).setOrigin(0.5);
      this.add.text(C.level, y, `${e.level}`,             st()).setOrigin(0.5);
      this.add.text(C.map,   y, e.levelName.substring(0, 8), { fontSize: '11px', color: '#556677' }).setOrigin(0.5);
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private createButton(x: number, y: number, label: string, color: number, cb: () => void): void {
    const bg = this.add
      .rectangle(x, y, 200, 44, color)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, { fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout',  () => bg.setAlpha(1));
    bg.on('pointerdown', cb);
  }
}

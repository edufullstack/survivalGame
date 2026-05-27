import Phaser from 'phaser';
import { ScoreManager, ScoreEntry, formatTime } from '../utils/ScoreManager';

/**
 * Shown before MenuScene every time a new player sits down.
 * Uses a native HTML <input> overlaid on the canvas so the iOS/Android
 * keyboard pops up on tablet devices automatically.
 */
export class NameInputScene extends Phaser.Scene {
  private inputEl!: HTMLInputElement;

  constructor() {
    super('NameInputScene');
  }

  create(): void {
    // Clear previous player from registry
    this.registry.set('playerName', '');

    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x060c16);

    // Title
    this.add
      .text(width / 2, height * 0.12, 'SURVIVAL ARENA', {
        fontSize: '38px',
        color: '#4fc3f7',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.26, '¿Quién juega ahora?', {
        fontSize: '24px',
        color: '#aabbcc',
      })
      .setOrigin(0.5);

    // HTML input element (handles native keyboard on iPad)
    this.inputEl = this.createInputElement();
    this.positionInputElement();

    // Phaser "JUGAR" button
    this.createPlayButton(width / 2, height * 0.52);

    this.add
      .text(width / 2, height * 0.60, 'Presiona Enter o toca Jugar', {
        fontSize: '13px',
        color: '#445566',
      })
      .setOrigin(0.5);

    // Leaderboard section
    this.drawLeaderboard(width, height);

    // Focus the input after a short delay (some browsers need this)
    this.time.delayedCall(200, () => this.inputEl?.focus());

    // Remove the DOM input when this scene stops
    this.events.once('shutdown', () => this.inputEl?.remove());
  }

  // ── DOM input ──────────────────────────────────────────────────────────────

  private createInputElement(): HTMLInputElement {
    const el = document.createElement('input');
    el.type = 'text';
    el.placeholder = 'tu nombre...';
    el.maxLength = 16;
    el.autocomplete = 'off';
    el.spellcheck = false;

    Object.assign(el.style, {
      position: 'fixed',
      zIndex: '1000',
      fontFamily: '"Courier New", Courier, monospace',
      background: '#0a1a2a',
      color: '#4fc3f7',
      border: '2px solid #4fc3f7',
      borderRadius: '8px',
      outline: 'none',
      textAlign: 'center',
      boxSizing: 'border-box',
      letterSpacing: '2px',
    });

    el.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') this.submit();
    });

    document.body.appendChild(el);
    return el;
  }

  /**
   * Maps game-space coordinates to screen-space, accounting for Phaser's
   * Scale.FIT transform so the input sits exactly over the correct position.
   */
  private positionInputElement(): void {
    const canvas = this.game.canvas;
    const rect   = canvas.getBoundingClientRect();
    const { width, height } = this.cameras.main;

    const sx = rect.width  / width;
    const sy = rect.height / height;

    const inputW = Math.min(270 * sx, 360);
    const inputH = 46 * sy;
    const fontSize = Math.max(14, Math.round(20 * Math.min(sx, sy)));

    this.inputEl.style.width    = `${inputW}px`;
    this.inputEl.style.height   = `${inputH}px`;
    this.inputEl.style.left     = `${rect.left + (width / 2) * sx - inputW / 2}px`;
    this.inputEl.style.top      = `${rect.top  + height * 0.38 * sy - inputH / 2}px`;
    this.inputEl.style.fontSize = `${fontSize}px`;
    this.inputEl.style.padding  = `${6 * sy}px ${12 * sx}px`;
  }

  // ── Phaser button ──────────────────────────────────────────────────────────

  private createPlayButton(x: number, y: number): void {
    const bg = this.add
      .rectangle(x, y, 210, 50, 0x0e3050)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, 'JUGAR  ▶', {
        fontSize: '22px',
        color: '#4fc3f7',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x1a4a70));
    bg.on('pointerout',  () => bg.setFillStyle(0x0e3050));
    bg.on('pointerdown', () => this.submit());
  }

  // ── Leaderboard preview ────────────────────────────────────────────────────

  private drawLeaderboard(width: number, height: number): void {
    const entries = ScoreManager.loadAll();
    const startY  = height * 0.67;

    this.add
      .text(width / 2, startY, '🏆  MEJORES PUNTAJES', {
        fontSize: '16px',
        color: '#f1c40f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    if (entries.length === 0) {
      this.add
        .text(width / 2, startY + 30, 'Sé el primero en el marcador', {
          fontSize: '14px',
          color: '#445566',
        })
        .setOrigin(0.5);
      return;
    }

    const cols = { rank: width * 0.18, name: width * 0.38, score: width * 0.62, extra: width * 0.82 };
    const rowH = 26;
    const top5 = entries.slice(0, 5);

    top5.forEach((e: ScoreEntry, i: number) => {
      const y = startY + 28 + i * rowH;
      const rankColor = i === 0 ? '#f1c40f' : i === 1 ? '#aaaaaa' : i === 2 ? '#cd7f32' : '#667788';

      this.add.text(cols.rank, y, `#${i + 1}`, { fontSize: '14px', color: rankColor }).setOrigin(0.5);
      this.add.text(cols.name, y, e.name.substring(0, 12), { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(cols.score, y, e.score.toLocaleString(), { fontSize: '14px', color: '#4fc3f7', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(cols.extra, y, formatTime(e.survived), { fontSize: '14px', color: '#778899' }).setOrigin(0.5);
    });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  private submit(): void {
    const name = (this.inputEl?.value ?? '').trim();

    if (!name) {
      // Flash border red to signal required field
      this.inputEl.style.borderColor = '#e74c3c';
      this.time.delayedCall(600, () => {
        if (this.inputEl) this.inputEl.style.borderColor = '#4fc3f7';
      });
      this.inputEl.focus();
      return;
    }

    this.registry.set('playerName', name);
    this.inputEl.remove();
    this.scene.start('MenuScene');
  }
}

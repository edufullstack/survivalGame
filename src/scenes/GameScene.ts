import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { XPOrb } from '../entities/XPOrb';
import { Projectile } from '../systems/Projectile';
import { WeaponSystem } from '../systems/WeaponSystem';
import { EnemySpawner } from '../systems/EnemySpawner';
import { UIManager } from '../ui/UIManager';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { LevelConfig, UpgradeOption } from '../levels/LevelConfig';

interface GameSceneData {
  levelConfig: LevelConfig;
}

/**
 * Main gameplay scene.
 * Receives a LevelConfig via init() so any team can create a new level without
 * touching this file (see /levels/level1.ts for the template).
 */
export class GameScene extends Phaser.Scene {
  // ── Core objects ──────────────────────────────────────────────────────────
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;

  // ── Systems ───────────────────────────────────────────────────────────────
  private weaponSystem!: WeaponSystem;
  private enemySpawner!: EnemySpawner;
  private uiManager!: UIManager;
  private joystick!: VirtualJoystick;

  // ── State ─────────────────────────────────────────────────────────────────
  private levelConfig!: LevelConfig;
  private elapsedSeconds: number = 0;
  private isGameOver: boolean = false;

  // ── Texture keys (can be overridden per level via xpOrbStyle / projectileStyle)
  private xpOrbKey: string = 'xp_orb';
  private projKey: string = 'projectile';

  // ── Run stats (passed to GameOverScene for scoring) ───────────────────────
  private kills: number = 0;
  private playerName: string = 'Player';

  // ── Input ─────────────────────────────────────────────────────────────────
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameScene');
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init(data: GameSceneData): void {
    this.levelConfig    = data.levelConfig;
    this.elapsedSeconds = 0;
    this.isGameOver     = false;
    this.kills          = 0;
    this.playerName     = (this.registry.get('playerName') as string) || 'Player';
  }

  create(): void {
    const { worldWidth, worldHeight, backgroundColor } = this.levelConfig;

    // World bounds (enemies/player stay inside)
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // ── Register textures from level config ────────────────────────────────
    // Enemy textures are always created here so any new enemy key in a level
    // file works automatically without touching BootScene.
    this.registerLevelTextures();

    this.buildBackground(worldWidth, worldHeight, backgroundColor);

    // ── Player ─────────────────────────────────────────────────────────────
    this.player = new Player(
      this,
      worldWidth / 2,
      worldHeight / 2,
      this.levelConfig.initialPlayerStats,
    );

    // ── Physics groups ─────────────────────────────────────────────────────
    // runChildUpdate: true → each Enemy.update() is called automatically
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.projectiles = this.physics.add.group();
    this.xpOrbs = this.physics.add.group();

    // ── Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);

    // ── Input ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // ── Systems ────────────────────────────────────────────────────────────
    this.enemySpawner = new EnemySpawner(this, this.enemies, this.levelConfig, this.player);
    this.weaponSystem = new WeaponSystem(this, this.player, this.projectiles, this.enemies, this.projKey);
    this.uiManager    = new UIManager(this, this.player, this.levelConfig);
    this.joystick     = new VirtualJoystick(this);

    // ── Physics callbacks ──────────────────────────────────────────────────
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (proj, enemy) => this.onProjectileHitEnemy(proj as unknown as Projectile, enemy as unknown as Enemy),
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_player, enemy) => this.onPlayerTouchEnemy(enemy as unknown as Enemy),
    );

    this.physics.add.overlap(
      this.player,
      this.xpOrbs,
      (_player, orb) => this.onPlayerCollectOrb(orb as unknown as XPOrb),
    );

    // ── Upgrade event ──────────────────────────────────────────────────────
    // UpgradeScene emits this when a card is clicked
    this.events.on('upgrade-chosen', (option: UpgradeOption) => {
      option.apply(this.player.stats);
      // Cap current health to new max
      this.player.health = Math.min(this.player.health, this.player.stats.maxHealth);
    });

    // Clean up joystick listeners when this scene is shut down
    this.events.once('shutdown', () => this.joystick.destroy());
  }

  // ── Main loop ──────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    this.elapsedSeconds += delta / 1000;

    // Win condition check
    const win = this.levelConfig.winCondition;
    if (win?.type === 'survival' && this.elapsedSeconds >= win.duration) {
      this.endGame(true);
      return;
    }

    // ── Player movement ────────────────────────────────────────────────────
    let vx = 0;
    let vy = 0;

    // Keyboard
    if (this.cursors.left.isDown  || this.keyA.isDown) vx = -1;
    if (this.cursors.right.isDown || this.keyD.isDown) vx =  1;
    if (this.cursors.up.isDown    || this.keyW.isDown) vy = -1;
    if (this.cursors.down.isDown  || this.keyS.isDown) vy =  1;

    // Virtual joystick overrides keyboard when active
    const jDir = this.joystick.getDirection();
    if (jDir.x !== 0 || jDir.y !== 0) {
      vx = jDir.x;
      vy = jDir.y;
    }

    // Normalise diagonal keyboard movement
    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv;
      vy *= inv;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(vx * this.player.stats.speed, vy * this.player.stats.speed);

    // ── Update subsystems ──────────────────────────────────────────────────
    this.player.update(delta);
    this.enemySpawner.update(_time, delta, this.elapsedSeconds);
    this.weaponSystem.update(_time, delta);
    this.uiManager.update(this.elapsedSeconds);

    // Deactivate projectiles that have left the world
    this.cleanupProjectiles();

    // Check death
    if (this.player.isDead()) {
      this.endGame(false);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Create all textures needed by this level.
   * Enemy textures are always regenerated from config so new enemy keys
   * in any level file work without touching BootScene.
   * XP orb and projectile textures use level-specific keys when a style is provided.
   */
  private registerLevelTextures(): void {
    // Enemy textures — recreate each time to pick up config color/size
    for (const et of this.levelConfig.enemyTypes) {
      this.makeLevelTexture(`enemy_${et.key}`, et.size * 2, et.color);
    }

    // XP orb
    if (this.levelConfig.xpOrbStyle) {
      const { color, size } = this.levelConfig.xpOrbStyle;
      const key = `xp_orb_${this.levelConfig.name.replace(/\s+/g, '_')}`;
      this.makeLevelTexture(key, size * 2, color);
      this.xpOrbKey = key;
    } else {
      this.xpOrbKey = 'xp_orb'; // default from BootScene
    }

    // Projectile
    if (this.levelConfig.projectileStyle) {
      const { color, size } = this.levelConfig.projectileStyle;
      const key = `proj_${this.levelConfig.name.replace(/\s+/g, '_')}`;
      this.makeLevelTexture(key, size * 2, color);
      this.projKey = key;
    } else {
      this.projKey = 'projectile'; // default from BootScene
    }
  }

  /** Draw a filled circle into a texture. Removes old texture first to support level restart. */
  private makeLevelTexture(key: string, diameter: number, color: number): void {
    if (this.textures.exists(key)) this.textures.remove(key);
    const r = diameter / 2;
    const gfx = this.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(color, 1);
    gfx.fillCircle(r, r, r);
    gfx.generateTexture(key, diameter, diameter);
    gfx.destroy();
  }

  private buildBackground(w: number, h: number, bgColor: number): void {
    // Solid background
    this.add.rectangle(w / 2, h / 2, w, h, bgColor);

    // Subtle grid
    const gfx = this.add.graphics();
    gfx.lineStyle(1, 0x334466, 0.4);
    for (let x = 0; x <= w; x += 100) gfx.lineBetween(x, 0, x, h);
    for (let y = 0; y <= h; y += 100) gfx.lineBetween(0, y, w, y);
  }

  private onProjectileHitEnemy(proj: Projectile, enemy: Enemy): void {
    if (!proj.active || !enemy.active) return;
    proj.deactivate();
    const died = enemy.takeDamage(this.player.stats.attackDamage);
    if (died) {
      this.kills++;
      this.dropXPOrb(enemy.x, enemy.y, enemy.enemyConfig.xpValue);
      enemy.deactivate();
    }
  }

  private onPlayerTouchEnemy(enemy: Enemy): void {
    if (!enemy.active) return;
    this.player.takeDamage(enemy.enemyConfig.damage);
  }

  private onPlayerCollectOrb(orb: XPOrb): void {
    if (!orb.active) return;
    const leveled = this.player.gainXP(orb.value, this.levelConfig.xpToLevel);
    orb.deactivate();

    if (!leveled) return;

    const maxLevel = this.levelConfig.maxPlayerLevel ?? 3;

    if (this.player.level > maxLevel) {
      // Player collected enough XP at the final level → WIN
      this.endGame(true);
      return;
    }

    // Flash + wave on every level-up
    this.triggerDifficultySpike(this.player.level);
    this.showUpgradeMenu();
  }

  /** Camera flash + warning text + enemy wave burst on player level-up. */
  private triggerDifficultySpike(newPlayerLevel: number): void {
    // Built-in camera flash (red tint)
    this.cameras.main.flash(700, 200, 20, 20);

    const { width, height } = this.cameras.main;
    const waveSize  = newPlayerLevel === 2 ? 6 : 12;
    const label     = newPlayerLevel === 2
      ? '⚠  LEVEL 2 — ENEMY WAVE INCOMING'
      : '☠  LEVEL 3 — FINAL HORDE';
    const bgColor   = newPlayerLevel === 2 ? 0x2a1000 : 0x220000;
    const txtColor  = newPlayerLevel === 2 ? '#ff8800' : '#ff2222';

    const bg = this.add
      .rectangle(width / 2, height * 0.20, 400, 54, bgColor, 0.90)
      .setScrollFactor(0).setDepth(500);

    const txt = this.add
      .text(width / 2, height * 0.20, label, {
        fontSize: '20px', color: txtColor, fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0).setDepth(501);

    this.tweens.add({
      targets: [bg, txt],
      alpha: 0,
      delay: 1400,
      duration: 600,
      onComplete: () => { bg.destroy(); txt.destroy(); },
    });

    this.enemySpawner.spawnWave(waveSize);
  }

  private dropXPOrb(x: number, y: number, value: number): void {
    const existing = this.xpOrbs.getFirstDead(false) as XPOrb | null;
    if (existing) {
      existing.activate(x, y, value);
    } else {
      const orb = new XPOrb(this, x, y, value, this.xpOrbKey);
      this.xpOrbs.add(orb);
    }
  }

  private showUpgradeMenu(): void {
    // Pick 3 unique random upgrades from the level config
    const pool = [...this.levelConfig.availableUpgrades].sort(() => Math.random() - 0.5);
    const options = pool.slice(0, 3);

    this.scene.pause();
    this.scene.launch('UpgradeScene', { options, gameSceneKey: this.scene.key });
  }

  private cleanupProjectiles(): void {
    const { worldWidth, worldHeight } = this.levelConfig;
    for (const child of this.projectiles.getChildren()) {
      const proj = child as Projectile;
      if (proj.active && (
        proj.x < -60 || proj.x > worldWidth + 60 ||
        proj.y < -60 || proj.y > worldHeight + 60
      )) {
        proj.deactivate();
      }
    }
  }

  private endGame(isWin: boolean): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Stop the player
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    this.scene.launch('GameOverScene', {
      survived:   Math.floor(this.elapsedSeconds),
      level:      this.player.level,
      kills:      this.kills,
      playerName: this.playerName,
      levelName:  this.levelConfig.name,
      isWin,
    });
    this.scene.pause();
  }
}

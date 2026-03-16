/**
 * InteractionManager — Handles proximity detection and UI overlays.
 *
 * Manages:
 *   • Detecting when the player is near an interactable object.
 *   • Showing a small "Press E" prompt.
 *   • Opening photo frame modals.
 *   • Opening the birthday cake full-screen overlay (with candle blow-out).
 *   • Opening the Special Gift overlay (heart particle burst).
 */
class InteractionManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Player}       player
   * @param {InputHandler} inputHandler
   */
  constructor(scene, player, inputHandler) {
    this.scene        = scene;
    this.player       = player;
    this.input        = inputHandler;
    this.interactables = [];   // { sprite, type, data }
    this.activeTarget = null;
    this.overlayOpen  = false;
    this.promptText   = null;
    this.INTERACT_RADIUS = 50;

    this._createPrompt();
  }

  // ── Registration ──────────────────────────────────────────────

  /**
   * Register an interactable object.
   * @param {Phaser.GameObjects.GameObject} sprite
   * @param {'photo'|'cake'|'gift'} type
   * @param {object} [data] — Extra payload (e.g. { imageKey: 'photo1' }).
   */
  register(sprite, type, data = {}) {
    this.interactables.push({ sprite, type, data });
  }

  // ── Per-frame update ──────────────────────────────────────────

  update() {
    if (this.overlayOpen) return;

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    let closest = null;
    let closestDist = Infinity;

    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(px, py, obj.sprite.x, obj.sprite.y);
      if (dist < this.INTERACT_RADIUS && dist < closestDist) {
        closest = obj;
        closestDist = dist;
      }
    }

    this.activeTarget = closest;

    if (closest) {
      this.promptText.setPosition(closest.sprite.x, closest.sprite.y - 30);
      this.promptText.setVisible(true);

      if (this.input.isInteractPressed()) {
        this._handleInteraction(closest);
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  // ── Interaction dispatch ──────────────────────────────────────

  _handleInteraction(target) {
    if (target.type === 'photo') {
      this._openPhotoModal(target.data);
    } else if (target.type === 'cake') {
      this._openCakeOverlay();
    } else if (target.type === 'gift') {
      this._openGiftOverlay();
    }
  }

  // ── "Press E" floating prompt ─────────────────────────────────

  _createPrompt() {
    this.promptText = this.scene.add.text(0, 0, '[ E ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 6, y: 3 },
    })
      .setOrigin(0.5)
      .setDepth(1000)
      .setVisible(false);
  }

  // ── Photo Modal ───────────────────────────────────────────────

  /**
   * Show a centered modal with a placeholder image.
   *
   * TO USE YOUR OWN PHOTOS:
   *   1. In CabinScene.preload(), load images:
   *        this.load.image('photo1', 'assets/photo1.png');
   *   2. When registering the frame, pass the key:
   *        interactionMgr.register(frameSprite, 'photo', { imageKey: 'photo1' });
   *   3. The modal below will display it automatically.
   */
  _openPhotoModal(data) {
    this.overlayOpen = true;
    this.player.sprite.body.setVelocity(0, 0);

    const { width, height } = this.scene.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    const container = this.scene.add.container(0, 0).setDepth(2001);

    // Photo fills the entire screen — no border, no padding.
    if (data.imageKey && this.scene.textures.exists(data.imageKey)) {
      const img = this.scene.add.image(cx, cy, data.imageKey)
        .setDisplaySize(width, height)
        .setOrigin(0.5)
        .setInteractive();
      container.add(img);
    } else {
      const placeholder = this.scene.add.rectangle(cx, cy, width, height, 0x889988)
        .setInteractive();
      const label = this.scene.add.text(cx, cy, data.label || 'Photo\nPlaceholder', {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', align: 'center',
      }).setOrigin(0.5);
      container.add(placeholder);
      container.add(label);
    }

    // Hint text (fades out after a moment)
    const hint = this.scene.add.text(cx, height - 24, 'Press B to close', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
      backgroundColor: '#00000088', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setAlpha(0.8);
    container.add(hint);
    this.scene.tweens.add({
      targets: hint, alpha: 0, delay: 2000, duration: 600,
    });

    this._photoContainer = container;
  }

  // ── Cake Mini-Game Overlay ────────────────────────────────────

  static BLOWOUT_INTERVAL_MS = 150;
  static NUM_CANDLES = 20;

  // Adjust this to align the candle ring with the icing border on salma_cake.
  static CAKE_RADIUS = 120;

  _openCakeOverlay() {
    this.overlayOpen = true;
    this.player.sprite.body.setVelocity(0, 0);

    const { width, height } = this.scene.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    const container = this.scene.add.container(0, 0).setDepth(2001);

    // ── Solid blocker background (hides cabin, absorbs clicks) ─
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x111122)
      .setOrigin(0, 0).setDepth(2000).setInteractive();
    container.add(bg);

    // ── Full-screen salma_cake image ──────────────────────────
    if (this.scene.textures.exists('salma_cake')) {
      const cakeImg = this.scene.add.image(cx, cy, 'salma_cake')
        .setOrigin(0.5).setDepth(2001);
      const texW = cakeImg.width;
      const texH = cakeImg.height;
      const scale = Math.max(width / texW, height / texH);
      cakeImg.setScale(scale);
      container.add(cakeImg);
    } else {
      const fallback = this.scene.add.rectangle(cx, cy, width, height, 0xd4869a)
        .setInteractive();
      container.add(fallback);
      const fbLabel = this.scene.add.text(cx, cy,
        'Place salma_cake.jpeg in assets/', {
        fontFamily: 'monospace', fontSize: '14px', color: '#fff', align: 'center',
      }).setOrigin(0.5);
      container.add(fbLabel);
    }

    // ── Circular candle placement (trig) ─────────────────────
    const NUM_CANDLES = InteractionManager.NUM_CANDLES;
    const CAKE_RADIUS = InteractionManager.CAKE_RADIUS;
    const candles = [];

    for (let i = 0; i < NUM_CANDLES; i++) {
      const angle = (i / NUM_CANDLES) * Math.PI * 2 - Math.PI / 2;
      const fx = cx + Math.cos(angle) * CAKE_RADIUS;
      const fy = cy + Math.sin(angle) * CAKE_RADIUS;

      // Glow halo behind the candle
      const glow = this.scene.add.circle(fx, fy - 6, 12, 0xffaa33, 0.25)
        .setDepth(2002);
      container.add(glow);

      // Full candle sprite (generated texture: stick + wick + flame)
      const candle = this.scene.add.sprite(fx, fy, 'candle_lit')
        .setDepth(2003).setScale(1.5);
      container.add(candle);

      // Subtle flicker on the lit candle
      this.scene.tweens.add({
        targets: candle,
        scaleX: { from: 1.4, to: 1.6 },
        scaleY: { from: 1.45, to: 1.55 },
        alpha:  { from: 0.85, to: 1 },
        duration: 110 + Math.random() * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      candles.push({ candle, glow, x: fx, smokeY: fy - 20, lit: true });
    }

    // ── Counter ──────────────────────────────────────────────
    const counterText = this.scene.add.text(cx, 30, `0 / ${NUM_CANDLES}`, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2004);
    container.add(counterText);

    // ── Mic prompt & volume bar ──────────────────────────────
    const micLabel = this.scene.add.text(cx, height - 30,
      '🎤 Blow into your mic!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3, align: 'center',
    }).setOrigin(0.5).setDepth(2004);
    container.add(micLabel);

    const threshold = MicrophoneService.SENSITIVITY;
    const volBarBg = this.scene.add.rectangle(cx, height - 52, 180, 10, 0x333333, 0.6)
      .setOrigin(0.5).setDepth(2004);
    const volBarFg = this.scene.add.rectangle(cx - 90, height - 52, 0, 10, 0x44dd44)
      .setOrigin(0, 0.5).setDepth(2004);
    container.add(volBarBg);
    container.add(volBarFg);

    const markerX = cx - 90 + threshold * 180;
    const threshLine = this.scene.add.rectangle(markerX, height - 52, 2, 14, 0xffffff, 0.6)
      .setDepth(2004);
    container.add(threshLine);

    // ── Sequential blowout state ─────────────────────────────
    let nextIndex = 0;
    let blowTimer = null;
    let finished  = false;

    const blowOutNextCandle = () => {
      if (finished || nextIndex >= NUM_CANDLES) return;

      const c = candles[nextIndex];
      if (!c.lit) { nextIndex++; return; }

      c.lit = false;
      nextIndex++;

      // Stop the flicker and swap to the unlit texture (stick stays, flame gone)
      this.scene.tweens.killTweensOf(c.candle);
      c.candle.setTexture('candle_unlit');
      c.candle.setScale(1.5);
      c.candle.setAlpha(1);

      // Fade the glow
      this.scene.tweens.add({
        targets: c.glow,
        alpha: 0, duration: 250, ease: 'Power2',
      });

      this._spawnSmoke(container, c.x, c.smokeY);

      const blown = candles.filter(ca => !ca.lit).length;
      counterText.setText(`${blown} / ${NUM_CANDLES}`);

      if (blown >= NUM_CANDLES) {
        finished = true;
        if (blowTimer) blowTimer.remove(false);
        if (this._micService) this._micService.stop();
        this._showBirthdayMessage(container, cx, cy);
        this.scene.time.delayedCall(3000, () => {
          if (this._cakeContainer) {
            this._stopCakeOverlay(this._cakeContainer);
            this._cakeContainer = null;
          }
        });
      }
    };

    // ── Start microphone service ─────────────────────────────
    this._micService = new MicrophoneService({
      onVolume: (level) => {
        volBarFg.width = level * 180;
        volBarFg.setFillStyle(level >= threshold ? 0xff6644 : 0x44dd44);
      },
      onBlowStart: () => {
        if (finished) return;
        blowOutNextCandle();
        blowTimer = this.scene.time.addEvent({
          delay: InteractionManager.BLOWOUT_INTERVAL_MS,
          callback: blowOutNextCandle,
          loop: true,
        });
      },
      onBlowEnd: () => {
        if (blowTimer) {
          blowTimer.remove(false);
          blowTimer = null;
        }
      },
    });
    this._micService.start();

    this._cakeContainer = container;
    this._cakeBlowTimer = blowTimer;
  }

  _spawnSmoke(container, x, y) {
    const count = Phaser.Math.Between(2, 3);
    for (let i = 0; i < count; i++) {
      const smoke = this.scene.add.circle(
        x + Phaser.Math.Between(-3, 3), y,
        Phaser.Math.Between(2, 4), 0xaaaaaa, 0.6,
      ).setDepth(2003);
      container.add(smoke);

      this.scene.tweens.add({
        targets: smoke,
        y: y - Phaser.Math.Between(20, 45),
        x: x + Phaser.Math.Between(-8, 8),
        alpha: 0, scaleX: 1.8, scaleY: 2,
        duration: Phaser.Math.Between(400, 700),
        delay: i * 60,
        ease: 'Quad.easeOut',
        onComplete: () => smoke.destroy(),
      });
    }
  }

  _stopCakeOverlay(container) {
    if (this._micService) this._micService.stop();
    if (this._cakeBlowTimer) { this._cakeBlowTimer.remove(false); this._cakeBlowTimer = null; }
    container.destroy();
    this.overlayOpen = false;
  }

  // ── Special Gift Overlay (heart particle effect) ─────────────

  _openGiftOverlay() {
    this.overlayOpen = true;
    this.player.sprite.body.setVelocity(0, 0);

    const { width, height } = this.scene.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    const container = this.scene.add.container(0, 0).setDepth(2001);

    const bg = this.scene.add.rectangle(0, 0, width, height, 0x1a0011)
      .setOrigin(0, 0).setDepth(2000).setInteractive();
    container.add(bg);

    // Gift box (larger version of the in-world one)
    const boxY = cy + 30;
    const box = this.scene.add.rectangle(cx, boxY, 80, 60, 0xee3366)
      .setStrokeStyle(3, 0xaa1144).setScale(0);
    container.add(box);
    const ribbonV = this.scene.add.rectangle(cx, boxY, 6, 60, 0xffdd44).setScale(0);
    const ribbonH = this.scene.add.rectangle(cx, boxY - 4, 80, 6, 0xffdd44).setScale(0);
    container.add(ribbonV);
    container.add(ribbonH);
    const bow1 = this.scene.add.circle(cx - 10, boxY - 34, 8, 0xffdd44).setScale(0);
    const bow2 = this.scene.add.circle(cx + 10, boxY - 34, 8, 0xffdd44).setScale(0);
    container.add(bow1);
    container.add(bow2);

    // Animate box in
    const boxParts = [box, ribbonV, ribbonH, bow1, bow2];
    this.scene.tweens.add({
      targets: boxParts,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // After box appears, burst hearts and show message
    this.scene.time.delayedCall(700, () => {
      this._spawnHeartBurst(container, cx, boxY - 50, 35);

      const msg = this.scene.add.text(cx, cy - 80,
        '💝 Good job finding ts 🎂', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#ffddee',
        stroke: '#660033',
        strokeThickness: 3,
        align: 'center',
        lineSpacing: 6,
      }).setOrigin(0.5).setAlpha(0);
      container.add(msg);

      this.scene.tweens.add({
        targets: msg,
        alpha: 1,
        y: cy - 100,
        duration: 600,
        ease: 'Power2',
      });

      // Continuous subtle heart rain
      this._giftHeartTimer = this.scene.time.addEvent({
        delay: 300,
        loop: true,
        callback: () => {
          this._spawnSingleHeart(container, Phaser.Math.Between(cx - 160, cx + 160), 20);
        },
      });
    });

    // Close button
    const closeBtn = this.scene.add.text(width - 40, 20, '✕', {
      fontFamily: 'monospace', fontSize: '24px', color: '#fff',
      backgroundColor: '#cc3333', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this._giftHeartTimer) { this._giftHeartTimer.remove(false); this._giftHeartTimer = null; }
        container.destroy();
        this.overlayOpen = false;
      });
    container.add(closeBtn);

    this._giftContainer = container;
  }

  /** Burst of heart particles radiating outward from (cx, cy). */
  _spawnHeartBurst(container, cx, cy, count) {
    const heartColors = [0xff3366, 0xff6699, 0xff99bb, 0xffaacc, 0xcc2255];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const dist  = Phaser.Math.Between(40, 140);
      const size  = Phaser.Math.Between(4, 9);
      const color = Phaser.Utils.Array.GetRandom(heartColors);

      const heart = this.scene.add.text(cx, cy, '❤', {
        fontSize: `${size * 3}px`,
      }).setOrigin(0.5).setAlpha(0).setTint(color);
      container.add(heart);

      this.scene.tweens.add({
        targets: heart,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        alpha: { from: 1, to: 0 },
        scale: { from: 1.2, to: 0.3 },
        duration: Phaser.Math.Between(600, 1100),
        delay: Phaser.Math.Between(0, 200),
        ease: 'Quad.easeOut',
        onComplete: () => heart.destroy(),
      });
    }
  }

  /** A single heart that drifts down like snow. */
  _spawnSingleHeart(container, x, y) {
    const heartColors = [0xff3366, 0xff6699, 0xff99bb, 0xcc2255];
    const heart = this.scene.add.text(x, y, '❤', {
      fontSize: `${Phaser.Math.Between(10, 20)}px`,
    }).setOrigin(0.5).setAlpha(0.7)
      .setTint(Phaser.Utils.Array.GetRandom(heartColors));
    container.add(heart);

    this.scene.tweens.add({
      targets: heart,
      y: y + Phaser.Math.Between(300, 500),
      x: x + Phaser.Math.Between(-40, 40),
      alpha: 0,
      rotation: Phaser.Math.Between(-1, 1),
      duration: Phaser.Math.Between(2000, 3500),
      ease: 'Sine.easeIn',
      onComplete: () => heart.destroy(),
    });
  }

  // ── "Happy Birthday!" celebration ─────────────────────────────

  _showBirthdayMessage(container, cx, cy) {
    const msg = this.scene.add.text(cx, cy - 20, 'Happy Birthday Mama!', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: '#ffddaa',
      stroke: '#663300',
      strokeThickness: 4,
      align: 'center',
    })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);
    container.add(msg);

    this.scene.tweens.add({
      targets: msg,
      alpha: 1,
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut',
    });

    // Confetti-like particle bursts using simple circles
    for (let i = 0; i < 40; i++) {
      const colors = [0xff6688, 0xffdd44, 0x66ccff, 0x88ff66, 0xff88ff];
      const p = this.scene.add.circle(
        cx + Phaser.Math.Between(-180, 180),
        cy + Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(3, 6),
        Phaser.Utils.Array.GetRandom(colors),
      ).setAlpha(0);
      container.add(p);

      this.scene.tweens.add({
        targets: p,
        alpha: { from: 1, to: 0 },
        y: p.y - Phaser.Math.Between(40, 120),
        x: p.x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(600, 1200),
        delay: Phaser.Math.Between(0, 400),
        ease: 'Quad.easeOut',
      });
    }
  }
}

/**
 * InputHandler — Unified keyboard + virtual button input.
 *
 * Keyboard: WASD / Arrow keys for movement, E / Space to interact.
 * Virtual:  D-pad buttons for movement, A to interact, B to close.
 *
 * Uses Pointer Events (pointerdown / pointerup / pointerleave /
 * pointercancel) which fire for BOTH mouse and touch, so a single
 * set of listeners covers desktop and mobile.  Multi-touch is
 * supported — the player can hold a direction and tap A simultaneously.
 */
class InputHandler {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;

    // ── Keyboard ────────────────────────────────────────────────
    this.cursors = scene.input.keyboard.createCursorKeys();

    this.wasd = {
      up:    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.spaceKey    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.closeKey    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.escKey      = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // ── Virtual button state ────────────────────────────────────
    this._touch = { up: false, down: false, left: false, right: false };
    this._touchInteract     = false;
    this._touchInteractRaw  = false;
    this._touchInteractPrev = false;

    this._setupVirtualControls();

    // Keyboard B / Esc closes overlays (mirrors the virtual B button)
    this.closeKey.on('down', () => this._triggerCloseOverlay());
    this.escKey.on('down',   () => this._triggerCloseOverlay());
  }

  // ── Public API ────────────────────────────────────────────────

  /** @returns {{ x: number, y: number }} Normalized direction (-1, 0, 1). */
  getDirection() {
    let x = 0;
    let y = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown  || this._touch.left)  x = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown || this._touch.right) x =  1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown    || this._touch.up)    y = -1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown  || this._touch.down)  y =  1;

    return { x, y };
  }

  /** @returns {boolean} True on the frame interact is first pressed. */
  isInteractPressed() {
    const kbJust = Phaser.Input.Keyboard.JustDown(this.interactKey) ||
                   Phaser.Input.Keyboard.JustDown(this.spaceKey);

    const touchJust = this._touchInteract;
    this._touchInteract = false;

    return kbJust || touchJust;
  }

  /** Call at the END of the scene's update(). */
  lateUpdate() {
    if (this._touchInteractRaw && !this._touchInteractPrev) {
      this._touchInteract = true;
    }
    this._touchInteractPrev = this._touchInteractRaw;
  }

  // ── Virtual control wiring (Pointer Events) ──────────────────

  _setupVirtualControls() {
    // D-pad: each direction is held while the pointer is down
    this._bindHold('dpad-up',    (on) => { this._touch.up    = on; });
    this._bindHold('dpad-down',  (on) => { this._touch.down  = on; });
    this._bindHold('dpad-left',  (on) => { this._touch.left  = on; });
    this._bindHold('dpad-right', (on) => { this._touch.right = on; });

    // A button: held state drives the one-frame interact flag
    this._bindHold('btn-a', (on) => { this._touchInteractRaw = on; });

    // B button: tap to close the current overlay
    this._bindTap('btn-b', () => { this._triggerCloseOverlay(); });
  }

  /**
   * Bind a hold-style button: state is true while pointer is down,
   * false when released or the pointer leaves the element.
   */
  _bindHold(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;

    const onDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      el.classList.add('pressed');
      onChange(true);
    };

    const onUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.releasePointerCapture(e.pointerId);
      el.classList.remove('pressed');
      onChange(false);
    };

    el.addEventListener('pointerdown',   onDown);
    el.addEventListener('pointerup',     onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave',  onUp);

    // Prevent context menu on long-press (mobile)
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Bind a tap-style button: fires the callback once per press,
   * with a brief visual highlight.
   */
  _bindTap(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;

    const onDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add('pressed');
      callback();
      setTimeout(() => el.classList.remove('pressed'), 120);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Close any open overlay (photo modal or cake screen).
   */
  _triggerCloseOverlay() {
    const mgr = this.scene.interactionMgr;
    if (!mgr || !mgr.overlayOpen) return;

    if (mgr._photoContainer) {
      mgr._photoContainer.destroy();
      mgr._photoContainer = null;
      mgr.overlayOpen = false;
    } else if (mgr._cakeContainer) {
      mgr._stopCakeOverlay(mgr._cakeContainer);
      mgr._cakeContainer = null;
    } else if (mgr._giftContainer) {
      if (mgr._giftHeartTimer) { mgr._giftHeartTimer.remove(false); mgr._giftHeartTimer = null; }
      mgr._giftContainer.destroy();
      mgr._giftContainer = null;
      mgr.overlayOpen = false;
    }
  }
}

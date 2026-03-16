/**
 * MicrophoneService — Uses the Web Audio API to detect "blowing" into the mic.
 *
 * Instead of firing a one-shot onBlow callback, this service exposes a
 * continuous `isBlowing` state that stays true while the user blows —
 * including a configurable grace period so quick breaths don't interrupt
 * the blowout sequence.
 *
 * Flow:
 *   1. Call start() to request mic access and begin monitoring volume.
 *   2. Each animation frame, onVolume(normalizedLevel) fires.
 *   3. Check `isBlowing` to know if the user is currently blowing.
 *   4. Call stop() to release the mic and clean up.
 */
class MicrophoneService {
  // ── Tuning constants (adjust these to taste) ────────────────
  static SENSITIVITY    = 0.70;   // 0-1 — volume level considered "blowing"
  static GRACE_PERIOD   = 150;    // ms — how long isBlowing stays true after volume dips

  /**
   * @param {object}   opts
   * @param {number}   [opts.threshold]       — Override SENSITIVITY.
   * @param {number}   [opts.gracePeriod]     — Override GRACE_PERIOD (ms).
   * @param {function} [opts.onVolume]         — Called every frame with the current level (0-1).
   * @param {function} [opts.onBlowStart]      — Fires once when blowing begins.
   * @param {function} [opts.onBlowEnd]        — Fires once when blowing ends (after grace period).
   */
  constructor(opts = {}) {
    this.threshold   = opts.threshold   ?? MicrophoneService.SENSITIVITY;
    this.gracePeriod = opts.gracePeriod  ?? MicrophoneService.GRACE_PERIOD;
    this.onVolume    = opts.onVolume     || (() => {});
    this.onBlowStart = opts.onBlowStart  || (() => {});
    this.onBlowEnd   = opts.onBlowEnd    || (() => {});

    this._stream     = null;
    this._ctx        = null;
    this._analyser   = null;
    this._data       = null;
    this._rafId      = null;
    this.active      = false;

    /** Whether the user is currently blowing (includes grace window). */
    this.isBlowing       = false;
    this._lastAboveTime  = 0;       // timestamp of last frame above threshold
    this._rawAbove       = false;   // true when volume is above threshold right now
  }

  /** Request microphone access and start monitoring. */
  async start() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const source   = this._ctx.createMediaStreamSource(this._stream);
      this._analyser = this._ctx.createAnalyser();
      this._analyser.fftSize = 256;
      this._analyser.smoothingTimeConstant = 0.3;
      source.connect(this._analyser);
      this._data = new Uint8Array(this._analyser.frequencyBinCount);
      this.active = true;
      this._poll();
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
    }
  }

  /** Internal: poll the analyser node every frame. */
  _poll() {
    if (!this.active) return;
    this._rafId = requestAnimationFrame(() => this._poll());

    this._analyser.getByteFrequencyData(this._data);

    let sum = 0;
    for (let i = 0; i < this._data.length; i++) sum += this._data[i];
    const avg = sum / this._data.length / 255;   // 0-1

    this.onVolume(avg);

    const now = performance.now();
    this._rawAbove = avg >= this.threshold;

    if (this._rawAbove) {
      this._lastAboveTime = now;
    }

    const wasBlowing = this.isBlowing;
    const withinGrace = (now - this._lastAboveTime) < this.gracePeriod;

    this.isBlowing = this._rawAbove || withinGrace;

    if (this.isBlowing && !wasBlowing) {
      this.onBlowStart();
    } else if (!this.isBlowing && wasBlowing) {
      this.onBlowEnd();
    }
  }

  /** Stop monitoring and release the mic stream. */
  stop() {
    this.active    = false;
    this.isBlowing = false;
    if (this._rafId)  cancelAnimationFrame(this._rafId);
    if (this._stream) this._stream.getTracks().forEach(t => t.stop());
    if (this._ctx)    this._ctx.close();
    this._stream = null;
    this._ctx    = null;
  }
}

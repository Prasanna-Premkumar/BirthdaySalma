/**
 * main.js — Phaser 3 game configuration & bootstrap.
 *
 * Wrapped in window 'load' to guarantee #screen-container exists.
 *
 * ENVELOPE mode fills the parent completely (may crop a sliver
 * on one axis). Background matches the cabin floor so any
 * exposed edge blends seamlessly.
 */
window.addEventListener('load', () => {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#9e7744',
    scale: {
      parent: 'screen-container',
      mode: Phaser.Scale.ENVELOPE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [CabinScene],
    pixelArt: true,
    roundPixels: true,
    input: {
      activePointers: 3,
    },
  };

  const game = new Phaser.Game(config);
});

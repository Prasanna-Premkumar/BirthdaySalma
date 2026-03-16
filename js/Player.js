/**
 * Player — Top-down character with 4-directional movement.
 *
 * Expects 16 individual images loaded in CabinScene.preload():
 *
 *   player_up_1 .. player_up_4      → walk-up
 *   player_down_1 .. player_down_4  → walk-down
 *   player_left_1 .. player_left_4  → walk-left
 *   player_right_1 .. player_right_4 → walk-right
 *
 * If the textures haven't been loaded, falls back to a colored
 * rectangle so the game still runs without assets.
 */
class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x — Spawn X (pixels).
   * @param {number} y — Spawn Y (pixels).
   */
  // Tweak this to make the player bigger or smaller in the cabin.
  static SCALE = 0.3;

  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = 120;
    this.facing = 'down';

    this.IDLE_TEXTURES = {
      up:    'player_up_1',
      down:  'player_down_1',
      left:  'player_left_1',
      right: 'player_right_1',
    };

    if (scene.textures.exists('player_down_1')) {
      this.sprite = scene.physics.add.sprite(x, y, 'player_down_1');
      this.sprite.setScale(Player.SCALE);
      this.sprite.body.setCollideWorldBounds(true);
      this._setupHitbox();
      this._createAnimations();
      this._hasSprite = true;
    } else {
      this.sprite = scene.add.rectangle(x, y, 24, 28, 0x55aaff);
      scene.physics.add.existing(this.sprite);
      this.sprite.body.setCollideWorldBounds(true);
      this._hasSprite = false;
    }
  }

  /**
   * Shrink the physics body to cover only the feet/lower portion
   * of the sprite so the head can visually overlap furniture above,
   * giving a top-down depth illusion.
   */
  _setupHitbox() {
    const frame = this.sprite.frame;
    const fw = frame.width;
    const fh = frame.height;

    const bodyW = Math.round(fw * 0.6);
    const bodyH = Math.round(fh * 0.3);
    const offsetX = Math.round((fw - bodyW) / 2);
    const offsetY = Math.round(fh - bodyH);

    this.sprite.body.setSize(bodyW, bodyH);
    this.sprite.body.setOffset(offsetX, offsetY);
  }

  _createAnimations() {
    const anims = this.scene.anims;

    const directions = [
      {
        key: 'walk-up',
        frames: [
          { key: 'player_up_1' },
          { key: 'player_up_2' },
          { key: 'player_up_3' },
          { key: 'player_up_4' },
        ],
      },
      {
        key: 'walk-down',
        frames: [
          { key: 'player_down_1' },
          { key: 'player_down_2' },
          { key: 'player_down_3' },
          { key: 'player_down_4' },
        ],
      },
      {
        key: 'walk-left',
        frames: [
          { key: 'player_left_1' },
          { key: 'player_left_2' },
          { key: 'player_left_3' },
          { key: 'player_left_4' },
        ],
      },
      {
        key: 'walk-right',
        frames: [
          { key: 'player_right_1' },
          { key: 'player_right_2' },
          { key: 'player_right_3' },
          { key: 'player_right_4' },
        ],
      },
    ];

    directions.forEach(dir => {
      if (!anims.exists(dir.key)) {
        anims.create({
          key: dir.key,
          frames: dir.frames,
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  }

  /**
   * Call every frame from the scene's update().
   * @param {{ x: number, y: number }} direction — from InputHandler.getDirection()
   */
  handleMovement(direction) {
    const { x: dx, y: dy } = direction;
    const body = this.sprite.body;

    body.setVelocity(dx * this.speed, dy * this.speed);

    if (dx !== 0 && dy !== 0) {
      body.velocity.normalize().scale(this.speed);
    }

    this._handleAnimation(dx, dy);
  }

  _handleAnimation(dx, dy) {
    if (dy > 0)      this.facing = 'down';
    else if (dy < 0) this.facing = 'up';
    else if (dx < 0) this.facing = 'left';
    else if (dx > 0) this.facing = 'right';

    if (!this._hasSprite) return;

    if (dx !== 0 || dy !== 0) {
      this.sprite.anims.play('walk-' + this.facing, true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setTexture(this.IDLE_TEXTURES[this.facing]);
    }
  }
}

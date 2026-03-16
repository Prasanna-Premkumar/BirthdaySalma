/**
 * CabinScene — The single-room wooden cabin.
 *
 * Everything is drawn procedurally with Phaser primitives so the game
 * works immediately without external assets.
 *
 * TO REPLACE WITH YOUR OWN TILEMAP / ASSETS:
 *   1. Load your tilemap + tileset in preload().
 *   2. Replace the _drawFloor / _drawWalls helpers with tilemap layer creation.
 *   3. Load your photo images:
 *        this.load.image('photo1', 'assets/photos/photo1.png');
 *   4. Load your player sprite sheet (see Player.js comments).
 */
class CabinScene extends Phaser.Scene {
    constructor() {
      super({ key: 'CabinScene' });
    }
  
    // ── Asset loading ─────────────────────────────────────────────
    preload() {
    // ── Cake sprites ───────────────────────────────────────────
    this.load.image('cake', 'assets/cabin_cake.png');           // small in-room cake
    this.load.image('salma_cake', 'assets/salma_cake.jpeg');    // full-screen blowout background

  
      // ── Player frames (16 individual images) ───────────────────
      // Replace paths below with the actual filenames in assets/.
      this.load.image('player_up_1',    'assets/back1.png');
      this.load.image('player_up_2',    'assets/back2.png');
      this.load.image('player_up_3',    'assets/back3.png');
      this.load.image('player_up_4',    'assets/back4.png');
  
      this.load.image('player_down_1',  'assets/front1.png');
      this.load.image('player_down_2',  'assets/front2.png');
      this.load.image('player_down_3',  'assets/front3.png');
      this.load.image('player_down_4',  'assets/front4.png');
  
      this.load.image('player_left_1',  'assets/left1.png');
      this.load.image('player_left_2',  'assets/left2.png');
      this.load.image('player_left_3',  'assets/left3.png');
      this.load.image('player_left_4',  'assets/left4.png');
  
      this.load.image('player_right_1', 'assets/right1.png');
      this.load.image('player_right_2', 'assets/right2.png');
      this.load.image('player_right_3', 'assets/right3.png');
      this.load.image('player_right_4', 'assets/right4.png');
  
      // ── Photo images for the 6 wall frames ─────────────────────
      this.load.image('photo1', 'assets/abg_heart_pixel_cropped_processed_by_imagy.png');
      this.load.image('photo2', 'assets/halloween_selfie_pixel_cropped_processed_by_imagy.png');
      this.load.image('photo3', 'assets/halloween_trio_pixel_cropped_processed_by_imagy.png');
      this.load.image('photo4', 'assets/kissing_pixel_cropped_processed_by_imagy.png');
      this.load.image('photo5', 'assets/selfie_pixel_cropped_processed_by_imagy.png');
      this.load.image('photo6', 'assets/theOg_pixel_cropped_processed_by_imagy.png');
    }
  
    // ── Scene creation ────────────────────────────────────────────
    create() {
      this._generateCandleTextures();

      this.CABIN = {
        x: 0,
        y: 0,
        w: 800,
        h: 600,
      };

      this._drawFloor();
      this._drawWalls();
  
      // ── Camera bounds ─────────────────────────────────────────
      this.cameras.main.setBounds(0, 0, 800, 600);
  
      // ── Player ──────────────────────────────────────────────────
      this.player = new Player(this, 400, 420);
  
      // ── Input ───────────────────────────────────────────────────
      this.inputHandler = new InputHandler(this);
  
      // ── Interaction manager ─────────────────────────────────────
      this.interactionMgr = new InteractionManager(this, this.player, this.inputHandler);
  
      // ── Static colliders group (furniture the player can't walk through) ─
      this.furniture = this.physics.add.staticGroup();
  
      // ── Floor decorations (under everything) ──────────────────
      this._drawRugs();
      this._drawFloorClutter();
  
      // ── Furniture & interactables ──────────────────────────────
      this._placeTable();
      this._placeCake();
      this._placePhotoFrames();
      this._placeFurniture();
      this._placeWindows();
      this._placeLamps();
      this._setupDecorations();
      this._placeSpecialGift();
  
      // ── Collisions: player vs. all furniture ──────────────────
      this.physics.add.collider(this.player.sprite, this.furniture);
  
      // ── Physics world bounds = cabin interior (inside walls) ────
      this.physics.world.setBounds(
        this.CABIN.x + 16,
        this.CABIN.y + 16,
        this.CABIN.w - 32,
        this.CABIN.h - 32,
      );
    }
  
    // ── Per-frame loop ────────────────────────────────────────────
    update() {
      if (this.interactionMgr.overlayOpen) {
        this.player.sprite.body.setVelocity(0, 0);
        this.inputHandler.lateUpdate();
        return;
      }
  
      const dir = this.inputHandler.getDirection();
      this.player.handleMovement(dir);
      this.interactionMgr.update();
      this.inputHandler.lateUpdate();
  
      this.player.sprite.setDepth(this.player.sprite.y);
    }
  
    // ════════════════════════════════════════════════════════════════
    //  GENERATED CANDLE TEXTURES (no external asset needed)
    // ════════════════════════════════════════════════════════════════

    _generateCandleTextures() {
      const W = 16;
      const H = 32;

      // ── Lit candle ──────────────────────────────────────────────
      const gLit = this.make.graphics({ x: 0, y: 0, add: false });

      // Wax stick
      gLit.fillStyle(0xeedd88);
      gLit.fillRect(5, 14, 6, 16);
      gLit.lineStyle(1, 0xccbb66);
      gLit.strokeRect(5, 14, 6, 16);

      // Wick
      gLit.fillStyle(0x444444);
      gLit.fillRect(7, 10, 2, 5);

      // Flame outer
      gLit.fillStyle(0xff9922);
      gLit.fillEllipse(8, 7, 8, 12);

      // Flame inner (bright core)
      gLit.fillStyle(0xffdd44);
      gLit.fillEllipse(8, 8, 4, 7);

      // Flame tip highlight
      gLit.fillStyle(0xffffcc);
      gLit.fillEllipse(8, 6, 2, 4);

      gLit.generateTexture('candle_lit', W, H);
      gLit.destroy();

      // ── Unlit candle ────────────────────────────────────────────
      const gOff = this.make.graphics({ x: 0, y: 0, add: false });

      // Wax stick (same)
      gOff.fillStyle(0xeedd88);
      gOff.fillRect(5, 14, 6, 16);
      gOff.lineStyle(1, 0xccbb66);
      gOff.strokeRect(5, 14, 6, 16);

      // Wick (slightly charred)
      gOff.fillStyle(0x333333);
      gOff.fillRect(7, 10, 2, 5);

      // Tiny smoke wisp
      gOff.fillStyle(0xaaaaaa, 0.5);
      gOff.fillCircle(8, 7, 2);
      gOff.fillStyle(0xbbbbbb, 0.3);
      gOff.fillCircle(7, 4, 1.5);

      gOff.generateTexture('candle_unlit', W, H);
      gOff.destroy();
    }

    // ════════════════════════════════════════════════════════════════
    //  DRAWING HELPERS — replace these with tilemap layers if desired
    // ════════════════════════════════════════════════════════════════
  
    _drawFloor() {
      const { x, y, w, h } = this.CABIN;
      const TILE = 32;
  
      for (let row = 0; row < h / TILE; row++) {
        for (let col = 0; col < w / TILE; col++) {
          const px = x + col * TILE + TILE / 2;
          const py = y + row * TILE + TILE / 2;
          // Alternate wood plank shading
          const shade = (row + col) % 2 === 0 ? 0x9e7744 : 0x8b6832;
          this.add.rectangle(px, py, TILE, TILE, shade).setStrokeStyle(1, 0x7a5828);
        }
      }
    }
  
    _drawWalls() {
      const { x, y, w, h } = this.CABIN;
      const WALL = 16;
      const wallColor = 0x6b4226;
      const trimColor = 0x8b6840;
  
      // Top wall
      this.add.rectangle(x + w / 2, y + WALL / 2, w, WALL, wallColor).setStrokeStyle(2, trimColor);
      // Bottom wall
      this.add.rectangle(x + w / 2, y + h - WALL / 2, w, WALL, wallColor).setStrokeStyle(2, trimColor);
      // Left wall
      this.add.rectangle(x + WALL / 2, y + h / 2, WALL, h, wallColor).setStrokeStyle(2, trimColor);
      // Right wall
      this.add.rectangle(x + w - WALL / 2, y + h / 2, WALL, h, wallColor).setStrokeStyle(2, trimColor);
  
      // Upper wainscoting accent
      this.add.rectangle(x + w / 2, y + WALL + 4, w - 32, 8, 0x7a5530);
      // Baseboard
      this.add.rectangle(x + w / 2, y + h - WALL - 4, w - 32, 6, 0x5a3a1a);
    }
  
    // ── Table (center of room) ───────────────────────────────────
  
    _placeTable() {
      const tx = 400;
      const ty = 310;
  
      // Table shadow
      this.add.ellipse(tx, ty + 18, 130, 30, 0x000000, 0.15);
  
      // Table surface
      this.tableSprite = this.add.rectangle(tx, ty, 120, 60, 0x8b5e3c)
        .setStrokeStyle(2, 0x6b3e1c);
      // Legs
      this.add.rectangle(tx - 50, ty + 25, 6, 12, 0x6b3e1c);
      this.add.rectangle(tx + 50, ty + 25, 6, 12, 0x6b3e1c);
  
      this.tableSprite.setDepth(ty);
    }
  
    // ── Cake (on the table) ──────────────────────────────────────
  
    _placeCake() {
      const tx = 400;
      const ty = 296;
  
      // Cake depth must exceed the table's depth so it renders on top.
      const cakeDepth = this.tableSprite.depth + 1;
  
      if (this.textures.exists('cake')) {
        this.cakeSprite = this.add.image(tx, ty, 'cake')
          .setDisplaySize(52, 48)
          .setDepth(cakeDepth);
      } else {
        this.cakeSprite = this.add.rectangle(tx, ty, 36, 28, 0xf4a6c2)
          .setStrokeStyle(1, 0xd4869a)
          .setDepth(cakeDepth);
      }
  
      this.cakeLabel = this.add.text(tx, 316, 'Happy Birthday Salma', {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#ffddcc',
        stroke: '#553322',
        strokeThickness: 2,
        align: 'center',
      }).setOrigin(0.5).setDepth(cakeDepth + 1);
  
      // Register the label text as the interactable (player faces this to trigger blowout)
      this.interactionMgr.register(this.cakeLabel, 'cake');
    }
  
    // ── Photo Frames (6 total along the walls) ────────────────────
  
    /**
     * Place 6 photo frames on the walls.
     *
     * TO USE YOUR OWN IMAGES:
     *   Change the `imageKey` in each frame's data to match the key
     *   you used in preload(). E.g.:
     *     { label: 'Trip to Paris', imageKey: 'photo1' }
     */
    _placePhotoFrames() {
      const { x, y, w } = this.CABIN;
      const wallY = y + 38;   // Increased padding below the top wall
  
      const frameData = [
        { label: '♡',  imageKey: 'photo1' },
        { label: '🎃', imageKey: 'photo2' },
        { label: '👻', imageKey: 'photo3' },
        { label: '💋', imageKey: 'photo4' },
        { label: '📸', imageKey: 'photo5' },
        { label: '✨', imageKey: 'photo6' },
      ];
  
      const spacing = w / (frameData.length + 1);
  
      frameData.forEach((data, i) => {
        const fx = x + spacing * (i + 1);
        const fy = wallY;
  
        // Frame border
        const frame = this.add.rectangle(fx, fy, 40, 32, 0xdec49c)
          .setStrokeStyle(2, 0xa08050)
          .setDepth(5);
  
        // Inner photo area
        this.add.rectangle(fx, fy, 32, 24, 0x889988).setDepth(5);
  
        // Tiny label beneath frame
        this.add.text(fx, fy + 22, data.label, {
          fontFamily: 'monospace', fontSize: '7px', color: '#ccbb99',
        }).setOrigin(0.5).setDepth(5);
  
        this.interactionMgr.register(frame, 'photo', data);
      });
    }
  
    // ══════════════════════════════════════════════════════════════
    //  RUGS & FLOOR DETAIL (depth 0 — under everything)
    // ══════════════════════════════════════════════════════════════
  
    _drawRugs() {
      // Large rug under the table / cake area
      this.add.ellipse(400, 330, 220, 140, 0x993333, 0.30).setDepth(0);
      this.add.ellipse(400, 330, 190, 115, 0xbb4444, 0.22).setDepth(0);
      this.add.ellipse(400, 330, 150, 85, 0xcc5555, 0.15).setDepth(0);
  
      // Small rug in the seating corner (bottom-right)
      this.add.ellipse(660, 480, 120, 70, 0x446688, 0.25).setDepth(0);
      this.add.ellipse(660, 480, 95, 50, 0x557799, 0.18).setDepth(0);
    }
  
    _drawFloorClutter() {
      const d = 0.5; // depth: just above floor
  
      // Party hats scattered
      this._drawPartyHat(180, 450, 0xff6688, d);
      this._drawPartyHat(620, 200, 0xffdd44, d);
      this._drawPartyHat(520, 520, 0x66ccff, d);
  
      // Stack of books near bookshelf
      const bx = 48, by = 310;
      this.add.rectangle(bx, by,     18, 6, 0xcc3333).setDepth(d);
      this.add.rectangle(bx, by - 6, 18, 6, 0x3366cc).setDepth(d);
      this.add.rectangle(bx, by -12, 18, 6, 0x33aa55).setDepth(d);
  
      // Small gift boxes on the floor
      this._drawGiftBox(140, 520, 0xee5588, 0xffdd44, d);
      this._drawGiftBox(700, 380, 0x5588ee, 0xff8844, d);
      this._drawGiftBox(260, 180, 0x55cc77, 0xffaaaa, d);
    }
  
    _drawPartyHat(x, y, color, depth) {
      this.add.triangle(x, y - 6, 0, 12, 6, 0, -6, 12, color, 0.6).setDepth(depth);
      this.add.circle(x, y - 12, 3, 0xffdd44, 0.8).setDepth(depth);
    }
  
    _drawGiftBox(x, y, boxColor, ribbonColor, depth) {
      this.add.rectangle(x, y, 18, 14, boxColor).setStrokeStyle(1, 0x333333).setDepth(depth);
      this.add.rectangle(x, y, 2, 14, ribbonColor).setDepth(depth);
      this.add.rectangle(x, y - 3, 18, 2, ribbonColor).setDepth(depth);
      // Bow
      this.add.circle(x - 3, y - 9, 3, ribbonColor, 0.8).setDepth(depth);
      this.add.circle(x + 3, y - 9, 3, ribbonColor, 0.8).setDepth(depth);
    }
  
    // ══════════════════════════════════════════════════════════════
    //  FURNITURE (with collision bodies)
    // ══════════════════════════════════════════════════════════════
  
    _placeFurniture() {
      const { x, y, w, h } = this.CABIN;
  
      // ── Bookshelf (left wall, upper area) ──────────────────────
      // REPLACE: this.load.image('bookshelf', 'assets/bookshelf.png');
      this.bookshelf = this._addFurniture(x + 36, y + 160, 30, 70, 0x6b4226, 'bookshelf');
      // Book spines
      const bookColors = [0xcc3333, 0x3366cc, 0x33aa55, 0xccaa33, 0x8833aa];
      for (let i = 0; i < 5; i++) {
        this.add.rectangle(x + 36, y + 130 + i * 12, 22, 8, bookColors[i])
          .setStrokeStyle(1, 0x222222).setDepth(y + 160);
      }
  
      // ── Wardrobe / closet (left wall, lower area) ──────────────
      // REPLACE: this.load.image('wardrobe', 'assets/wardrobe.png');
      this.wardrobe = this._addFurniture(x + 36, y + 350, 32, 56, 0x5a3a1a, 'wardrobe');
      this.add.rectangle(x + 36, y + 350, 2, 40, 0x4a2a10).setDepth(y + 350);
      this.add.circle(x + 28, y + 350, 2, 0xccaa66).setDepth(y + 350);
      this.add.circle(x + 44, y + 350, 2, 0xccaa66).setDepth(y + 350);
  
      // ── Sofa (bottom-right seating area) ───────────────────────
      // REPLACE: this.load.image('sofa', 'assets/sofa.png');
      this.sofa = this._addFurniture(660, 470, 80, 34, 0x884444, 'sofa');
      // Cushions
      this.add.rectangle(640, 470, 30, 22, 0xaa5555).setStrokeStyle(1, 0x773333).setDepth(470);
      this.add.rectangle(680, 470, 30, 22, 0xaa5555).setStrokeStyle(1, 0x773333).setDepth(470);
      // Back
      this.add.rectangle(660, 456, 80, 10, 0x773333).setStrokeStyle(1, 0x662222).setDepth(455);
  
      // ── Armchair (beside sofa) ─────────────────────────────────
      // REPLACE: this.load.image('armchair', 'assets/armchair.png');
      this.armchair = this._addFurniture(600, 500, 30, 28, 0x886644, 'armchair');
      this.add.rectangle(600, 490, 30, 8, 0x775533).setStrokeStyle(1, 0x664422).setDepth(490);
  
      // ── Extra chairs around the central table ──────────────────
      this.chairLeft  = this._addFurniture(340, 310, 22, 22, 0x7a5530, 'chair-left');
      this.chairRight = this._addFurniture(460, 310, 22, 22, 0x7a5530, 'chair-right');
      this.chairFront = this._addFurniture(400, 370, 22, 22, 0x7a5530, 'chair-front');
      this.chairBack  = this._addFurniture(400, 260, 22, 22, 0x7a5530, 'chair-back');
  
      // ── Potted plants (corners — fiddle leaf style) ────────────
      this._drawPottedPlant(x + w - 50, y + 50, true);
      this._drawPottedPlant(x + 50, y + h - 50, true);
      this._drawPottedPlant(x + w - 50, y + h - 50, true);
      this._drawPottedPlant(x + 50, y + 180, false); // fern variant
    }
  
    /**
     * Create a furniture rectangle with a static physics body for collision.
     * Depth is set to the object's Y so Y-sort works automatically.
     * @returns {Phaser.GameObjects.Rectangle}
     */
    _addFurniture(fx, fy, fw, fh, color, label) {
      const r = ((color >> 16) & 0xff) * 0.7 | 0;
      const g = ((color >> 8) & 0xff)  * 0.7 | 0;
      const b = (color & 0xff)         * 0.7 | 0;
      const strokeColor = (r << 16) | (g << 8) | b;
  
      const obj = this.add.rectangle(fx, fy, fw, fh, color)
        .setStrokeStyle(1, strokeColor)
        .setDepth(fy);
      this.furniture.add(obj);
      return obj;
    }
  
    _drawPottedPlant(px, py, isTall) {
      // Pot (with collision)
      this._addFurniture(px, py + 6, 18, 18, 0x995533, 'pot');
  
      const d = py; // Y-sort depth
      if (isTall) {
        // Fiddle leaf fig
        this.add.circle(px, py - 10, 14, 0x2d7a2d).setDepth(d);
        this.add.circle(px - 8, py - 18, 8, 0x3a9a3a).setDepth(d);
        this.add.circle(px + 8, py - 18, 8, 0x3a9a3a).setDepth(d);
        this.add.circle(px, py - 26, 9, 0x48b048).setDepth(d);
      } else {
        // Fern — low and bushy
        this.add.ellipse(px, py - 6, 28, 16, 0x2d7a2d, 0.8).setDepth(d);
        this.add.ellipse(px - 6, py - 10, 12, 8, 0x48b048, 0.6).setDepth(d);
        this.add.ellipse(px + 6, py - 10, 12, 8, 0x48b048, 0.6).setDepth(d);
      }
    }
  
    // ══════════════════════════════════════════════════════════════
    //  WINDOWS (on the side walls)
    // ══════════════════════════════════════════════════════════════
  
    _placeWindows() {
      const { x, y, w, h } = this.CABIN;
  
      // Left wall window
      this._drawWindow(x + 8, y + 240);
      // Right wall window
      this._drawWindow(x + w - 8, y + 240);
    }
  
    _drawWindow(wx, wy) {
      const d = 900; // always on top (wall layer)
      // Frame
      this.add.rectangle(wx, wy, 16, 60, 0x8b6840).setStrokeStyle(2, 0x6b4820).setDepth(d);
      // Sky/glow interior
      this.add.rectangle(wx, wy, 10, 52, 0x88bbdd).setDepth(d);
      // Cross pane
      this.add.rectangle(wx, wy, 10, 2, 0x6b4820).setDepth(d);
      // Warm light spill on the floor
      this.add.ellipse(wx + (wx < 400 ? 30 : -30), wy + 40, 50, 30, 0xffeeaa, 0.08).setDepth(0.1);
    }
  
    // ══════════════════════════════════════════════════════════════
    //  LAMPS (with additive glow)
    // ══════════════════════════════════════════════════════════════
  
    _placeLamps() {
      this._drawFloorLamp(180, 160);
      this._drawFloorLamp(660, 160);
    }
  
    _drawFloorLamp(lx, ly) {
      const d = ly;
      // Lamp stand
      this.add.rectangle(lx, ly + 10, 4, 30, 0x554433).setDepth(d);
      // Base
      this.add.ellipse(lx, ly + 26, 16, 6, 0x554433).setDepth(d);
      // Shade
      this.add.triangle(lx, ly - 12, -10, 12, 10, 12, 0, -6, 0xffeecc).setStrokeStyle(1, 0xddcc99).setDepth(d);
      // Bulb dot
      this.add.circle(lx, ly - 4, 3, 0xffffdd).setDepth(d);
  
      // Warm glow circle (additive blend for cozy lighting)
      const glow = this.add.circle(lx, ly, 50, 0xffcc66, 0.12).setDepth(0.2);
      glow.setBlendMode(Phaser.BlendModes.ADD);
  
      // Collision body so player can't walk through
      this._addFurniture(lx, ly + 10, 14, 14, 0x554433, 'lamp-base');
    }
  
    // ══════════════════════════════════════════════════════════════
    //  SPECIAL GIFT BOX (interactable — heart particle effect)
    // ══════════════════════════════════════════════════════════════
  
    _placeSpecialGift() {
      const gx = 700;
      const gy = 520;
      const d = gy;
  
      // Gift box body
      this.giftBox = this.add.rectangle(gx, gy, 28, 22, 0xee3366)
        .setStrokeStyle(2, 0xaa1144).setDepth(d);
      // Ribbon cross
      this.add.rectangle(gx, gy, 3, 22, 0xffdd44).setDepth(d);
      this.add.rectangle(gx, gy - 2, 28, 3, 0xffdd44).setDepth(d);
      // Bow
      this.add.circle(gx - 5, gy - 13, 4, 0xffdd44).setDepth(d);
      this.add.circle(gx + 5, gy - 13, 4, 0xffdd44).setDepth(d);
      this.add.circle(gx, gy - 14, 2, 0xffcc00).setDepth(d);
  
      // Sparkle hint
      const sparkle = this.add.circle(gx + 12, gy - 16, 3, 0xffffff, 0.6).setDepth(d);
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.2, to: 0.8 },
        scale: { from: 0.8, to: 1.3 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
  
      // Collision
      this._addFurniture(gx, gy, 28, 22, 0xee3366, 'gift-box');
  
      // Register as interactable
      this.interactionMgr.register(this.giftBox, 'gift');
    }
  
    // ══════════════════════════════════════════════════════════════
    //  WALL DECORATIONS — banner, streamers, balloons
    // ══════════════════════════════════════════════════════════════
  
    _setupDecorations() {
      const { x, y, w, h } = this.CABIN;
      const cabinLeft  = x + 18;
      const cabinRight = x + w - 18;
      const cabinW     = cabinRight - cabinLeft;
  
      // ── "Happy Birthday" banner ─────────────────────────────────
      const bannerY = y + 78;
      this.add.rectangle(x + w / 2, bannerY, w - 60, 16, 0xdd4466, 0.85).setDepth(900);
      this.add.text(x + w / 2, bannerY, '✦  HAPPY  BIRTHDAY  ✦', {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(900);
  
      // ── Sagging streamers (upper + lower rows) ──────────────────
      this._drawStreamerRow(cabinLeft, cabinW, bannerY + 16, 900);
      this._drawStreamerRow(cabinLeft, cabinW, y + h - 54, 900);
  
      // ── Balloon clusters ────────────────────────────────────────
      this._drawBalloonCluster(x + 120, y + 110);
      this._drawBalloonCluster(x + w - 120, y + 110);
      this._drawBalloonCluster(x + w / 2, y + 100);
    }
  
    _drawStreamerRow(startX, width, rowY, depth) {
      const colors   = [0xff6688, 0xffdd44, 0x66ccff, 0x88ff66, 0xff88ff, 0xffaa44];
      const pennantW = 22;
      const count    = Math.floor(width / pennantW);
      const gap      = width / count;
      const sagDepth = 40;
  
      const sagAt = (i) => {
        const t = count > 0 ? i / count : 0;
        return sagDepth * 4 * t * (1 - t);
      };
  
      for (let i = 0; i < count; i++) {
        const x1 = startX + gap * i;
        const y1 = rowY + sagAt(i);
        const x2 = startX + gap * (i + 1);
        const y2 = rowY + sagAt(i + 1);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const len = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
  
        this.add.rectangle(mx, my, len, 2, 0xdddddd, 0.5)
          .setRotation(angle).setDepth(depth);
      }
  
      for (let i = 0; i < count; i++) {
        const px = startX + gap * i + gap / 2;
        const py = rowY + sagAt(i + 0.5) + 10;
        this.add.triangle(px, py, 0, 0, 8, 16, -8, 16,
          colors[i % colors.length], 0.75).setDepth(depth);
      }
    }
  
    _drawBalloonCluster(cx, cy) {
      const balloons = [
        { dx: -10, dy: -6,  color: 0xff6688, r: 10 },
        { dx:   0, dy: -14, color: 0xffdd44, r: 11 },
        { dx:  10, dy: -4,  color: 0x66ccff, r: 10 },
      ];
      for (const b of balloons) {
        const bx = cx + b.dx, by = cy + b.dy;
        this.add.rectangle(bx, by + b.r + 12, 1, 24, 0xaaaaaa, 0.4).setDepth(900);
        this.add.ellipse(bx, by, b.r * 2, b.r * 2.3, b.color, 0.75).setDepth(900);
        this.add.ellipse(bx - 3, by - 4, 4, 6, 0xffffff, 0.3).setDepth(900);
      }
    }
  }
  
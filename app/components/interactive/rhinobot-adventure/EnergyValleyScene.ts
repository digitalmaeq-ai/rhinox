import * as Phaser from "phaser";

import type { Rect } from "@/lib/rhinobot-adventure/levels";
import {
  activateCheckpoint, answerChallenge, canFinish, collectCrystal, createState, finish, loseEnergy,
  type AdventureState,
} from "@/lib/rhinobot-adventure/state";
import { GAME_HEIGHT, GAME_WIDTH, TUNING } from "@/lib/rhinobot-adventure/tuning";

import { createTextures } from "./textures";
import type { GameOptions } from "./types";

type Body = Phaser.Physics.Arcade.Body;

// The Phaser scene for one level. All rules live in lib/rhinobot-adventure
// (state.ts); this file only moves things around and draws them.
export default class EnergyValleyScene extends Phaser.Scene {
  private options: GameOptions;
  private state!: AdventureState;
  private player!: Phaser.Physics.Arcade.Sprite;
  private deck!: Phaser.GameObjects.TileSprite;
  private barrier!: Phaser.GameObjects.Rectangle;
  private barrierBody!: Phaser.GameObjects.Zone;
  private field!: Phaser.GameObjects.Rectangle;
  private arcs!: Phaser.GameObjects.Graphics;
  private crystalSprites = new Map<string, Phaser.Physics.Arcade.Sprite>();
  private checkpointSprites = new Map<string, Phaser.GameObjects.Image>();
  private blades: Phaser.GameObjects.Image[] = [];
  private clouds: Phaser.GameObjects.Image[] = [];
  private parallax: { layer: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private booted = false;

  private lastGrounded = 0;
  private jumpPressedAt = -10_000;
  private prevJump = false;
  private jumping = false;
  private invulnerableUntil = 0;
  private stunnedUntil = 0;
  private gateArmed = true;
  private challengeOpen = false;
  private stationToastAt = -10_000;
  private wasGrounded = true;
  private runClock = 0;
  private lastSecond = -1;
  private ended = false;

  constructor(options: GameOptions) {
    super("EnergyValley");
    this.options = options;
  }

  create() {
    const { level } = this.options;
    createTextures(this);
    this.state = createState();
    this.ended = false;
    this.challengeOpen = false;
    this.gateArmed = true;
    this.lastSecond = -1;
    this.crystalSprites.clear();
    this.checkpointSprites.clear();
    this.blades = [];
    this.clouds = [];
    this.parallax = [];
    this.lastGrounded = 0;
    this.jumpPressedAt = -10_000;
    this.prevJump = false;
    this.jumping = false;
    this.invulnerableUntil = 0;
    this.stunnedUntil = 0;
    this.stationToastAt = -10_000;
    this.wasGrounded = true;
    this.runClock = 0;

    this.physics.world.setBounds(0, 0, level.width, level.height + 400);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, level.width, level.height);

    this.buildBackground();
    this.buildTerrain();
    this.buildGate();
    this.buildHazards();
    this.buildCollectables();
    this.buildStation();
    this.buildPlayer();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(80, 60);
    this.emitState();
    if (this.options.startPaused && !this.booted) {
      this.booted = true;
      this.scene.pause();
    }
  }

  /* -------------------------------- building ------------------------------ */

  private buildBackground() {
    const { level, reducedMotion } = this.options;
    this.add.image(0, 0, "sky").setOrigin(0, 0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setScrollFactor(0).setDepth(-100);

    const far = this.add.tileSprite(0, GAME_HEIGHT - 300, GAME_WIDTH, 300, "hills-far").setOrigin(0, 0).setScrollFactor(0).setDepth(-90);
    const near = this.add.tileSprite(0, GAME_HEIGHT - 240, GAME_WIDTH, 240, "hills-near").setOrigin(0, 0).setScrollFactor(0).setDepth(-80);
    this.parallax.push({ layer: far, factor: 0.12 }, { layer: near, factor: 0.3 });

    for (let i = 0; i < 7; i += 1) {
      const cloud = this.add.image(120 + i * 380, 70 + (i % 3) * 46, "cloud").setScrollFactor(0.18).setDepth(-85).setAlpha(0.85).setScale(0.8 + (i % 3) * 0.25);
      this.clouds.push(cloud);
    }

    // Wind turbines: the valley's clean-energy theme.
    for (let x = 260; x < level.width; x += 520) {
      const baseY = GAME_HEIGHT - 60;
      this.add.image(x, baseY, "turbine-pole").setOrigin(0.5, 1).setScrollFactor(0.6).setDepth(-70);
      const blades = this.add.image(x, baseY - 186, "turbine-blades").setScrollFactor(0.6).setDepth(-69);
      this.blades.push(blades);
    }

    if (!reducedMotion) {
      this.tweens.add({ targets: this.blades, angle: 360, duration: 9000, repeat: -1 });
    }
  }

  private solidTile(rect: Rect, key: string) {
    const tile = this.add.tileSprite(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, key).setDepth(-5);
    this.physics.add.existing(tile, true);
    return tile;
  }

  private buildTerrain() {
    const { level } = this.options;
    this.terrain = [];
    level.ground.forEach((rect) => this.terrain.push(this.solidTile(rect, "ground")));
    level.platforms.forEach((rect) => this.terrain.push(this.solidTile(rect, "platform")));
  }
  private terrain: Phaser.GameObjects.TileSprite[] = [];

  private buildGate() {
    const { level } = this.options;
    const { bridge, chasm, trigger } = level.gate;

    // Holographic "ghost" deck: visible but not solid until the bridge is powered.
    this.deck = this.add.tileSprite(bridge.x + bridge.w / 2, bridge.y + bridge.h / 2, bridge.w, bridge.h, "deck").setAlpha(0.18).setDepth(-5);
    this.physics.add.existing(this.deck, true);
    (this.deck.body as Phaser.Physics.Arcade.StaticBody).enable = false;

    // Energy barrier at the chasm edge so the player cannot walk or jump into it before it is powered.
    const barrierHeight = 420;
    this.field = this.add.rectangle(chasm.x - 6, chasm.y - barrierHeight / 2, 12, barrierHeight, 0x2ea8ff, 0.35).setDepth(2);
    this.barrier = this.field;
    this.barrierBody = this.add.zone(chasm.x - 6, chasm.y - barrierHeight / 2, 12, barrierHeight);
    this.physics.add.existing(this.barrierBody, true);
    if (!this.options.reducedMotion) {
      this.tweens.add({ targets: this.field, alpha: 0.15, duration: 600, yoyo: true, repeat: -1 });
    }

    // Terminal and sign
    this.add.rectangle(trigger.x + trigger.w - 16, chasm.y - 26, 36, 52, 0x16324f).setDepth(-4);
    this.add.rectangle(trigger.x + trigger.w - 16, chasm.y - 32, 26, 24, 0x6df0ff).setDepth(-3);
    this.add.text(trigger.x + trigger.w - 64, chasm.y - 118, "BRIDGE LOCKED", { fontFamily: "system-ui, sans-serif", fontSize: "13px", fontStyle: "bold", color: "#16324f", backgroundColor: "#ffd23f", padding: { x: 6, y: 3 } }).setDepth(-2);
  }

  private buildHazards() {
    const { level } = this.options;
    this.arcs = this.add.graphics().setDepth(3);
    level.hazards.forEach((rect) => {
      for (let x = rect.x; x < rect.x + rect.w - 1; x += 28) {
        this.add.image(x + 14, rect.y + rect.h / 2, "coil").setDepth(-2);
      }
    });
    this.add.text(level.hazards[0].x - 6, level.hazards[0].y - 70, "HIGH VOLTAGE", { fontFamily: "system-ui, sans-serif", fontSize: "12px", fontStyle: "bold", color: "#7a2200", backgroundColor: "#ffd23f", padding: { x: 5, y: 2 } }).setDepth(-2);
    this.drawArcs(0);
  }

  private drawArcs(time: number) {
    const { level, reducedMotion } = this.options;
    this.arcs.clear();
    level.hazards.forEach((rect) => {
      const count = Math.max(1, Math.floor(rect.w / 28));
      for (let i = 0; i < count - 1; i += 1) {
        const x1 = rect.x + i * 28 + 14;
        const x2 = x1 + 28;
        const y = rect.y + 4;
        this.arcs.lineStyle(2.5, 0x6df0ff, 1);
        this.arcs.beginPath();
        this.arcs.moveTo(x1, y);
        const jitter = reducedMotion ? 0 : 1;
        for (let s = 1; s < 5; s += 1) {
          const px = x1 + ((x2 - x1) * s) / 5;
          const py = y - 6 + Math.sin(time / 40 + s * 2 + i) * 9 * jitter - (reducedMotion ? 4 : 0);
          this.arcs.lineTo(px, py);
        }
        this.arcs.lineTo(x2, y);
        this.arcs.strokePath();
      }
    });
  }

  private buildCollectables() {
    const { level, reducedMotion } = this.options;
    level.crystals.forEach((spawn) => {
      const sprite = this.physics.add.sprite(spawn.x, spawn.y, "crystal").setDepth(1);
      const body = sprite.body as Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(26, 36);
      this.crystalSprites.set(spawn.id, sprite);
      if (!reducedMotion) {
        this.tweens.add({ targets: sprite, y: spawn.y - 8, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: sprite, scaleX: 0.82, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
    });

    level.checkpoints.forEach((spawn) => {
      const flag = this.add.image(spawn.x, spawn.y, "checkpoint-off").setOrigin(0.5, 1).setDepth(-2);
      this.checkpointSprites.set(spawn.id, flag);
    });
  }

  private buildStation() {
    const { station } = this.options.level;
    this.add.image(station.x + station.w / 2, station.y + station.h, "station").setOrigin(0.5, 1).setDepth(-3);
    this.add.text(station.x - 6, station.y - 30, "RESEARCH STATION", { fontFamily: "system-ui, sans-serif", fontSize: "13px", fontStyle: "bold", color: "#ffffff", backgroundColor: "#1b4b82", padding: { x: 6, y: 3 } }).setDepth(-2);
  }

  private buildPlayer() {
    const { level } = this.options;
    this.player = this.physics.add.sprite(level.spawn.x, level.spawn.y, "bot-idle").setDepth(2);
    const body = this.player.body as Body;
    body.setSize(26, 46);
    body.setOffset(11, 8);
    body.setMaxVelocity(TUNING.runSpeed, TUNING.maxFallSpeed);
    this.player.setCollideWorldBounds(true);
    this.placeAt(level.spawn.x, level.spawn.y);

    this.terrain.forEach((tile) => this.physics.add.collider(this.player, tile));
    this.physics.add.collider(this.player, this.deck);
    this.physics.add.collider(this.player, this.barrierBody);
  }

  /** Put RhinoBot's feet at (x, y). The body bottom sits 26px below the sprite centre. */
  private placeAt(x: number, y: number) {
    this.player.setPosition(x, y - 26);
    const body = this.player.body as Body;
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);
    this.cameras.main.centerOn(this.player.x, this.player.y);
  }

  /* -------------------------------- control ------------------------------- */

  resolveChallenge(correct: boolean) {
    this.state = answerChallenge(this.state, correct);
    this.emitState();
    this.options.emit({ type: "sfx", name: correct ? "level" : "bump" });
    if (correct) {
      this.options.emit({ type: "announce", message: "Correct! The bridge is powering up." });
      this.powerBridge();
    }
  }

  dismissChallenge() {
    this.gateArmed = false; // re-arms once RhinoBot leaves the zone
    this.challengeOpen = false;
  }

  private powerBridge() {
    this.challengeOpen = false;
    const finishBridge = () => {
      (this.deck.body as Phaser.Physics.Arcade.StaticBody).enable = true;
      this.deck.setAlpha(1);
      (this.barrierBody.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      this.barrier.setVisible(false);
    };
    if (this.options.reducedMotion) {
      finishBridge();
      return;
    }
    this.tweens.add({ targets: this.deck, alpha: 1, duration: 700, onComplete: finishBridge });
    this.tweens.add({ targets: this.field, alpha: 0, duration: 700 });
  }

  /* -------------------------------- updating ------------------------------ */

  update(time: number, delta: number) {
    if (this.ended) return;
    const { level, input, reducedMotion } = this.options;
    const body = this.player.body as Body;

    this.state = { ...this.state, elapsedMs: this.state.elapsedMs + delta };
    const second = Math.floor(this.state.elapsedMs / 1000);
    if (second !== this.lastSecond) {
      this.lastSecond = second;
      this.emitState();
    }

    // Parallax
    this.parallax.forEach(({ layer, factor }) => { layer.tilePositionX = this.cameras.main.scrollX * factor; });
    if (!reducedMotion) this.clouds.forEach((cloud, i) => { cloud.x += (0.12 + (i % 3) * 0.05) * (delta / 16); });
    this.drawArcs(reducedMotion ? 0 : time);

    // --- horizontal movement
    const grounded = body.blocked.down || body.touching.down;
    if (grounded) this.lastGrounded = time;
    const stunned = time < this.stunnedUntil;
    const dir = stunned ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (!stunned) {
      body.setAccelerationX(dir * (grounded ? TUNING.groundAccel : TUNING.airAccel));
      body.setDragX(dir === 0 ? (grounded ? TUNING.groundDrag : 500) : 0);
      if (dir !== 0) this.player.setFlipX(dir < 0);
    }

    // --- jumping: buffer, coyote time and variable height
    if (input.jump && !this.prevJump) this.jumpPressedAt = time;
    const buffered = time - this.jumpPressedAt <= TUNING.jumpBufferMs;
    const canCoyote = time - this.lastGrounded <= TUNING.coyoteMs;
    if (buffered && canCoyote && !this.jumping && !stunned) {
      body.setVelocityY(TUNING.jumpVelocity);
      this.jumping = true;
      this.jumpPressedAt = -10_000;
      this.lastGrounded = -10_000;
      this.options.emit({ type: "sfx", name: "move" });
    }
    if (this.jumping && !input.jump && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * TUNING.jumpCut);
      this.jumping = false;
    }
    if (grounded && body.velocity.y >= 0) this.jumping = false;
    this.prevJump = input.jump;

    // --- landing squash
    if (grounded && !this.wasGrounded && !reducedMotion) {
      this.tweens.add({ targets: this.player, scaleX: 1.15, scaleY: 0.86, duration: 70, yoyo: true });
    }
    this.wasGrounded = grounded;

    // --- animation frames
    this.runClock += delta;
    if (!grounded) this.player.setTexture("bot-jump");
    else if (Math.abs(body.velocity.x) > 40) this.player.setTexture(Math.floor(this.runClock / 110) % 2 === 0 ? "bot-run1" : "bot-run2");
    else this.player.setTexture("bot-idle");

    // --- invulnerability blink
    if (time < this.invulnerableUntil) this.player.setAlpha(Math.floor(time / 90) % 2 === 0 ? 0.35 : 1);
    else this.player.setAlpha(1);

    // --- falling into the chasm
    if (this.player.y > level.killY) this.handleFall();

    // --- overlaps (rectangles keep this independent of physics-group quirks)
    const box = this.playerRect();
    this.checkCrystals(box);
    this.checkHazards(box, time);
    this.checkCheckpoints(box);
    this.checkGate(box);
    this.checkStation(box, time);

    this.publishDebug();
  }

  private playerRect(): Phaser.Geom.Rectangle {
    const body = this.player.body as Body;
    return new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
  }

  private rectOf(rect: Rect): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(rect.x, rect.y, rect.w, rect.h);
  }

  private checkCrystals(box: Phaser.Geom.Rectangle) {
    this.crystalSprites.forEach((sprite, id) => {
      if (!sprite.active) return;
      const crystalBox = new Phaser.Geom.Rectangle(sprite.x - 14, sprite.y - 18, 28, 36);
      if (!Phaser.Geom.Intersects.RectangleToRectangle(box, crystalBox)) return;
      this.state = collectCrystal(this.state, id);
      this.burst(sprite.x, sprite.y);
      sprite.destroy();
      this.emitState();
      this.options.emit({ type: "sfx", name: "bolt" });
      this.options.emit({ type: "announce", message: `Energy crystal ${this.state.crystals.length} of ${this.options.level.crystalsNeeded} collected.` });
    });
  }

  private burst(x: number, y: number) {
    if (this.options.reducedMotion) return;
    const emitter = this.add.particles(x, y, "spark", {
      speed: { min: 70, max: 190 }, lifespan: 520, scale: { start: 0.9, end: 0 }, tint: [0x6df0ff, 0xffffff, 0xffd23f], quantity: 14, emitting: false,
    });
    emitter.setDepth(5);
    emitter.explode(14);
    this.time.delayedCall(700, () => emitter.destroy());
  }

  private checkHazards(box: Phaser.Geom.Rectangle, time: number) {
    if (time < this.invulnerableUntil) return;
    for (const hazard of this.options.level.hazards) {
      const hit = new Phaser.Geom.Rectangle(hazard.x + 4, hazard.y - 4, hazard.w - 8, hazard.h + 4);
      if (Phaser.Geom.Intersects.RectangleToRectangle(box, hit)) {
        this.hurt(time, true);
        return;
      }
    }
  }

  private hurt(time: number, knockback: boolean) {
    const result = loseEnergy(this.state);
    this.state = result.state;
    this.invulnerableUntil = time + TUNING.invulnerableMs;
    this.options.emit({ type: "sfx", name: "bump" });
    if (!this.options.reducedMotion) this.cameras.main.shake(120, 0.004);
    if (result.respawn) {
      this.respawn();
      this.options.emit({ type: "announce", message: "Out of energy. RhinoBot recharged at the last checkpoint." });
    } else {
      this.options.emit({ type: "announce", message: `Ouch! ${this.state.health} energy cells left.` });
      if (knockback) {
        const body = this.player.body as Body;
        const away = this.player.flipX ? 1 : -1;
        body.setVelocity(away * TUNING.knockbackX, TUNING.knockbackY);
        this.stunnedUntil = time + 260;
        this.jumping = false;
      }
    }
    this.emitState();
  }

  private handleFall() {
    const time = this.time.now;
    const result = loseEnergy(this.state);
    this.state = result.state;
    this.invulnerableUntil = time + TUNING.invulnerableMs;
    this.options.emit({ type: "sfx", name: "flat" });
    this.options.emit({ type: "announce", message: "RhinoBot fell. Back to the last checkpoint." });
    this.respawn();
    this.emitState();
  }

  private respawn() {
    const { level } = this.options;
    const checkpoint = level.checkpoints.find((c) => c.id === this.state.checkpointId);
    const point = checkpoint ?? level.spawn;
    this.placeAt(point.x, point.y);
    this.gateArmed = true;
  }

  private checkCheckpoints(box: Phaser.Geom.Rectangle) {
    this.options.level.checkpoints.forEach((spawn) => {
      if (this.state.checkpointId === spawn.id) return;
      const zone = new Phaser.Geom.Rectangle(spawn.x - 24, spawn.y - 100, 48, 100);
      if (!Phaser.Geom.Intersects.RectangleToRectangle(box, zone)) return;
      this.state = activateCheckpoint(this.state, spawn.id);
      this.checkpointSprites.get(spawn.id)?.setTexture("checkpoint-on");
      this.emitState();
      this.options.emit({ type: "sfx", name: "charge" });
      this.options.emit({ type: "announce", message: "Checkpoint saved." });
    });
  }

  private checkGate(box: Phaser.Geom.Rectangle) {
    if (this.state.challengeSolved) return;
    const inside = Phaser.Geom.Intersects.RectangleToRectangle(box, this.rectOf(this.options.level.gate.trigger));
    if (!inside) {
      this.gateArmed = true;
      return;
    }
    if (this.gateArmed && !this.challengeOpen) {
      this.challengeOpen = true;
      this.gateArmed = false;
      const body = this.player.body as Body;
      body.setVelocity(0, body.velocity.y);
      body.setAcceleration(0, 0);
      this.options.emit({ type: "challenge", challengeId: this.options.level.gate.challengeId });
    }
  }

  private checkStation(box: Phaser.Geom.Rectangle, time: number) {
    const { level } = this.options;
    if (!Phaser.Geom.Intersects.RectangleToRectangle(box, this.rectOf(level.station))) return;
    if (canFinish(this.state, level.crystalsNeeded)) {
      this.state = finish(this.state);
      this.ended = true;
      (this.player.body as Body).setVelocity(0, 0);
      (this.player.body as Body).setAcceleration(0, 0);
      this.emitState();
      this.options.emit({ type: "sfx", name: "win" });
      this.options.emit({ type: "won", state: this.state });
    } else if (time - this.stationToastAt > 2500) {
      this.stationToastAt = time;
      this.options.emit({ type: "station-locked", have: this.state.crystals.length, need: level.crystalsNeeded });
    }
  }

  private emitState() {
    this.options.emit({ type: "state", state: this.state });
  }

  // Read-only position readout for automated tests and accessibility tooling.
  private publishDebug() {
    const parent = this.game.canvas?.parentElement;
    if (!parent) return;
    parent.dataset.playerX = String(Math.round(this.player.x));
    parent.dataset.playerY = String(Math.round(this.player.y));
  }
}

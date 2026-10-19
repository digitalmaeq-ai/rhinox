import * as Phaser from "phaser";

// Temporary original artwork, drawn in code at start-up (no image files, no
// third-party assets). Swap any texture key for a loaded image later without
// touching the scene.

type Pose = "idle" | "run1" | "run2" | "jump";

function make(scene: Phaser.Scene, key: string, width: number, height: number, draw: (g: Phaser.GameObjects.Graphics) => void) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}

function drawBot(g: Phaser.GameObjects.Graphics, pose: Pose) {
  const legShift = pose === "run1" ? 4 : pose === "run2" ? -4 : 0;
  const tuck = pose === "jump" ? 6 : 0;
  // shadow-free; feet end at y=54
  // legs / wheels
  g.fillStyle(0x16324f, 1);
  g.fillRoundedRect(13 + legShift, 44 - tuck, 9, 10, 3);
  g.fillRoundedRect(26 - legShift, 44 - tuck, 9, 10, 3);
  g.fillStyle(0xf08a24, 1);
  g.fillRoundedRect(12 + legShift, 51 - tuck, 11, 4, 2);
  g.fillRoundedRect(25 - legShift, 51 - tuck, 11, 4, 2);
  // body
  g.fillStyle(0x1b4b82, 1);
  g.fillRoundedRect(11, 24, 26, 24, 7);
  g.fillStyle(0xdff0ff, 1);
  g.fillRoundedRect(17, 30, 14, 10, 3);
  g.fillStyle(0x2ea8ff, 1);
  g.fillRect(20, 33, 8, 4);
  // arms
  g.fillStyle(0x16324f, 1);
  const armUp = pose === "jump" ? -6 : 0;
  g.fillRoundedRect(5, 28 + armUp, 7, 14, 3);
  g.fillRoundedRect(36, 28 + armUp, 7, 14, 3);
  // head
  g.fillStyle(0x2f78c8, 1);
  g.fillRoundedRect(7, 4, 34, 26, 9);
  g.fillStyle(0x0c2036, 1);
  g.fillRoundedRect(11, 10, 26, 14, 6);
  g.fillStyle(0x6df0ff, 1);
  g.fillCircle(19, 17, 3.2);
  g.fillCircle(30, 17, 3.2);
  // ears
  g.fillStyle(0x1b4b82, 1);
  g.fillCircle(9, 6, 4);
  g.fillCircle(39, 6, 4);
  // rhino horn
  g.fillStyle(0xf08a24, 1);
  g.fillTriangle(35, 5, 47, 10, 36, 14);
  g.fillStyle(0xffc27a, 1);
  g.fillTriangle(37, 7, 44, 9, 37, 11);
  // antenna
  g.fillStyle(0x16324f, 1);
  g.fillRect(23, 0, 2, 5);
  g.fillStyle(0xffd23f, 1);
  g.fillCircle(24, 1, 2);
}

export function createTextures(scene: Phaser.Scene) {
  (["idle", "run1", "run2", "jump"] as Pose[]).forEach((pose) => make(scene, `bot-${pose}`, 48, 56, (g) => drawBot(g, pose)));

  make(scene, "crystal", 30, 40, (g) => {
    g.fillStyle(0x0f9ad8, 1);
    g.fillTriangle(15, 0, 29, 14, 15, 39);
    g.fillStyle(0x38d0ff, 1);
    g.fillTriangle(15, 0, 1, 14, 15, 39);
    g.fillStyle(0xbdf3ff, 1);
    g.fillTriangle(15, 0, 15, 14, 7, 12);
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(9, 10, 3, 6);
    g.lineStyle(1.5, 0x0a5f8f, 1);
    g.strokeTriangle(15, 0, 29, 14, 15, 39);
    g.strokeTriangle(15, 0, 1, 14, 15, 39);
  });

  make(scene, "spark", 10, 10, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(5, 5, 5);
  });

  make(scene, "ground", 64, 64, (g) => {
    g.fillStyle(0x16324f, 1);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x1f4d73, 1);
    g.fillRect(0, 12, 64, 52);
    g.lineStyle(2, 0x2ea8ff, 0.35);
    g.lineBetween(0, 34, 22, 34);
    g.lineBetween(22, 34, 22, 52);
    g.lineBetween(22, 52, 64, 52);
    g.lineBetween(40, 14, 40, 34);
    g.fillStyle(0x2ea8ff, 0.6);
    g.fillCircle(22, 34, 2.5);
    g.fillCircle(40, 34, 2.5);
    g.fillStyle(0x3ed6a0, 1);
    g.fillRect(0, 0, 64, 9);
    g.fillStyle(0x7bf0c8, 1);
    g.fillRect(0, 0, 64, 3);
  });

  make(scene, "platform", 64, 24, (g) => {
    g.fillStyle(0x16324f, 1);
    g.fillRoundedRect(0, 0, 64, 24, 5);
    g.fillStyle(0x2f78c8, 1);
    g.fillRect(0, 0, 64, 7);
    g.fillStyle(0x6df0ff, 1);
    g.fillRect(0, 0, 64, 3);
    g.fillStyle(0x2ea8ff, 0.7);
    g.fillRect(8, 14, 14, 3);
    g.fillRect(40, 14, 14, 3);
  });

  make(scene, "deck", 64, 26, (g) => {
    g.fillStyle(0xf08a24, 1);
    g.fillRect(0, 0, 64, 26);
    g.fillStyle(0xffd27a, 1);
    g.fillRect(0, 0, 64, 6);
    g.fillStyle(0x16324f, 1);
    for (let x = 4; x < 64; x += 16) g.fillRect(x, 10, 8, 4);
  });

  make(scene, "coil", 28, 26, (g) => {
    g.fillStyle(0x16324f, 1);
    g.fillRect(8, 12, 12, 14);
    g.fillStyle(0xffd23f, 1);
    g.fillRect(6, 10, 16, 4);
    g.fillStyle(0xff7a3d, 1);
    g.fillCircle(14, 6, 6);
    g.fillStyle(0xfff0b0, 1);
    g.fillCircle(14, 6, 3);
  });

  make(scene, "checkpoint-off", 44, 96, (g) => checkpoint(g, false));
  make(scene, "checkpoint-on", 44, 96, (g) => checkpoint(g, true));

  make(scene, "station", 130, 150, (g) => {
    g.fillStyle(0x16324f, 1);
    g.fillRoundedRect(10, 56, 110, 94, 8);
    g.fillStyle(0xe6f2ff, 1);
    g.fillRoundedRect(16, 62, 98, 82, 6);
    g.fillStyle(0x2f78c8, 1);
    g.fillRoundedRect(46, 98, 38, 52, 6);
    g.fillStyle(0x6df0ff, 1);
    g.fillRect(52, 104, 26, 40);
    g.fillStyle(0x2f78c8, 1);
    g.fillRoundedRect(24, 70, 26, 20, 4);
    g.fillRoundedRect(80, 70, 26, 20, 4);
    g.fillStyle(0x6df0ff, 0.9);
    g.fillRect(28, 74, 18, 12);
    g.fillRect(84, 74, 18, 12);
    g.fillStyle(0x1b4b82, 1);
    g.fillCircle(65, 56, 34);
    g.fillStyle(0x2ea8ff, 1);
    g.fillCircle(65, 56, 28);
    g.fillStyle(0xbdf3ff, 0.8);
    g.fillCircle(55, 46, 8);
    g.fillStyle(0x16324f, 1);
    g.fillRect(63, 0, 4, 24);
    g.fillStyle(0xf08a24, 1);
    g.fillCircle(65, 3, 4);
  });

  make(scene, "cloud", 150, 56, (g) => {
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(40, 34, 20);
    g.fillCircle(72, 26, 26);
    g.fillCircle(108, 34, 20);
    g.fillRoundedRect(30, 32, 90, 22, 11);
  });

  make(scene, "sky", 8, 540, (g) => {
    const bands = 27;
    for (let i = 0; i < bands; i += 1) {
      const t = i / (bands - 1);
      const r = Math.round(0x8c + (0xf2 - 0x8c) * t);
      const gr = Math.round(0xcf + (0xf8 - 0xcf) * t);
      const b = Math.round(0xff + (0xff - 0xff) * t);
      g.fillStyle((r << 16) | (gr << 8) | b, 1);
      g.fillRect(0, i * 20, 8, 21);
    }
  });

  make(scene, "hills-far", 640, 300, (g) => {
    g.fillStyle(0xb7d6f5, 1);
    g.beginPath();
    g.moveTo(0, 300);
    for (let x = 0; x <= 640; x += 16) g.lineTo(x, 140 + Math.sin((x / 640) * Math.PI * 2) * 50 + Math.sin((x / 640) * Math.PI * 12) * 14);
    g.lineTo(640, 300);
    g.closePath();
    g.fillPath();
  });

  make(scene, "hills-near", 640, 240, (g) => {
    g.fillStyle(0x8fc3ef, 1);
    g.beginPath();
    g.moveTo(0, 240);
    for (let x = 0; x <= 640; x += 16) g.lineTo(x, 100 + Math.sin((x / 640) * Math.PI * 4) * 36 + Math.cos((x / 640) * Math.PI * 26) * 8);
    g.lineTo(640, 240);
    g.closePath();
    g.fillPath();
  });

  make(scene, "turbine-pole", 14, 190, (g) => {
    g.fillStyle(0xf4f9ff, 1);
    g.fillTriangle(7, 0, 0, 190, 14, 190);
    g.fillStyle(0xcfe3f7, 1);
    g.fillTriangle(7, 0, 7, 190, 14, 190);
  });

  make(scene, "turbine-blades", 150, 150, (g) => {
    g.fillStyle(0xf4f9ff, 1);
    for (let i = 0; i < 3; i += 1) {
      const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const tipX = 75 + Math.cos(a) * 70;
      const tipY = 75 + Math.sin(a) * 70;
      const sx = Math.cos(a + Math.PI / 2) * 5;
      const sy = Math.sin(a + Math.PI / 2) * 5;
      g.fillTriangle(75 + sx, 75 + sy, 75 - sx, 75 - sy, tipX, tipY);
    }
    g.fillStyle(0xcfe3f7, 1);
    g.fillCircle(75, 75, 7);
  });
}

function checkpoint(g: Phaser.GameObjects.Graphics, on: boolean) {
  g.fillStyle(0x16324f, 1);
  g.fillRoundedRect(14, 30, 16, 66, 4);
  g.fillRoundedRect(6, 84, 32, 12, 4);
  g.fillStyle(on ? 0x3ed6a0 : 0x7d8ea3, 1);
  g.fillCircle(22, 22, 17);
  g.fillStyle(on ? 0xd9fff0 : 0xc9d4e0, 1);
  g.fillCircle(22, 22, 8);
  g.fillStyle(on ? 0x3ed6a0 : 0x7d8ea3, 1);
  g.fillRect(19, 40, 6, 24);
}

import * as Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH, TUNING } from "@/lib/rhinobot-adventure/tuning";

import EnergyValleyScene from "./EnergyValleyScene";
import type { GameController, GameOptions } from "./types";

// Creates the Phaser game. This module imports Phaser, so it must only ever be
// loaded in the browser (the React shell imports it dynamically in an effect).
export function createGame(parent: HTMLElement, options: GameOptions): GameController {
  const scene = new EnergyValleyScene(options);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#cfe8ff",
    scene,
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: TUNING.gravity }, debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    // Phaser slows game time for its first 120 frames and smooths deltas; on a
    // slow device that made the first seconds run in slow motion. Use real time.
    fps: { smoothStep: false, panicMax: 0 },
    render: { antialias: true, roundPixels: true },
    // The React shell owns the keyboard and touch input, so Phaser's own
    // listeners stay off (nothing captures keys or blocks page scrolling).
    input: { keyboard: false, gamepad: false },
    audio: { noAudio: true },
    disableContextMenu: true,
  });

  const isLive = () => !!game.scene.getScene("EnergyValley")?.sys?.isActive() || !!game.scene.getScene("EnergyValley")?.sys?.isPaused();

  return {
    setPaused(paused) {
      if (!isLive()) return;
      if (paused) game.scene.pause("EnergyValley");
      else game.scene.resume("EnergyValley");
    },
    resolveChallenge(correct) {
      scene.resolveChallenge(correct);
    },
    dismissChallenge() {
      scene.dismissChallenge();
    },
    restart() {
      game.scene.resume("EnergyValley");
      game.scene.stop("EnergyValley");
      game.scene.start("EnergyValley");
    },
    destroy() {
      game.destroy(true);
    },
  };
}

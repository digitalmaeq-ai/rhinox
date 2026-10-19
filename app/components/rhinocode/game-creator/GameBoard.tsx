"use client";

import type { CSSProperties, PointerEvent } from "react";

import { key, tileAt } from "@/lib/game-creator/engine";
import type { GameProject, GameState } from "@/lib/game-creator/types";

import { EnemyArt, PlayerArt, TileArt } from "./TileArt";
import styles from "./GameCreator.module.css";

interface GameBoardProps {
  project: GameProject;
  /** Which level to draw while editing (play mode uses the game's own level). */
  level: number;
  /** Present while playing: the player, the enemies and what has been collected. */
  game?: GameState;
  /** Painting (edit mode only). */
  onPaint?: (x: number, y: number) => void;
  /** Keyboard cursor in edit mode. */
  cursor?: { x: number; y: number } | null;
}

// The picture of a level. In edit mode a pointer press or drag paints squares;
// in play mode it shows the player and the enemies, and hides what was picked up.
export default function GameBoard({ project, level, game, onPaint, cursor }: GameBoardProps) {
  const shownLevel = game ? game.level : level;

  function cellFrom(event: PointerEvent<HTMLDivElement>): [number, number] | null {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * project.cols);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * project.rows);
    return x >= 0 && y >= 0 && x < project.cols && y < project.rows ? [x, y] : null;
  }

  function paint(event: PointerEvent<HTMLDivElement>) {
    if (!onPaint) return;
    const cell = cellFrom(event);
    if (cell) onPaint(cell[0], cell[1]);
  }

  const style = { "--cols": project.cols, "--rows": project.rows } as CSSProperties;
  const cells = [];
  for (let y = 0; y < project.rows; y += 1) {
    for (let x = 0; x < project.cols; x += 1) {
      const raw = tileAt(project, shownLevel, x, y);
      const taken = game?.collected.includes(key(x, y));
      // While playing, the start marker, enemy squares and picked-up items are just floor.
      const shown = game && (raw === "start" || raw === "enemy-h" || raw === "enemy-v" || ((raw === "coin" || raw === "key") && taken)) ? "floor" : raw;
      const isPlayer = game && game.x === x && game.y === y;
      const isCursor = cursor && cursor.x === x && cursor.y === y;
      const enemy = game?.enemies.find((e) => e.x === x && e.y === y);
      const doorOpen = shown === "door" && Boolean(game?.hasKey);
      const look = doorOpen ? "floor" : shown === "key" || shown === "door" ? "coin" : shown;
      cells.push(
        <div key={`${x},${y}`} className={`${styles.cell} ${styles[`tile_${look === "enemy-h" || look === "enemy-v" ? "coin" : look}`]} ${isCursor ? styles.cursor : ""}`}>
          <TileArt tile={shown} open={doorOpen} />
          {enemy ? <span className={styles.player}><EnemyArt /></span> : null}
          {isPlayer ? <span className={styles.player}><PlayerArt /></span> : null}
        </div>,
      );
    }
  }

  return (
    <div
      className={`${styles.board} ${onPaint ? styles.boardEdit : ""}`}
      style={style}
      onPointerDown={(event) => {
        if (!onPaint) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        paint(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) paint(event);
      }}
    >
      {cells}
    </div>
  );
}

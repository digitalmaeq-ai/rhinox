import type { ParsedLevel } from "@/lib/maze-coder/engine";

import styles from "./MazeBoard.module.css";

// The maze itself: floor tiles, energy chips, the charger and the robot.
// Pure presentation, shared by the playable experience and the homepage
// preview. The robot is positioned in percentages, so the board scales to
// whatever width it is given.

// Tiles get one of six border colours, in a fixed scatter, so the board is lively but never random between renders.
const EDGE_COLOURS = 6;

export interface RobotPose {
  x: number;
  y: number;
  /** Cumulative degrees (0 = facing north), so turns never spin backwards. */
  angle: number;
}

export default function MazeBoard({
  level,
  robot,
  takenChips,
  bumping = false,
  arrived = false,
  route,
  fit = false,
  label,
}: {
  level: ParsedLevel;
  robot: RobotPose;
  takenChips: ReadonlySet<number>;
  bumping?: boolean;
  arrived?: boolean;
  /** Optional hint overlay: tiles of the shortest route, drawn as a dotted line. */
  route?: readonly { x: number; y: number }[];
  /**
   * Fit inside a fixed square arena (the parent must be a size container):
   * the board scales to the largest size that fits, so only the tile size
   * changes between levels, never the size of the play area.
   */
  fit?: boolean;
  label: string;
}) {
  const { columns, rows } = level;
  const pct = (value: number, count: number) => `${(value / count) * 100}%`;

  const tiles = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      if (!level.floor[y][x]) continue;
      const isGoal = x === level.goal.x && y === level.goal.y;
      const isStart = x === level.start.x && y === level.start.y;
      tiles.push(
        <div
          key={`${x}-${y}`}
          className={`${styles.tile} ${styles[`edge${(x * 3 + y * 5 + (x * y) % 4) % EDGE_COLOURS}`]} ${(x + y) % 2 === 0 ? styles.tileAlt : ""} ${isStart ? styles.tileStart : ""} ${isGoal ? styles.tileGoal : ""}`}
          style={{ left: pct(x, columns), top: pct(y, rows), width: pct(1, columns), height: pct(1, rows) }}
        >
          {isGoal && (
            <svg viewBox="0 0 48 48" className={`${styles.art} ${arrived ? styles.charged : ""}`} aria-hidden="true" focusable="false">
              <ellipse cx="24" cy="34" rx="15" ry="6" fill="none" stroke="#3ddc97" strokeWidth="2" opacity="0.55" />
              <ellipse cx="24" cy="34" rx="10" ry="3.6" fill="rgba(61,220,151,0.22)" />
              <path d="M26 7 15 26h8l-3 13 13-19h-8Z" fill="#ffd25e" stroke="#e5a100" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          )}
        </div>,
      );
    }
  }

  return (
    <div
      className={styles.board}
      style={fit ? { aspectRatio: `${columns} / ${rows}`, width: `min(100cqw, calc(100cqh * ${columns} / ${rows}))` } : { aspectRatio: `${columns} / ${rows}` }}
      role="img"
      aria-label={label}
    >
      {tiles}

      {route && route.length > 1 && (
        <svg className={styles.route} viewBox={`0 0 ${columns} ${rows}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <polyline points={route.map((tile) => `${tile.x + 0.5},${tile.y + 0.5}`).join(" ")} fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
      )}

      {level.chips.map((chip, index) =>
        takenChips.has(index) ? null : (
          <div
            key={`chip-${index}`}
            className={styles.chip}
            style={{ left: pct(chip.x, columns), top: pct(chip.y, rows), width: pct(1, columns), height: pct(1, rows) }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 48 48" className={styles.art} focusable="false">
              <path d="M24 9 36 16v16L24 39 12 32V16Z" fill="#ffb020" stroke="#ffe08a" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m25 16-6 9h5l-1 7 7-10h-5Z" fill="#7a4a00" />
            </svg>
          </div>
        ),
      )}

      <div
        className={`${styles.robot} ${bumping ? styles.bump : ""}`}
        style={{ left: pct(robot.x, columns), top: pct(robot.y, rows), width: pct(1, columns), height: pct(1, rows) }}
        data-testid="maze-robot"
        data-x={robot.x}
        data-y={robot.y}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" className={styles.art} style={{ transform: `rotate(${robot.angle}deg)` }} focusable="false">
          <ellipse cx="24" cy="26" rx="15" ry="14" fill="rgba(0,0,0,0.28)" />
          <rect x="9" y="8" width="30" height="30" rx="10" fill="#3b9bff" stroke="#bfe0ff" strokeWidth="1.6" />
          <rect x="14" y="12" width="20" height="9" rx="4.5" fill="#0a2f63" />
          <circle cx="20" cy="16.5" r="2.3" fill="#7ee8ff" />
          <circle cx="28" cy="16.5" r="2.3" fill="#7ee8ff" />
          <rect x="17" y="26" width="14" height="8" rx="3" fill="#0f6fde" stroke="#bfe0ff" strokeWidth="1" />
          <path d="M24 2.5 28 8h-8Z" fill="#ffb020" />
        </svg>
      </div>
    </div>
  );
}

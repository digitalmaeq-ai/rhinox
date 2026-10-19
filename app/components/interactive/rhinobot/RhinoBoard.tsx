"use client";

import type { Cell, RobotState, World } from "@/lib/rhinobot/types";
import { DIR_NAMES } from "@/lib/rhinobot/types";

import styles from "./RhinoBotLab.module.css";
import { CellArt, RhinoBotArt } from "./RhinoVisuals";

// The 2D simulation board. It only draws: every position comes from the
// interpreter's RobotState, so the picture always matches the real programme.

interface Props {
  world: World;
  state: RobotState;
  bump: Cell | null;
  running: boolean;
}

export default function RhinoBoard({ world, state, bump, running }: Props) {
  const same = (a: Cell, b: Cell | null) => Boolean(b) && a.x === b!.x && a.y === b!.y;
  const cells = Array.from({ length: world.columns * world.rows }, (_, i) => ({ x: i % world.columns, y: Math.floor(i / world.columns) }));

  return (
    <div
      className={styles.grid}
      style={{ aspectRatio: `${world.columns} / ${world.rows}`, ["--ratio" as string]: world.columns / world.rows }}
      role="img"
      aria-label={`Grid of ${world.columns} by ${world.rows} squares. RhinoBot is in column ${state.x + 1}, row ${state.y + 1}, facing ${DIR_NAMES[state.dir]}${state.carrying ? " and carrying an item" : ""}.`}
    >
      <div className={styles.cells} style={{ gridTemplateColumns: `repeat(${world.columns}, 1fr)`, gridTemplateRows: `repeat(${world.rows}, 1fr)` }}>
        {cells.map((cell) => {
          const wall = world.walls.some((item) => same(cell, item));
          const item = state.items.some((entry) => same(cell, entry));
          return (
            <div
              key={`${cell.x}-${cell.y}`}
              data-cell={`${cell.x}-${cell.y}`}
              className={`${styles.cell} ${(cell.x + cell.y) % 2 === 0 ? styles.cellEven : ""} ${same(cell, bump) ? styles.cellBump : ""}`}
            >
              {same(cell, world.base) && <CellArt kind="base" />}
              {wall && <CellArt kind="rock" />}
              {same(cell, world.goal) && <span className={styles.goal}><CellArt kind="goal" /></span>}
              {same(cell, world.charger) && <span className={`${styles.charger} ${state.charged ? styles.chargerOn : ""}`}><CellArt kind="charger" /></span>}
              {item && <span className={styles.item}><CellArt kind="item" /></span>}
            </div>
          );
        })}
      </div>

      <div
        data-testid="rhinobot"
        data-x={state.x}
        data-y={state.y}
        data-dir={state.dir}
        className={`${styles.robot} ${running ? styles.robotRunning : ""}`}
        style={{
          width: `${100 / world.columns}%`,
          height: `${100 / world.rows}%`,
          left: `${(state.x / world.columns) * 100}%`,
          top: `${(state.y / world.rows) * 100}%`,
        }}
        aria-hidden="true"
      >
        <span className={styles.heading} style={{ transform: `rotate(${state.dir * 90}deg)` }}>
          <i />
        </span>
        <RhinoBotArt />
        {state.carrying && <span className={styles.carried}><CellArt kind="item" /></span>}
      </div>
    </div>
  );
}

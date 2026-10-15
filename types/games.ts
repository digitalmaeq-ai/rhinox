import type { BaseContent } from "./content";

export type GameType =
  | "puzzle"
  | "memory"
  | "matching"
  | "word"
  | "logic"
  | "simulation"
  | "strategy"
  | "arcade";

export interface GameContent extends BaseContent {
  contentType: "game";

  gameType?: GameType;

  instructions?: string;

  objectives?: string[];

  levels?: number;

  scoring?: string;

  rewards?: string[];

}
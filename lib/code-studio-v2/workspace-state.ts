export type WorkspaceEditorMode = "blocks" | "text";

export interface WorkspaceResetState {
  blocks: [];
  nextId: 1;
  result: null;
  textCode: "";
  parseError: null;
  traceIndex: -1;
}

/** Canonical empty state shared by the workspace Clear action and regression tests. */
export function createWorkspaceResetState(): WorkspaceResetState {
  return {
    blocks: [],
    nextId: 1,
    result: null,
    textCode: "",
    parseError: null,
    traceIndex: -1,
  };
}

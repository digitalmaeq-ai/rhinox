"use client";

import { useEffect, useRef } from "react";

import { BLOCK_DEFINITIONS, CATEGORY_COLOURS } from "@/lib/rhinobot/blocks";
import type { WorkspaceJson } from "@/lib/rhinobot/program";

import styles from "./RhinoBotLab.module.css";

// Wraps Google Blockly for React. Blockly is loaded in the browser only (a
// dynamic import inside an effect), so nothing Blockly-related runs while the
// page is rendered on the server. The workspace is disposed when the component
// unmounts.

export interface WorkspaceApi {
  getJson(): WorkspaceJson;
  load(json: WorkspaceJson): void;
  highlight(id: string | null): void;
  setToolbox(toolbox: unknown): void;
}

// On wide screens the block palette stays open beside the workspace, so the
// toolbox works as its own panel. On small screens it closes after each pick.
function pinPalette(workspace: import("blockly/core").WorkspaceSvg) {
  try {
    const wide = window.matchMedia("(min-width: 981px)").matches;
    const flyout = workspace.getFlyout() as unknown as { autoClose: boolean } | null;
    if (flyout) flyout.autoClose = !wide;
    if (wide) workspace.getToolbox()?.selectItemByPosition(1);
  } catch {
    /* the palette simply opens on demand */
  }
}

interface Props {
  toolbox: unknown;
  onReady: (api: WorkspaceApi) => void;
  onChange: (json: WorkspaceJson) => void;
  onNotice: (message: string) => void;
  locked: boolean;
}

type BlocklyModule = typeof import("blockly/core");

function buildTheme(Blockly: BlocklyModule) {
  const block = (colour: string, extra: Record<string, unknown> = {}) => ({ colourPrimary: colour, ...extra });
  return Blockly.Theme.defineTheme("rhinobot", {
    name: "rhinobot",
    base: Blockly.Themes.Zelos,
    blockStyles: {
      events_blocks: block(CATEGORY_COLOURS.events, { hat: "cap" }),
      movement_blocks: block(CATEGORY_COLOURS.movement),
      control_blocks: block(CATEGORY_COLOURS.control),
      logic_blocks: block(CATEGORY_COLOURS.logic),
      sensors_blocks: block(CATEGORY_COLOURS.sensors),
      actions_blocks: block(CATEGORY_COLOURS.actions),
    },
    categoryStyles: {
      events_category: { colour: CATEGORY_COLOURS.events },
      movement_category: { colour: CATEGORY_COLOURS.movement },
      control_category: { colour: CATEGORY_COLOURS.control },
      logic_category: { colour: CATEGORY_COLOURS.logic },
      sensors_category: { colour: CATEGORY_COLOURS.sensors },
      actions_category: { colour: CATEGORY_COLOURS.actions },
    },
    componentStyles: {
      workspaceBackgroundColour: "#f5f9ff",
      toolboxBackgroundColour: "#ffffff",
      toolboxForegroundColour: "#0f2a44",
      flyoutBackgroundColour: "#e9f1fc",
      flyoutForegroundColour: "#0f2a44",
      flyoutOpacity: 1,
      scrollbarColour: "#9db8dc",
      insertionMarkerColour: "#0f6fde",
      insertionMarkerOpacity: 0.3,
      cursorColour: "#0f6fde",
    },
    fontStyle: { family: "Inter, system-ui, sans-serif", weight: "700", size: 12 },
  });
}

export default function BlocklyWorkspace({ toolbox, onReady, onChange, onNotice, locked }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onChange, onNotice });
  const initialToolbox = useRef(toolbox);

  useEffect(() => {
    callbacks.current = { onChange, onNotice };
  });

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const Blockly = await import("blockly/core");
      const English = await import("blockly/msg/en");
      if (disposed || !holder.current) return;

      Blockly.setLocale(English as unknown as Record<string, string>);
      if (!Blockly.Blocks["rb_start"]) {
        Blockly.defineBlocksWithJsonArray(BLOCK_DEFINITIONS as unknown as object[]);
      }

      const workspace = Blockly.inject(holder.current, {
        toolbox: initialToolbox.current as never,
        renderer: "zelos",
        theme: buildTheme(Blockly),
        trashcan: true,
        sounds: false,
        media: "/blockly-media/",
        grid: { spacing: 28, length: 2, colour: "#d7e3f4", snap: true },
        zoom: { controls: true, wheel: false, startScale: 0.95, maxScale: 1.6, minScale: 0.6, scaleSpeed: 1.15 },
        move: { scrollbars: true, drag: true, wheel: true },
      });

      pinPalette(workspace);
      let loading = false;

      const keepOneStart = () => {
        const starts = workspace.getBlocksByType("rb_start", false);
        if (starts.length > 1) {
          starts.slice(1).forEach((extra) => extra.dispose(false));
          callbacks.current.onNotice("There is only one “when programme starts” block. The extra one was removed.");
        }
      };

      workspace.addChangeListener((event) => {
        if (loading || event.isUiEvent) return;
        keepOneStart();
        callbacks.current.onChange(Blockly.serialization.workspaces.save(workspace) as WorkspaceJson);
      });

      const api: WorkspaceApi = {
        getJson: () => Blockly.serialization.workspaces.save(workspace) as WorkspaceJson,
        load: (json) => {
          loading = true;
          try {
            Blockly.serialization.workspaces.load(json as never, workspace);
            workspace.scrollCenter();
          } finally {
            loading = false;
          }
          callbacks.current.onChange(Blockly.serialization.workspaces.save(workspace) as WorkspaceJson);
        },
        highlight: (id) => workspace.highlightBlock(id),
        setToolbox: (next) => {
          workspace.updateToolbox(next as never);
          pinPalette(workspace);
        },
      };

      const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
      observer.observe(holder.current);

      cleanup = () => {
        observer.disconnect();
        workspace.dispose();
      };
      onReady(api);
    })().catch((error: unknown) => {
      console.error("RhinoBot could not start Blockly", error);
      callbacks.current.onNotice("The block editor could not start. Please refresh the page.");
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
    // The workspace is created once; later toolbox changes go through the API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.workspaceFrame}>
      <div ref={holder} className={styles.workspace} data-testid="blockly-workspace" />
      {locked && (
        <div className={styles.workspaceLock} role="status">
          Running… press Stop to edit your blocks
        </div>
      )}
    </div>
  );
}

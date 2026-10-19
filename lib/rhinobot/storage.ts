// Saved programmes for the Robot Lab. They are stored as RhinoCode projects
// (lib/rhinocode/projects.ts), so they also appear in My Projects. Nothing
// leaves the device and there is no database. Every call is guarded, so
// private browsing or blocked storage simply means nothing is saved.

import { createProject, deleteProject, listProjects, type Project } from "@/lib/rhinocode/projects";

import type { WorkspaceJson } from "./program";

export interface SavedProgramme {
  id: string;
  name: string;
  savedAt: number;
  workspace: WorkspaceJson;
}

function toProgramme(project: Project): SavedProgramme {
  return { id: project.id, name: project.name, savedAt: project.updatedAt, workspace: project.data as WorkspaceJson };
}

export function loadSaved(): SavedProgramme[] {
  return listProjects("robot-program").map(toProgramme);
}

export function saveProgramme(name: string, workspace: WorkspaceJson): SavedProgramme[] {
  createProject("robot-program", name, workspace);
  return loadSaved();
}

export function deleteSaved(id: string): SavedProgramme[] {
  deleteProject(id);
  return loadSaved();
}

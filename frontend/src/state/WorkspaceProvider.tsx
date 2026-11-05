import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { WorkspaceData, Project } from "../data/workspace";
import { readWorkspace, STORAGE_KEY } from "../data/workspace";

interface WorkspaceContextValue {
  data: WorkspaceData;
  storageError: boolean;
  update: (updater: (data: WorkspaceData) => WorkspaceData) => void;
  updateProject: (id: string, updater: (project: Project) => Project) => void;
}
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(readWorkspace);
  const [storageError, setStorageError] = useState(false);
  const firstRender = useRef(true);
  const latest = useRef(data);
  latest.current = data;
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    };
    if (firstRender.current) {
      firstRender.current = false;
      save();
      return;
    }
    const timer = window.setTimeout(save, 180);
    return () => window.clearTimeout(timer);
  }, [data]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setData(readWorkspace());
    };
    const flush = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latest.current));
      } catch {
        /* Existing storage notice covers this case. */
      }
    };
    window.addEventListener("storage", sync);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("pagehide", flush);
    };
  }, []);
  const updateProject = (id: string, updater: (p: Project) => Project) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? updater(p) : p)),
    }));
  return (
    <WorkspaceContext.Provider
      value={{ data, storageError, update: setData, updateProject }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("WorkspaceProvider is missing");
  return context;
}

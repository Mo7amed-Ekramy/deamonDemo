import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MessageSquare,
  PanelLeftClose,
  Plus,
} from "lucide-react";
import type { Project } from "../data/workspace";
import { useWorkspace } from "../state/WorkspaceProvider";
import { Logo, ThemeToggle } from "./ui";

export function WorkspaceSidebar({
  project,
  view,
  chatId,
  newProject,
  newChat,
  selectChat,
  collapse,
}: {
  project: Project;
  view: "chat" | "map" | "preview";
  chatId: string;
  newProject: () => void;
  newChat: (project: Project) => void;
  selectChat: (id: string, projectId: string) => void;
  collapse: () => void;
}) {
  const { data } = useWorkspace();
  const [folder, setFolder] = useState({
    projectId: project.id,
    openId: project.id,
  });
  const openId = folder.projectId === project.id ? folder.openId : project.id;
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (view === "chat")
      list.current
        ?.querySelector('[aria-current="page"]')
        ?.scrollIntoView({ block: "nearest" });
  }, [chatId, project.id, view]);
  return (
    <aside
      id="workspace-sidebar"
      className="dc-nav workspace-navigation"
      aria-label="Workspace navigation"
    >
      <div className="sidebar-brand">
        <Logo className="dc-logo" />
        <button
          className="sidebar-collapse"
          onClick={collapse}
          aria-label="Hide project sidebar"
          aria-expanded="true"
          aria-controls="workspace-sidebar"
          title="Collapse sidebar"
        >
          <PanelLeftClose />
        </button>
      </div>
      <section className="sidebar-project-section" aria-label="Projects">
        <div className="sidebar-section-label">
          <span>PROJECTS</span>
          <button
            className="sidebar-add-project"
            onClick={newProject}
            aria-label="New project"
            title="Create a new project"
          >
            <Plus />
          </button>
        </div>
        <div className="sidebar-folders" ref={list}>
          {data.projects.map((item) => {
            const expanded = openId === item.id;
            const active = project.id === item.id;
            const folderId = `sidebar-folder-${item.id}`;
            const FolderIcon = expanded ? FolderOpen : Folder;
            return (
              <div className="sidebar-folder" key={item.id}>
                <div className="sidebar-folder-row" data-active={active}>
                  <button
                    className="sidebar-folder-toggle"
                    aria-expanded={expanded}
                    aria-controls={folderId}
                    title={item.name}
                    onClick={() =>
                      setFolder({
                        projectId: project.id,
                        openId: expanded ? "" : item.id,
                      })
                    }
                  >
                    <ChevronRight
                      className="sidebar-folder-chevron"
                      aria-hidden="true"
                    />
                    <FolderIcon aria-hidden="true" />
                    <span>{item.name}</span>
                  </button>
                  <button
                    className="sidebar-folder-add"
                    aria-label={`New chat in ${item.name}`}
                    title={`New chat in ${item.name}`}
                    onClick={() => {
                      setFolder({ projectId: item.id, openId: item.id });
                      newChat(item);
                    }}
                  >
                    <Plus aria-hidden="true" />
                  </button>
                </div>
                <div id={folderId} hidden={!expanded}>
                  <nav className="dc-chat-list" aria-label="Project conversations">
                    {item.chats.map((c) => {
                      const current = active && view === "chat" && c.id === chatId;
                      return (
                        <button
                          key={c.id}
                          className="dc-chat-item"
                          aria-current={current ? "page" : undefined}
                          title={c.title}
                          onClick={() => {
                            setFolder({ projectId: item.id, openId: item.id });
                            selectChat(c.id, item.id);
                          }}
                        >
                          <MessageSquare aria-hidden="true" />
                          <span>{c.title}</span>
                          {current && (
                            <span className="sidebar-active-dot" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="sidebar-profile">
        <span className="sidebar-avatar" aria-hidden="true">
          {data.displayName
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="sidebar-profile-info">
          <strong title={data.displayName}>{data.displayName}</strong>
          <small>
            {data.accountType === "agency"
              ? "Agency workspace"
              : "Business workspace"}
          </small>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

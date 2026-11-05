import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  Calendar,
  Check,
  Clapperboard,
  FileText,
  Image,
  Layers,
  MessageSquare,
  Plus,
  Type,
  Workflow,
  Eye,
  X,
  PanelLeftOpen,
  PanelRight,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "../components/ui";
import { WorkspaceSidebar } from "../components/WorkspaceSidebar";
import { CampaignPreview } from "../components/CampaignPreview";
import type { PreviewFormat } from "../components/CampaignPreview";
import { useWorkspace } from "../state/WorkspaceProvider";
import { applyDemoRequest, createProject, uid } from "../data/workspace";
import type { OutputLanguage, Project } from "../data/workspace";

type View = "chat" | "map" | "preview";
const CampaignMap = lazy(() =>
  import("../components/CampaignMap").then((module) => ({
    default: module.CampaignMap,
  })),
);
function NewProjectDialog({
  open,
  close,
  onCreate,
}: {
  open: boolean;
  close: () => void;
  onCreate: (project: Project) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const name = String(fields.get("name")).trim(),
      brief = String(fields.get("brief")).trim();
    if (!name || !brief) {
      setError("Enter a project name and a short brief.");
      return;
    }
    const project = createProject(
      name,
      brief,
      fields.get("language") as OutputLanguage,
      String(fields.get("market")).trim() || "Egypt",
    );
    e.currentTarget.reset();
    setError("");
    onCreate(project);
    close();
  }
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      onCancel={close}
      onClose={close}
      aria-labelledby="new-project-title"
    >
      <div className="dialog-heading">
        <div>
          <span className="eyebrow">MAKE ROOM FOR YOUR NEXT IDEA</span>
          <h2 id="new-project-title">Create a project.</h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Close new project"
        >
          <X />
        </button>
      </div>
      <p>A separate workspace with its own chats, plan and campaign outputs.</p>
      <form onSubmit={submit} className="project-form">
        <label>
          Project / business name
          <input
            name="name"
            placeholder="Your business or client"
            maxLength={80}
            required
          />
        </label>
        <label>
          What are we working on?
          <textarea
            name="brief"
            placeholder="Your product, campaign goal and audience…"
            maxLength={1200}
            rows={3}
            required
          />
        </label>
        <div className="form-two-cols">
          <label>
            Market
            <input
              name="market"
              defaultValue="Cairo, Egypt"
              maxLength={80}
              required
            />
          </label>
          <label>
            Output language
            <select name="language" defaultValue="Egyptian Arabic">
              <option>Egyptian Arabic</option>
              <option>Arabic</option>
              <option>English</option>
            </select>
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        <button className="dc-primary" type="submit">
          Create project <ArrowUpRight />
        </button>
      </form>
    </dialog>
  );
}
function AgentMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="dc-agent">
      <span className="dc-avatar">d.</span>
      <div>{children}</div>
    </div>
  );
}
function ProjectOutputs({
  project,
  chatCount,
  openMap,
  preview,
  source,
  close,
  changeLanguage,
}: {
  project: Project;
  chatCount: number;
  openMap: (node: string) => void;
  preview: (format: PreviewFormat) => void;
  source: (id: string) => void;
  close: () => void;
  changeLanguage: (value: string) => void;
}) {
  const p = project.plan,
    last = p.changes.at(-1);
  function output(
    title: string,
    sub: string,
    Icon: LucideIcon,
    action: () => void,
    changed = false,
  ) {
    return (
      <button
        className={`dc-artifact ${changed ? "dc-changed" : ""}`}
        onClick={action}
      >
        <Icon />
        <strong>
          {title}
          <small>{sub}</small>
        </strong>
        <ArrowUpRight />
      </button>
    );
  }
  return (
    <aside
      id="shared-project-outputs"
      className="dc-artifacts"
      aria-label="Shared project outputs"
    >
      <div className="dc-section-head">
        <h3>Project outputs</h3>
        <div className="outputs-heading-actions">
          <span>v{p.version}</span>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close project outputs"
          >
            <X />
          </button>
        </div>
      </div>
      <p className="dc-muted">Latest across all {chatCount} chats</p>
      {output(
        "Campaign plan",
        `Shared plan · v${p.version}`,
        FileText,
        () => openMap("overview"),
        last?.node === "overview",
      )}
      {output(
        "Ad copy",
        `3 ${p.language} captions`,
        Type,
        () => openMap("copy"),
        last?.node === "copy",
      )}
      {output("Visual concepts", "Feed & story previews", Image, () =>
        preview("feed"),
      )}
      {p.reel &&
        output(
          "Product reel",
          "15s storyboard · In your plan",
          Clapperboard,
          () => preview("reel"),
          last?.node === "reel",
        )}
      {output(
        "Publishing schedule",
        `${p.days} days${p.reel ? " · Includes reel" : ""}`,
        Calendar,
        () => openMap("schedule"),
        last?.node === "schedule",
      )}
      <label className="outputs-language">
        <span>Output language</span>
        <select
          aria-label="Output language"
          value={p.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option>Egyptian Arabic</option>
          <option>Arabic</option>
          <option>English</option>
        </select>
      </label>
      <div className="dc-output-context">
        <Layers />
        <span>
          Shared project outputs.
          <br />
          Switch chats; keep your workspace.
        </span>
      </div>
      <div className="dc-note">
        {last ? (
          <>
            <span className="dc-kicker">LATEST CHANGE</span>
            <strong>{last.text}</strong>
            <p>From {last.chatTitle}</p>
            <button
              className="dc-source-link"
              onClick={() => source(last.chatId)}
            >
              Open conversation ↗
            </button>
          </>
        ) : (
          <>
            <strong>Your conversations stay separate.</strong>
            <p>The plan and outputs evolve together across this project.</p>
          </>
        )}
      </div>
    </aside>
  );
}
function OutputsDrawer({
  children,
  close,
}: {
  children: React.ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="outputs-drawer"
      aria-label="Project outputs"
      onCancel={close}
      onClose={close}
    >
      {children}
    </dialog>
  );
}
export function WorkspacePage() {
  const { data, update, updateProject, storageError } = useWorkspace();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const view: View = ["map", "preview"].includes(search.get("view") || "")
    ? (search.get("view") as View)
    : "chat";
  const [node, setNode] = useState("");
  const [format, setFormat] = useState<PreviewFormat>("feed");
  const [showCreate, setShowCreate] = useState(false);
  const [outputsOpen, setOutputsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [compactOutputs, setCompactOutputs] = useState(
    () => window.matchMedia("(max-width: 1100px)").matches,
  );
  const outputsToggle = useRef<HTMLButtonElement>(null);
  const project =
    data.projects.find((p) => p.id === (projectId || data.selectedProject)) ||
    data.projects[0];
  const chat =
    project.chats.find((c) => c.id === project.activeChat) || project.chats[0];
  const last = project.plan.changes.at(-1);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mobileNavigation = useRef<HTMLDetailsElement>(null);
  const setView = (value: View) => {
    if (value !== "chat") setOutputsOpen(false);
    setSearch(value === "chat" ? {} : { view: value });
  };
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");
    const change = () => setCompactOutputs(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const closeOutputs = () => {
    setOutputsOpen(false);
    requestAnimationFrame(() => outputsToggle.current?.focus());
  };
  useEffect(() => {
    if (projectId && !data.projects.some((p) => p.id === projectId))
      navigate("/app", { replace: true });
  }, [projectId, data.projects, navigate]);
  useEffect(() => {
    setNode("");
    setFormat("feed");
    setOutputsOpen(false);
  }, [project.id]);
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.id, chat.messages.length]);
  function chooseProject(id: string) {
    if (mobileNavigation.current) mobileNavigation.current.open = false;
    update((d) => ({ ...d, selectedProject: id }));
    navigate(`/app/projects/${id}`);
  }
  function chooseChat(id: string, targetId = project.id) {
    if (mobileNavigation.current) mobileNavigation.current.open = false;
    updateProject(targetId, (p) => ({ ...p, activeChat: id }));
    if (targetId === project.id) setView("chat");
    else chooseProject(targetId);
  }
  function newChat(target = project) {
    if (mobileNavigation.current) mobileNavigation.current.open = false;
    const empty = target.chats.find(
      (c) =>
        !c.seed && !c.messages.length && !c.draft && c.title === "New chat",
    );
    const id = empty?.id || uid();
    updateProject(target.id, (p) => ({
      ...p,
      activeChat: id,
      chats: empty
        ? p.chats
        : [...p.chats, { id, title: "New chat", messages: [], draft: "" }],
    }));
    if (target.id === project.id) setView("chat");
    else chooseProject(target.id);
    requestAnimationFrame(() => textarea.current?.focus());
  }
  function send(text: string) {
    const value = text.trim().slice(0, 2000);
    if (!value) return;
    updateProject(project.id, (p) => applyDemoRequest(p, value));
  }
  function discuss(text: string) {
    updateProject(project.id, (p) => ({
      ...p,
      chats: p.chats.map((c) => (c.id === chat.id ? { ...c, draft: text } : c)),
    }));
    setView("chat");
    requestAnimationFrame(() => textarea.current?.focus());
  }
  function preview(f: PreviewFormat) {
    setFormat(f);
    setView("preview");
  }
  function openMap(id: string) {
    setNode(id);
    setView("map");
  }
  const projectSelect = (
    <label className="project-picker">
      <span className="sr-only">Select project</span>
      <select
        value={project.id}
        onChange={(e) => chooseProject(e.target.value)}
      >
        {data.projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
  const status =
    project.plan.approvedVersion === project.plan.version
      ? "Approved · demo"
      : project.plan.approvedVersion
        ? "Changes need review"
        : "Awaiting approval";
  return (
    <div
      id="daemon-concept"
      className={`local-workspace ${view === "chat" ? "chat-focused" : view === "map" ? "canvas-focused" : ""} ${sidebarOpen ? "" : "sidebar-collapsed"}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <div className="dc-app">
        <WorkspaceSidebar
          project={project}
          view={view}
          chatId={chat.id}
          newProject={() => setShowCreate(true)}
          newChat={newChat}
          selectChat={chooseChat}
          collapse={() => setSidebarOpen(false)}
        />
        <main id="main-content" className="dc-main">
          <header className="dc-header">
            {!sidebarOpen && (
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen((value) => !value)}
                aria-label="Show project sidebar"
                aria-controls="workspace-sidebar"
                aria-expanded={sidebarOpen}
              >
                <PanelLeftOpen />
              </button>
            )}
            <div>
              {view === "chat" ? (
                <>
                  <span className="chat-project-name">{project.name}</span>
                  <h1 className="chat-page-title">{chat.title}</h1>
                  <small className="sr-only">
                    Shared plan v{project.plan.version}
                  </small>
                </>
              ) : (
                <>
                  <span className="dc-muted">Project / </span>
                  <strong>{project.name}</strong>
                  <small>
                    {project.campaign} · Shared plan v{project.plan.version}
                  </small>
                </>
              )}
            </div>
            <div className="workspace-header-actions">
              {view !== "chat" && (
                <label>
                  <span className="sr-only">Output language</span>
                  <select
                    aria-label="Output language"
                    value={project.plan.language}
                    onChange={(e) =>
                      send(`Change the output language to ${e.target.value}.`)
                    }
                  >
                    <option>Egyptian Arabic</option>
                    <option>Arabic</option>
                    <option>English</option>
                  </select>
                </label>
              )}
              <ThemeToggle />
              <Link to="/" aria-label="Back to home">
                Home <ArrowUpRight />
              </Link>
            </div>
          </header>
          <div className="dc-toolbar">
            <nav aria-label="Campaign views">
              {(
                [
                  { key: "chat", label: "Chat", Icon: MessageSquare },
                  { key: "map", label: "Campaign map", Icon: Workflow },
                  { key: "preview", label: "Ad preview", Icon: Eye },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  aria-pressed={view === key}
                  onClick={() => {
                    if (key === "map") setNode("");
                    setView(key);
                  }}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </nav>
            {view === "chat" ? (
              <button
                ref={outputsToggle}
                className="outputs-toggle"
                aria-expanded={outputsOpen}
                aria-controls={
                  outputsOpen ? "shared-project-outputs" : undefined
                }
                onClick={() => setOutputsOpen((value) => !value)}
              >
                <PanelRight />
                <span>Outputs</span>
                <span className="output-count">
                  {project.plan.reel ? 5 : 4}
                </span>
              </button>
            ) : (
              <span className="dc-status">{status}</span>
            )}
          </div>
          <details className="workspace-mobile-controls" ref={mobileNavigation}>
            <summary>
              Projects & conversations <ChevronDown />
            </summary>
            <div className="mobile-control-grid">
              {projectSelect}
              <button
                className="dc-secondary"
                onClick={() => setShowCreate(true)}
              >
                <Plus />
                Project
              </button>
              <select
                aria-label="Select conversation"
                value={chat.id}
                onChange={(e) => chooseChat(e.target.value)}
              >
                {project.chats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button className="dc-secondary" onClick={() => newChat()}>
                <Plus />
                Chat
              </button>
            </div>
          </details>
          {view !== "chat" && (
            <div
              className={`dc-shared-strip ${last ? "dc-has-change" : ""}`}
              aria-live="polite"
            >
              <span>
                <Layers />
                <span>
                  {last
                    ? `v${project.plan.version} · ${last.text} · from ${last.chatTitle}`
                    : "Shared plan v1 · Connected to every project chat"}
                </span>
              </span>
              <button onClick={() => openMap(last?.node || "overview")}>
                View plan ↗
              </button>
            </div>
          )}
          {storageError && (
            <p className="storage-error" role="alert">
              Browser storage is unavailable. Keep this tab open; changes
              currently stay in memory.
            </p>
          )}
          {view === "chat" && (
            <section
              className={`dc-screen chat-screen ${outputsOpen && !compactOutputs ? "outputs-visible" : ""}`}
              aria-label="Project conversation"
            >
              <div className="dc-conversation">
                <div
                  className="dc-messages"
                  ref={messagesRef}
                  aria-live="polite"
                >
                  {chat.seed === "planning" && (
                    <>
                      <div className="dc-user">
                        We’re launching our autumn drinks in Cairo. Build a
                        two-week Instagram campaign, with Egyptian Arabic
                        captions.
                      </div>
                      <AgentMessage>
                        <p>
                          I’ve put together a warm, local direction for the
                          autumn launch. The plan, captions and visual concepts
                          are ready for you to review.
                        </p>
                        <button
                          className="chat-plan-attachment"
                          onClick={() => openMap("overview")}
                        >
                          <FileText />
                          <span>
                            <strong>Autumn campaign plan</strong>
                            <small>Open the current shared plan</small>
                          </span>
                          <ArrowUpRight />
                        </button>
                      </AgentMessage>
                    </>
                  )}
                  {chat.seed === "creative" && (
                    <>
                      <div className="dc-user">
                        Let’s review the creative direction for this project.
                      </div>
                      <AgentMessage>
                        <p>
                          Let’s refine {project.name}’s creative direction. What
                          would you like to change?
                        </p>
                      </AgentMessage>
                    </>
                  )}
                  {!chat.seed && !chat.messages.length && (
                    <AgentMessage>
                      <h2>What shall we work on next?</h2>
                      <p>
                        Continue working on {project.name}’s campaign. Your plan
                        and previous work are already connected.
                      </p>
                      {chat.title === "Campaign planning" && (
                        <details className="chat-brief">
                          <summary>Project brief</summary>
                          <p>{project.brief}</p>
                        </details>
                      )}
                    </AgentMessage>
                  )}
                  {chat.messages.map((m) =>
                    m.role === "user" ? (
                      <div className="dc-user" dir="auto" key={m.id}>
                        {m.text}
                      </div>
                    ) : (
                      <AgentMessage key={m.id}>
                        <p dir="auto">{m.text}</p>
                        {m.changed && (
                          <button
                            className="dc-change-link"
                            onClick={() => openMap("overview")}
                          >
                            <Check />
                            Plan updated to v{m.version} · View current plan ↗
                          </button>
                        )}
                      </AgentMessage>
                    ),
                  )}
                </div>
                {!chat.seed && !chat.messages.length && (
                  <div
                    className="dc-suggestions"
                    aria-label="Example campaign changes"
                  >
                    <button
                      onClick={() =>
                        send(
                          project.plan.reel
                            ? "Remove the product reel from the plan."
                            : "Add a 15-second product reel to our plan.",
                        )
                      }
                    >
                      {project.plan.reel
                        ? "− Remove product reel"
                        : "+ Add a product reel"}
                    </button>
                    <button
                      onClick={() =>
                        send(
                          `Set the ad budget to EGP ${project.plan.budget === 4000 ? "3,000" : "4,000"}.`,
                        )
                      }
                    >
                      Set budget to{" "}
                      {project.plan.budget === 4000 ? "EGP 3,000" : "EGP 4,000"}
                    </button>
                  </div>
                )}
                <form
                  className="dc-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(chat.draft);
                  }}
                >
                  <label className="sr-only" htmlFor="project-message">
                    Message the agent about this project
                  </label>
                  <textarea
                    id="project-message"
                    ref={textarea}
                    rows={2}
                    maxLength={2000}
                    value={chat.draft}
                    onChange={(e) => {
                      const draft = e.target.value;
                      updateProject(project.id, (p) => ({
                        ...p,
                        chats: p.chats.map((c) =>
                          c.id === chat.id ? { ...c, draft } : c,
                        ),
                      }));
                    }}
                    placeholder={`Continue working on ${project.name}’s plan…`}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        send(chat.draft);
                      }
                    }}
                  />
                  <div>
                    <span>Demo agent · {project.plan.language}</span>
                    <button
                      type="submit"
                      className="dc-send"
                      disabled={!chat.draft.trim()}
                      aria-label="Send message"
                    >
                      <ArrowUp />
                    </button>
                  </div>
                </form>
              </div>
              {outputsOpen && !compactOutputs && (
                <ProjectOutputs
                  project={project}
                  chatCount={project.chats.length}
                  openMap={openMap}
                  preview={preview}
                  source={chooseChat}
                  close={closeOutputs}
                  changeLanguage={(value) =>
                    send(`Change the output language to ${value}.`)
                  }
                />
              )}
            </section>
          )}
          {view === "map" && (
            <Suspense
              fallback={
                <section className="canvas-loading" role="status">
                  Opening your campaign workspace…
                </section>
              }
            >
              <CampaignMap
                key={project.id}
                project={project}
                node={node}
                setNode={setNode}
                preview={preview}
                discuss={discuss}
                source={chooseChat}
                approve={(approved) =>
                  updateProject(project.id, (p) => ({
                    ...p,
                    plan: {
                      ...p.plan,
                      approvedVersion: approved ? p.plan.version : 0,
                    },
                  }))
                }
              />
            </Suspense>
          )}
          {view === "preview" && (
            <CampaignPreview
              project={project}
              format={format}
              setFormat={setFormat}
              discuss={discuss}
              openMap={() => openMap("overview")}
            />
          )}
          {view !== "chat" && (
            <footer className="dc-footer">
              <span>Local demo · No accounts connected or ads published</span>
              <span>
                Shared plan v{project.plan.version} · 3 posts
                {project.plan.reel ? " + 1 reel" : ""}
              </span>
            </footer>
          )}
        </main>
      </div>
      {view === "chat" && outputsOpen && compactOutputs && (
        <OutputsDrawer close={closeOutputs}>
          <ProjectOutputs
            project={project}
            chatCount={project.chats.length}
            openMap={openMap}
            preview={preview}
            source={(id) => {
              chooseChat(id);
              closeOutputs();
            }}
            close={closeOutputs}
            changeLanguage={(value) =>
              send(`Change the output language to ${value}.`)
            }
          />
        </OutputsDrawer>
      )}
      <NewProjectDialog
        open={showCreate}
        close={() => setShowCreate(false)}
        onCreate={(p) => {
          update((d) => ({
            ...d,
            selectedProject: p.id,
            projects: [...d.projects, p],
          }));
          navigate(`/app/projects/${p.id}`);
        }}
      />
    </div>
  );
}

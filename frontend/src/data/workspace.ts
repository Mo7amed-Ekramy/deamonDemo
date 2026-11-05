export type AccountType = "business" | "agency";
export type OutputLanguage = "Egyptian Arabic" | "Arabic" | "English";
export interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  version?: number;
  changed?: boolean;
}
export interface Conversation {
  id: string;
  title: string;
  seed?: "planning" | "creative";
  messages: Message[];
  draft: string;
}
export interface PlanChange {
  id: string;
  text: string;
  chatId: string;
  chatTitle: string;
  node: string;
  version: number;
  at: string;
}
export interface CampaignPlan {
  version: number;
  reel: boolean;
  budget: number;
  days: number;
  approvedVersion: number;
  language: OutputLanguage;
  changes: PlanChange[];
}
export interface Project {
  id: string;
  name: string;
  campaign: string;
  market: string;
  brief: string;
  createdAt: string;
  activeChat: string;
  chats: Conversation[];
  plan: CampaignPlan;
}
export interface WorkspaceData {
  schema: 1;
  selectedProject: string;
  projects: Project[];
  accountType: AccountType;
  displayName: string;
}
export const STORAGE_KEY = "daemon.workspace.v1";
export const uid = () => crypto.randomUUID();
export const money = (n: number) => `EGP ${n.toLocaleString("en-US")}`;

export function createProject(
  name: string,
  brief: string,
  language: OutputLanguage,
  market = "Cairo, Egypt",
): Project {
  const chatId = uid();
  return {
    id: uid(),
    name,
    campaign: `${name} campaign`,
    market,
    brief,
    createdAt: new Date().toISOString(),
    activeChat: chatId,
    chats: [
      { id: chatId, title: "Campaign planning", messages: [], draft: "" },
    ],
    plan: {
      version: 1,
      reel: false,
      budget: 3000,
      days: 14,
      approvedVersion: 0,
      language,
      changes: [],
    },
  };
}
export function initialWorkspace(): WorkspaceData {
  const project = createProject(
    "Morrow Coffee",
    "Launch our autumn drinks with a warm, local Instagram campaign.",
    "Egyptian Arabic",
  );
  project.id = "morrow-coffee";
  project.campaign = "Autumn launch";
  project.chats[0].seed = "planning";
  project.chats.push({
    id: "creative-review",
    title: "Creative review",
    seed: "creative",
    messages: [],
    draft: "",
  });
  return {
    schema: 1,
    selectedProject: project.id,
    projects: [project],
    accountType: "agency",
    displayName: "North Studio",
  };
}
function validProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const p = value as Project;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.campaign === "string" &&
    Array.isArray(p.chats) &&
    p.chats.length > 0 &&
    p.chats.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        Array.isArray(c.messages) &&
        c.messages.every(
          (m) =>
            typeof m.text === "string" && ["agent", "user"].includes(m.role),
        ),
    ) &&
    !!p.plan &&
    Number.isInteger(p.plan.version) &&
    p.plan.version > 0 &&
    Number.isFinite(p.plan.budget) &&
    p.plan.budget >= 100 &&
    Number.isFinite(p.plan.days) &&
    p.plan.days >= 7 &&
    p.plan.days <= 90 &&
    typeof p.plan.reel === "boolean" &&
    Number.isInteger(p.plan.approvedVersion) &&
    ["Egyptian Arabic", "Arabic", "English"].includes(p.plan.language) &&
    Array.isArray(p.plan.changes)
  );
}
export function readWorkspace(): WorkspaceData {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      value?.schema === 1 &&
      Array.isArray(value.projects) &&
      value.projects.length &&
      value.projects.every(validProject)
    ) {
      return {
        ...value,
        selectedProject: value.projects.some(
          (p: Project) => p.id === value.selectedProject,
        )
          ? value.selectedProject
          : value.projects[0].id,
        accountType: value.accountType === "business" ? "business" : "agency",
        displayName:
          typeof value.displayName === "string"
            ? value.displayName
            : "Your workspace",
      };
    }
  } catch {
    /* A missing or incompatible snapshot falls back to the sample project. */
  }
  return initialWorkspace();
}

/** Deterministic, browser-local stand-in for the future agent endpoint. No network or publishing. */
export function applyDemoRequest(project: Project, text: string): Project {
  const next = structuredClone(project);
  const chat =
    next.chats.find((c) => c.id === next.activeChat) || next.chats[0];
  const plan = next.plan;
  const normalized = text.replace(/[٠-٩]/g, (x) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(x)),
  );
  const changes: string[] = [];
  let node = "overview";
  const reel = /reel|ريل/i.test(text);
  if (reel) {
    const remove = /remove|delete|حذف|احذف|شيل|الغ[يى]/i.test(text);
    if (plan.reel === remove) {
      plan.reel = !remove;
      changes.push(remove ? "Product reel removed" : "Product reel added");
      node = remove ? "overview" : "reel";
    }
  }
  const budget = normalized.match(
    /(?:budget|ميزاني[ةه]?|الصرف)(?:\s|\p{L}|[:=])*?([\d,]+)/iu,
  );
  if (budget) {
    const amount = Number(budget[1].replace(/,/g, ""));
    if (amount >= 100 && amount <= 1000000 && amount !== plan.budget) {
      plan.budget = amount;
      changes.push(`Ad budget set to ${money(amount)}`);
      node = "overview";
    }
  }
  const duration = normalized.match(/(\d+)\s*(?:days|يوم|أيام)/i);
  if (duration) {
    const days = Number(duration[1]);
    if (days >= 7 && days <= 90 && days !== plan.days) {
      plan.days = days;
      changes.push(`Schedule changed to ${days} days`);
      node = "schedule";
    }
  }
  let language: OutputLanguage | undefined;
  if (/language|output|لغ[ةه]|المخرجات|اكتب/i.test(text)) {
    if (/egyptian|مصري/i.test(text)) language = "Egyptian Arabic";
    else if (/english|إنجليزي|انجليزي/i.test(text)) language = "English";
    else if (/arabic|عربي|عربية/i.test(text)) language = "Arabic";
    if (language && language !== plan.language) {
      plan.language = language;
      changes.push(`Output language changed to ${language}`);
      node = "copy";
    }
  }
  if (chat.title === "New chat")
    chat.title = reel
      ? "Reel direction"
      : budget
        ? "Budget adjustments"
        : "Campaign updates";
  let response: string;
  if (changes.length) {
    plan.version++;
    plan.changes.push({
      id: uid(),
      text: changes.join(" · "),
      chatId: chat.id,
      chatTitle: chat.title,
      node,
      version: plan.version,
      at: new Date().toISOString(),
    });
    response = `${changes.join(". ")}. The shared plan, campaign map and outputs are updated across all project conversations.`;
    if (reel && plan.reel)
      response += ` The schedule includes the reel; ad spend is ${money(plan.budget)}.`;
  } else if (reel)
    response = plan.reel
      ? "The product reel is already in the shared plan. Open its storyboard from Project outputs."
      : "There is no reel in the current plan. Ask to add one to see it in the workspace.";
  else
    response =
      "Your message is saved to this conversation. This local demo can add or remove a reel, update the budget, change the duration (7–90 days), and switch the output language. Try “Add a product reel” or “Make the campaign 21 days”. A connected agent will handle open-ended requests later.";
  chat.messages.push(
    { id: uid(), role: "user", text },
    {
      id: uid(),
      role: "agent",
      text: response,
      version: plan.version,
      changed: changes.length > 0,
    },
  );
  chat.draft = "";
  return next;
}

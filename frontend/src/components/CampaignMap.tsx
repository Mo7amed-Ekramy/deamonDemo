import { X } from "lucide-react";
import { CampaignCanvas } from "./CampaignCanvas";
import type { Project } from "../data/workspace";
import { money } from "../data/workspace";
import type { PreviewFormat } from "./CampaignPreview";

export function CampaignMap({
  project,
  node,
  setNode,
  preview,
  discuss,
  approve,
  source,
}: {
  project: Project;
  node: string;
  setNode: (node: string) => void;
  preview: (format: PreviewFormat) => void;
  discuss: (text: string) => void;
  approve: (approved: boolean) => void;
  source: (id: string) => void;
}) {
  const p = project.plan,
    last = p.changes.at(-1),
    approved = p.approvedVersion === p.version;
  const selected = node === "reel" && !p.reel ? "overview" : node;
  const titles: Record<string, string> = {
    overview: project.campaign,
    strategy:
      project.id === "morrow-coffee"
        ? "Your everyday autumn ritual"
        : "Your next chapter",
    copy: `${p.language} captions`,
    visual: "Feed & story concepts",
    reel: "Product reel · 15 seconds",
    schedule: `Publishing · ${p.days} days`,
    learning: "Results & learning",
  };
  return (
    <section
      className="dc-screen map-screen canvas-map"
      aria-label="Shared campaign map"
    >
      <CampaignCanvas
        project={project}
        selected={node ? selected : ""}
        onSelect={setNode}
      />
      {node && (
        <aside
          className="dc-inspector canvas-inspector"
          aria-label="Selected campaign details"
        >
          <button
            className="canvas-inspector-close"
            onClick={() => setNode("")}
            aria-label="Close campaign details"
          >
            <X />
          </button>

          <span className="dc-kicker">PLAN REVIEW · v{p.version}</span>
          <h2>{titles[selected] || titles.overview}</h2>
          <div className="dc-detail-body">
            {selected === "overview" && (
              <>
                <p>
                  {p.days}-day Instagram campaign for {project.name} in{" "}
                  {project.market}.
                </p>
                <ul>
                  <li>3 {p.language} captions</li>
                  <li>Feed and story visual concepts</li>
                  {p.reel && (
                    <li>15-second product reel + voiceover direction</li>
                  )}
                  <li>Ad spend limit: {money(p.budget)}</li>
                </ul>
              </>
            )}
            {selected === "strategy" && (
              <>
                <p>{project.brief}</p>
                <ul>
                  <li>Audience: your local target market</li>
                  <li>Tone: warm and relevant to your brand</li>
                  <li>Goal: bring people closer to your business</li>
                </ul>
              </>
            )}
            {selected === "copy" && (
              <div
                dir={p.language === "English" ? "ltr" : "rtl"}
                lang={p.language === "English" ? "en" : "ar"}
              >
                {(p.language === "English"
                  ? [
                      "A little pause in a busy day.",
                      `Your next favourite is waiting at ${project.name}.`,
                      "Make room for something new this season.",
                    ]
                  : p.language === "Arabic"
                    ? [
                        "وسط انشغالات اليوم، امنح نفسك لحظة هادئة.",
                        `اختيارك المفضل ينتظرك في ${project.name}.`,
                        "اكتشف جديد الموسم معنا.",
                      ]
                    : [
                        "وسط زحمة اليوم، خدلك لحظة بطعم الخريف.",
                        `جديد الموسم مستنيك في ${project.name}.`,
                        "قهوة، صحبة، ومزاج خريفي. ناقصك إيه تاني؟",
                      ]
                ).map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            )}
            {selected === "visual" && (
              <>
                <p>
                  Explore the visual direction in a feed post or story format.
                </p>
                <button
                  className="dc-secondary"
                  onClick={() => preview("feed")}
                >
                  Open visual preview ↗
                </button>
              </>
            )}
            {selected === "reel" && (
              <>
                <p>
                  A three-shot storyboard with {p.language} voiceover direction.
                </p>
                <ol>
                  <li>0–5s · Start with the daily rush.</li>
                  <li>5–10s · Reveal the product.</li>
                  <li>10–15s · Invite viewers to discover more.</li>
                </ol>
                <button
                  className="dc-secondary"
                  onClick={() => preview("reel")}
                >
                  Preview storyboard ↗
                </button>
              </>
            )}
            {selected === "schedule" && (
              <>
                <ul>
                  <li>Day 1 · Launch the campaign</li>
                  <li>Day 5 · Introduce the seasonal favourite</li>
                  {p.reel && <li>Day 7 · Product reel</li>}
                  <li>Day {Math.max(6, p.days - 3)} · Final invitation</li>
                </ul>
                <p>Final dates are set when the plan is approved.</p>
              </>
            )}
            {last && (selected === last.node || selected === "overview") && (
              <div className="dc-source-stamp">
                {last.text}
                <br />
                <button
                  className="dc-source-link"
                  onClick={() => source(last.chatId)}
                >
                  From {last.chatTitle} ↗
                </button>
              </div>
            )}
          </div>
          {selected === "learning" && (
            <div className="canvas-learning-note">
              <p>
                Campaign performance and reusable insights will appear here
                after execution.
              </p>
              <p>These results feed the next campaign in this project.</p>
            </div>
          )}
          <div className="dc-plan-facts">
            <div>
              <span>Ad spend limit</span>
              <strong>{money(p.budget)}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{p.days} days</strong>
            </div>
            <div>
              <span>Output language</span>
              <strong>{p.language}</strong>
            </div>
          </div>
          <div className="dc-approval" aria-live="polite">
            {approved ? (
              <>
                <div className="connection-state">
                  <span>YOUR NEXT STEP</span>
                  <strong>Connect your ad account</strong>
                  <p>
                    Plan v{p.version} is approved. Account connections and
                    publishing will be available when the backend is connected.
                    No ads have been published.
                  </p>
                </div>
                <button className="dc-secondary" onClick={() => approve(false)}>
                  Return plan to draft
                </button>
              </>
            ) : (
              <>
                <p>
                  Review version {p.version} with its outputs, schedule and
                  spend limit.
                </p>
                <button className="dc-primary" onClick={() => approve(true)}>
                  Approve plan v{p.version}
                </button>
                <button
                  className="dc-secondary"
                  onClick={() =>
                    discuss(
                      `Please revise the ${selected === "overview" ? "campaign plan" : selected}: `,
                    )
                  }
                >
                  Discuss changes in chat
                </button>
              </>
            )}
          </div>
        </aside>
      )}
    </section>
  );
}

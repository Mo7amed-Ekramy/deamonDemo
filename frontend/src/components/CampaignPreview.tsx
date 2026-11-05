import { useState } from "react";
import { Ellipsis, ArrowUpRight } from "lucide-react";
import type { Project } from "../data/workspace";

export type PreviewFormat = "feed" | "story" | "reel";
export function CampaignPreview({
  project,
  format,
  setFormat,
  discuss,
  openMap,
}: {
  project: Project;
  format: PreviewFormat;
  setFormat: (f: PreviewFormat) => void;
  discuss: (s: string) => void;
  openMap: () => void;
}) {
  const [shot, setShot] = useState(0);
  const actualFormat =
    !project.plan.reel && format === "reel" ? "feed" : format;
  const reel = actualFormat === "reel";
  const english = project.plan.language === "English";
  const coffee = project.id === "morrow-coffee";
  const sceneTitles = [
    "Your day.\nA little too fast.",
    "A little pause.\nA little autumn.",
    `Your next chapter.\nStarts at ${coffee ? "Morrow" : project.name}.`,
  ];
  const captions = english
    ? [
        "A busy day? Make a little room for yourself.",
        "A small pause. A fresh seasonal favourite.",
        `Discover something new with ${project.name}.`,
      ]
    : project.plan.language === "Arabic"
      ? [
          "يوم مزدحم؟ امنح نفسك لحظة هادئة.",
          "خذ لحظة مع اختيارك المفضل لهذا الموسم.",
          `اكتشف الجديد مع ${project.name}.`,
        ]
      : [
          "دوشة، مشاوير، وزحمة طول اليوم؟",
          "خدلك لحظة مع مشروبك الخريفي المفضل.",
          `جديد الموسم مستنيك في ${project.name}.`,
        ];
  return (
    <section
      className="dc-screen preview-screen"
      aria-label="Advertisement preview"
    >
      <div className="dc-preview-area">
        <div className="dc-preview-heading">
          <span className="dc-kicker">
            {reel ? "REEL STORYBOARD" : "VISUAL CONCEPT"}
          </span>
          <h2>See what your audience will see.</h2>
        </div>
        <div className="dc-format" aria-label="Creative format">
          {(
            [
              "feed",
              "story",
              ...(project.plan.reel ? ["reel"] : []),
            ] as PreviewFormat[]
          ).map((f) => (
            <button
              key={f}
              aria-pressed={actualFormat === f}
              onClick={() => setFormat(f)}
            >
              {f === "feed"
                ? "Instagram feed"
                : f === "story"
                  ? "Story"
                  : "Product reel"}
            </button>
          ))}
        </div>
        <div className="dc-social">
          <div className="dc-social-head">
            <span>{project.name.charAt(0)}</span>
            <div>
              {project.name.toLowerCase().replace(/\s/g, ".")}
              <small>Sponsored · Concept preview</small>
            </div>
            <Ellipsis aria-hidden="true" />
          </div>
          <div
            className={`dc-ad ${reel ? "dc-reel-art" : ""}`}
            style={{ aspectRatio: actualFormat === "feed" ? "1" : "9 / 16" }}
          >
            <span className="dc-ad-brand">
              {project.name.toUpperCase()} /{" "}
              {coffee ? "COFFEE & COMPANY" : "YOUR NEXT CHAPTER"}
            </span>
            <div className="dc-ad-title">
              {reel
                ? sceneTitles[shot]
                : coffee
                  ? "A little pause.\nA little autumn."
                  : "Big ideas.\nMade for you."}
            </div>
            {coffee ? (
              <div
                className="dc-cup-scene"
                role="img"
                aria-label="Illustrated Morrow takeaway coffee cup"
              >
                <div className="dc-shadow" />
                <div className="dc-cup">
                  <span>MORROW</span>
                  <small>YOUR DAILY LITTLE RITUAL</small>
                </div>
                <div className="dc-lid" />
                <div className="dc-leaf dc-leaf-one" />
                <div className="dc-leaf dc-leaf-two" />
              </div>
            ) : (
              <div
                className="brand-creative"
                aria-label={`${project.name} illustrative brand graphic`}
              >
                <div>{project.name.slice(0, 2).toUpperCase()}</div>
              </div>
            )}
            <span className="dc-ad-foot">
              {reel
                ? `${["HOOK", "PRODUCT", "INVITATION"][shot]} · ${shot * 5}–${shot * 5 + 5}s`
                : "YOUR NEXT FAVOURITE DISCOVERY."}
            </span>
          </div>
          <div className="dc-social-cta">
            {coffee ? "Explore the autumn menu" : "Explore the collection"}
            <ArrowUpRight />
          </div>
          <div
            className="dc-caption"
            dir={english ? "ltr" : "rtl"}
            lang={english ? "en" : "ar"}
          >
            {reel
              ? captions[shot]
              : english
                ? `A little pause in a busy day. Discover the latest from ${project.name}.`
                : project.plan.language === "Arabic"
                  ? `وسط انشغالات اليوم، امنح نفسك لحظة مميزة مع ${project.name}.`
                  : `وسط زحمة اليوم، خدلك لحظة بطعم الخريف ☕ جديد الموسم مستنيك في ${project.name}.`}
          </div>
        </div>
        {reel && (
          <div className="dc-reel-strip">
            <span>15s reel · three-scene storyboard</span>
            <div>
              {["0–5s · Hook", "5–10s · Product", "10–15s · Invite"].map(
                (text, i) => (
                  <button
                    key={text}
                    aria-pressed={shot === i}
                    onClick={() => setShot(i)}
                  >
                    {text}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
      <aside className="dc-preview-detail">
        <span className="dc-kicker">ASSET DETAILS</span>
        <h2>
          {reel
            ? "Product reel / Storyboard"
            : `${coffee ? "Autumn ritual" : "Brand campaign"} / ${actualFormat === "feed" ? "Feed" : "Story"}`}
        </h2>
        <p>
          {reel
            ? "Three scenes with a voiceover direction. Select a scene below to review it."
            : "An illustrative creative direction for your campaign. Final assets will come from the connected generation service."}
        </p>
        <dl>
          <dt>Placement</dt>
          <dd>
            {reel
              ? "Instagram reel · 9:16 · 15s"
              : actualFormat === "story"
                ? "Instagram story · 9:16"
                : "Instagram feed · 1:1"}
          </dd>
          <dt>Caption language</dt>
          <dd>{project.plan.language}</dd>
          <dt>Version</dt>
          <dd>Current shared plan · v{project.plan.version}</dd>
        </dl>
        <div className="dc-note">
          <strong>Connected to your plan</strong>
          <p>This creative belongs to {project.campaign}.</p>
        </div>
        <button
          className="dc-secondary"
          onClick={() =>
            discuss(
              `Please revise the ${reel ? "product reel" : "visual concept"}: `,
            )
          }
        >
          Discuss creative changes
        </button>
        <button className="dc-secondary" onClick={openMap}>
          Back to campaign map
        </button>
      </aside>
    </section>
  );
}

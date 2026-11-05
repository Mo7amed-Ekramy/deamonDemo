import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarCheck,
  ChartNoAxesCombined,
  CheckCheck,
  CircleCheck,
  Clapperboard,
  Compass,
  FileText,
  GitBranch,
  MessagesSquare,
  Palette,
  Play,
  ScanSearch,
  Store,
  Type,
  Workflow,
} from "lucide-react";
import {
  Arrow,
  ButtonLink,
  Logo,
  PublicShell,
  ThemeToggle,
} from "../components/ui";

const shots = {
  chat: {
    label: "Conversation",
    image: "/images/workspace-chat.png",
    alt: "Project conversations and shared campaign outputs in Daemon",
    caption:
      "Separate conversations. One shared plan that keeps moving forward.",
  },
  map: {
    label: "Campaign map",
    image: "/images/workspace-map.png",
    alt: "Campaign map connecting strategy, copy, visuals, reel and publishing",
    caption: "See how strategy, creative work and the publishing plan connect.",
  },
  preview: {
    label: "Creative preview",
    image: "/images/workspace-creative.png",
    alt: "Three-scene product reel storyboard preview",
    caption: "Review the work your audience will see, before you approve it.",
  },
};
const services = [
  {
    Icon: ScanSearch,
    title: "Market & competitor research",
    text: "Understand your market, local audience and competitors before choosing a direction.",
  },
  {
    Icon: Compass,
    title: "Campaign strategy",
    text: "Review campaign angles, audience recommendations and a plan built around your goals.",
  },
  {
    Icon: Type,
    title: "Copy with your voice",
    text: "Shape captions and ad copy around your brand, target language and tone.",
  },
  {
    Icon: Palette,
    title: "Visuals & storyboards",
    text: "See feed and story concepts, plus video storyboards, before they reach your audience.",
  },
  {
    Icon: CalendarCheck,
    title: "Scheduling & publishing",
    text: "Move an approved plan toward launch, with clear account connections and next steps.",
  },
  {
    Icon: ChartNoAxesCombined,
    title: "Results & campaign learning",
    text: "Review what happened and carry useful lessons into the next campaign.",
  },
];
const faqs = [
  [
    "Is Daemon for businesses or agencies?",
    "Both. Businesses work on their own campaigns. Agencies manage their team and separate client workspaces.",
  ],
  [
    "Can I continue a project in a new chat?",
    "Yes. Each project can have multiple conversations that all work on the same current campaign plan and outputs.",
  ],
  [
    "Does a campaign publish without my approval?",
    "You review and approve the plan first. Execution also depends on connected accounts and any required actions being completed. Publishing is simulated in this local demo.",
  ],
  [
    "Do I have to create content in English?",
    "The interface is in English. Your campaign brief includes your target language, tone and market.",
  ],
];
function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
}) {
  return (
    <div className="dp-section-heading">
      <div>
        <span className="dp-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <p>{text}</p>
    </div>
  );
}
function HeroIllustration() {
  return (
    <div
      className="dp-hero-art"
      aria-label="A conversation updating a shared campaign plan"
    >
      <div className="dp-art-top">
        <span className="dp-tiny-logo">
          <span className="brand-dot">●</span> daemon
        </span>
        <span>Morrow Coffee / Autumn launch</span>
      </div>
      <div className="dp-art-chat">
        <span className="dp-mini-avatar">MC</span>
        <p>
          Let’s make this autumn
          <br />
          our next big thing.
        </p>
      </div>
      <div className="dp-art-agent">
        <span className="dp-agent-avatar">d.</span>
        <div>
          <strong>
            A little autumn.
            <br />A lot of possibility.
          </strong>
          <p>Your campaign is taking shape.</p>
        </div>
      </div>
      <div className="dp-art-plan">
        <div>
          <span className="dp-eyebrow">SHARED CAMPAIGN PLAN</span>
          <span className="dp-vbadge">v2</span>
        </div>
        <h3>Your everyday autumn ritual</h3>
        <div className="dp-art-output">
          <FileText />
          <span>Strategy & audience</span>
          <span>Ready</span>
        </div>
        <div className="dp-art-output">
          <Type />
          <span>Egyptian Arabic captions</span>
          <span>3 posts</span>
        </div>
        <div className="dp-art-output dp-output-new">
          <Clapperboard />
          <span>Product reel</span>
          <span>Added</span>
        </div>
      </div>
      <div className="dp-art-update">
        <GitBranch />
        <span>
          New chat. Same workspace.
          <small>Your latest idea is already in the plan.</small>
        </span>
      </div>
      <span className="dp-art-sample">ILLUSTRATIVE CAMPAIGN</span>
    </div>
  );
}
export function HomePage() {
  const [audience, setAudience] = useState("business");
  const [shot, setShot] = useState<keyof typeof shots>("chat");
  return (
    <PublicShell>
      <header className="dp-nav dp-wrap">
        <Logo />
        <nav aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#workspace">Workspace</a>
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="dp-nav-actions">
          <ThemeToggle />
          <Link className="dp-text-button" to="/login">
            Log in
          </Link>
          <ButtonLink to="/signup">
            Get started <Arrow />
          </ButtonLink>
        </div>
      </header>
      <main id="main-content">
        <section className="dp-hero dp-wrap" aria-labelledby="hero-heading">
          <div className="dp-hero-copy">
            <div className="dp-eyebrow">
              <span className="dp-live-dot" />
              MEET YOUR AI MARKETING TEAM
            </div>
            <h1 id="hero-heading">
              Big ideas.
              <br />
              One conversation.
              <br />
              <span>A whole campaign.</span>
            </h1>
            <p>
              Meet Daemon. Your space to turn a business brief into a clear
              plan, creative work and a campaign ready to go.
            </p>
            <div className="dp-action-row">
              <ButtonLink to="/signup">
                Build your next campaign <Arrow />
              </ButtonLink>
              <a className="dp-button dp-outline" href="#workspace">
                Take a look inside <Play />
              </a>
            </div>
            <div className="dp-hero-foot">
              <span>
                <Building2 />
                For agencies & businesses
              </span>
              <span>
                <CheckCheck />
                Your approval. Your direction.
              </span>
            </div>
          </div>
          <HeroIllustration />
        </section>
        <div className="dp-principles dp-wrap">
          <span>FROM FIRST THOUGHT TO FINAL CREATIVE</span>
          <div>
            {["Research", "Strategy", "Create", "Approve", "Launch"].map(
              (label, i) => (
                <span className="principle" key={label}>
                  {i > 0 && (
                    <span className="dp-divider" aria-hidden="true">
                      /
                    </span>
                  )}
                  {label}
                </span>
              ),
            )}
          </div>
        </div>
        <section id="product" className="dp-section dp-wrap">
          <SectionHeading
            eyebrow="WHAT WE BRING TO THE TABLE"
            title={
              <>
                Your marketing,
                <br />
                working together.
              </>
            }
            text="One place for the conversations, decisions and creative work behind your next campaign."
          />
          <div className="dp-audience-switch" aria-label="Product audience">
            <button
              aria-pressed={audience === "business"}
              onClick={() => setAudience("business")}
            >
              For your business
            </button>
            <button
              aria-pressed={audience === "agency"}
              onClick={() => setAudience("agency")}
            >
              For your agency
            </button>
          </div>
          <div className="dp-benefits">
            <article>
              <span className="dp-feature-icon">
                <MessagesSquare />
              </span>
              <span className="dp-step">01 / TALK IT THROUGH</span>
              <h3>
                {audience === "agency"
                  ? "Every client. Their own space."
                  : "Your brand. Your starting point."}
              </h3>
              <p>
                {audience === "agency"
                  ? "Give each client a separate workspace with their brand, connected conversations and campaign outputs."
                  : "Share your goals, audience and brand direction. Keep every conversation connected to your project."}
              </p>
            </article>
            <article>
              <span className="dp-feature-icon">
                <Workflow />
              </span>
              <span className="dp-step">02 / SEE THE WHOLE PICTURE</span>
              <h3>From an idea to a visible plan.</h3>
              <p>
                Explore a campaign map. Review the strategy, copy, creative work
                and schedule in one connected workspace.
              </p>
            </article>
            <article>
              <span className="dp-feature-icon">
                <CircleCheck />
              </span>
              <span className="dp-step">03 / MAKE THE CALL</span>
              <h3>You lead. Daemon gets to work.</h3>
              <p>
                Ask for changes, review the updated plan, then approve the
                campaign before execution and publishing begin.
              </p>
            </article>
          </div>
        </section>
        <section id="workspace" className="dp-workspace-section">
          <div className="dp-wrap">
            <SectionHeading
              eyebrow="A LITTLE LOOK INSIDE"
              title={
                <>
                  Less imagining.
                  <br />
                  More “there it is.”
                </>
              }
              text="Your conversations, your campaign map and the work your audience will actually see."
            />
            <div className="dp-shot-top">
              <div className="dp-shot-tabs" aria-label="Workspace views">
                {Object.entries(shots).map(([key, value]) => (
                  <button
                    key={key}
                    aria-pressed={shot === key}
                    onClick={() => setShot(key as keyof typeof shots)}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
              <span>Sample project · Morrow Coffee</span>
            </div>
            <figure className="dp-shot-frame">
              <img
                className="dp-screenshot"
                src={shots[shot].image}
                alt={shots[shot].alt}
                width="1920"
                height="960"
                loading="lazy"
              />
              <figcaption>
                <span>{shots[shot].caption}</span>
                <Link className="dp-text-button" to="/app">
                  Explore the workspace <Arrow />
                </Link>
              </figcaption>
            </figure>
          </div>
        </section>
        <section id="services" className="dp-section dp-wrap">
          <SectionHeading
            eyebrow="YOUR CAMPAIGN, COVERED"
            title={
              <>
                Good marketing has
                <br />a lot of moving parts.
              </>
            }
            text="Give them a place to work together, from understanding your market to learning from your results."
          />
          <div className="dp-services-grid">
            {services.map(({ Icon, title, text }) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="pricing" className="dp-section dp-pricing-section">
          <div className="dp-wrap">
            <div className="dp-section-heading dp-centered">
              <span className="dp-eyebrow">FIND YOUR FIT</span>
              <h2>A plan for the way you work.</h2>
              <p>
                We’re shaping our subscriptions for businesses and agency teams.
                <br />
                Pricing and usage limits are still being finalized.
              </p>
            </div>
            <div className="dp-plans">
              {(["business", "agency"] as const).map((role) => (
                <article
                  key={role}
                  className={`dp-plan ${role === "agency" ? "dp-plan-agency" : ""}`}
                >
                  {role === "agency" && (
                    <span className="dp-plan-tag">BUILT FOR CLIENT WORK</span>
                  )}
                  <span className="dp-plan-icon">
                    {role === "agency" ? <Building2 /> : <Store />}
                  </span>
                  <span className="dp-eyebrow">
                    {role === "agency" ? "FOR YOUR CLIENTS" : "FOR YOUR BRAND"}
                  </span>
                  <h3>{role === "agency" ? "Agency" : "Business"}</h3>
                  <p>
                    {role === "agency"
                      ? "A home for your team and the different brands you bring to life."
                      : "A workspace for your business, your ideas and your next campaign."}
                  </p>
                  <div className="dp-price">
                    Pricing to be announced
                    <span>Subscription details coming soon</span>
                  </div>
                  <ul>
                    {(role === "agency"
                      ? [
                          "Separate workspaces for each client",
                          "Team collaboration and roles",
                          "Campaign planning, previews and approvals",
                          "A shared agency playbook",
                        ]
                      : [
                          "Your brand and campaign workspace",
                          "Connected chats and shared campaign plans",
                          "Creative previews and revisions",
                          "Review and approval before execution",
                        ]
                    ).map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                  <ButtonLink
                    to={`/signup?plan=${role}`}
                    outline={role === "business"}
                  >
                    Explore {role === "agency" ? "Agency" : "Business"}{" "}
                    <Arrow />
                  </ButtonLink>
                </article>
              ))}
            </div>
            <p className="dp-pricing-note">
              Proposed plan structure · final inclusions, credits and billing
              terms are to be confirmed.
            </p>
          </div>
        </section>
        <section className="dp-section dp-wrap dp-faq">
          <div>
            <span className="dp-eyebrow">A FEW THINGS YOU MIGHT ASK</span>
            <h2>Before we say hello.</h2>
          </div>
          <div className="dp-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="dp-final-cta dp-wrap">
          <span className="dp-eyebrow">GOT SOMETHING IN MIND?</span>
          <h2>
            Let’s make it
            <br />
            <span>your next campaign.</span>
          </h2>
          <ButtonLink to="/signup">
            Start a conversation <Arrow />
          </ButtonLink>
        </section>
      </main>
      <footer className="dp-footer dp-wrap">
        <div>
          <Logo />
          <p>
            A little conversation.
            <br />A whole lot of possibility.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#product">Product</a>
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Log in</Link>
        </nav>
        <span>Daemon · Graduation project · Local frontend</span>
      </footer>
    </PublicShell>
  );
}

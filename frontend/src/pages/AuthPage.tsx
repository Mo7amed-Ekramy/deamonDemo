import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CircleCheck,
  Eye,
  EyeOff,
  Mail,
  Sparkles,
  Store,
} from "lucide-react";
import {
  Arrow,
  ButtonLink,
  Logo,
  PublicShell,
  ThemeToggle,
} from "../components/ui";
import { useWorkspace } from "../state/WorkspaceProvider";
import type { AccountType } from "../data/workspace";

function PasswordField({
  id,
  label,
  auto = "new-password",
}: {
  id: string;
  label: string;
  auto?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="dp-field" htmlFor={id}>
      {label}
      <span className="dp-password">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={auto}
          minLength={8}
          maxLength={100}
          placeholder={
            auto === "current-password"
              ? "Enter your password"
              : "At least 8 characters"
          }
          required
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-controls={id}
          title={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
function EmailField() {
  return (
    <label className="dp-field" htmlFor="email">
      Email address
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        maxLength={150}
        placeholder="you@company.com"
        required
      />
    </label>
  );
}
export function AuthPage({ mode }: { mode: string }) {
  const [params] = useSearchParams();
  const initialRole: AccountType =
    params.get("plan") === "agency" ? "agency" : "business";
  const [role, setRole] = useState<AccountType>(initialRole);
  const [stage, setStage] = useState("form");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const { update } = useWorkspace();
  const signup = mode === "signup",
    forgot = mode === "forgot-password",
    reset = mode === "reset-password";
  const title = signup
    ? "Let’s get you started."
    : forgot
      ? "Forgot your password?"
      : reset
        ? "Set a new password."
        : "Welcome back.";
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    if ((signup || reset) && fields.get("password") !== fields.get("confirm")) {
      setError("The passwords don’t match. Please try again.");
      return;
    }
    if (signup && !String(fields.get("organization") || "").trim()) {
      setError("Please enter your business or agency name.");
      return;
    }
    setError("");
    // Passwords remain in this form only. There is no authentication endpoint in this frontend.
    if (forgot) {
      setEmail(String(fields.get("email")));
      setStage("sent");
      return;
    }
    if (signup)
      update((data) => ({
        ...data,
        accountType: role,
        displayName: String(fields.get("organization")).trim(),
      }));
    e.currentTarget.reset();
    setStage("success");
  }
  return (
    <PublicShell>
      <header className="dp-auth-nav dp-wrap">
        <Logo />
        <div className="auth-header-actions">
          <ThemeToggle />
          <Link className="dp-text-button" to="/">
            <ArrowLeft />
            Back to home
          </Link>
        </div>
      </header>
      <main id="main-content" className="dp-auth-layout dp-wrap">
        <aside className="dp-auth-story">
          <span className="dp-eyebrow">A HOME FOR YOUR NEXT BIG IDEA</span>
          <h2>
            Great campaigns
            <br />
            start with
            <br />
            <span>a conversation.</span>
          </h2>
          <p>
            Your brand, your goals and all the ideas in between. Bring them
            together with Daemon.
          </p>
          <div className="dp-auth-story-card">
            <span className="dp-agent-avatar">d.</span>
            <div>
              <strong>
                Your workspace is ready
                <br />
                for what comes next.
              </strong>
              <p>One project. Every conversation connected.</p>
              <div className="dp-story-dots">
                {["Brief", "Plan", "Create", "Launch"].map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <span className="dp-auth-story-foot">
            FOR AGENCIES. FOR BUSINESSES. FOR YOUR NEXT CHAPTER.
          </span>
        </aside>
        <div className="dp-auth-form-wrap">
          <div className="dp-auth-content">
            {stage === "sent" ? (
              <>
                <span className="dp-success-icon">
                  <Mail />
                </span>
                <span className="dp-eyebrow">PASSWORD RESET</span>
                <h1>Check your inbox.</h1>
                <p>
                  A reset link would be sent to your address. This local preview
                  does not send email.
                </p>
                <p className="dp-mail-preview">{email}</p>
                <div className="dp-auth-actions">
                  <ButtonLink to="/reset-password">
                    Preview the reset link <Arrow />
                  </ButtonLink>
                  <button
                    className="dp-button dp-outline"
                    onClick={() => {
                      setStage("form");
                      setEmail("");
                    }}
                  >
                    Use another email
                  </button>
                </div>
                <div className="dp-auth-switch">
                  <Link to="/login">Back to log in</Link>
                </div>
              </>
            ) : stage === "success" ? (
              <>
                <span className="dp-success-icon">
                  {reset ? <CircleCheck /> : <Sparkles />}
                </span>
                <span className="dp-eyebrow">READY WHEN YOU ARE</span>
                <h1>{reset ? "You’re all set." : "Hello, possibility."}</h1>
                <p>
                  {reset
                    ? "Password reset preview complete. No account has been changed."
                    : `Your ${signup ? "account setup" : "sign-in"} preview is complete. Explore the sample workspace next.`}
                </p>
                <div className="dp-auth-actions">
                  <ButtonLink to={reset ? "/login" : "/app"}>
                    {reset ? "Back to log in" : "Open demo workspace"} <Arrow />
                  </ButtonLink>
                  <ButtonLink to="/" outline>
                    Back to home
                  </ButtonLink>
                </div>
              </>
            ) : (
              <>
                <span className="dp-eyebrow">
                  {signup
                    ? "MAKE ROOM FOR YOUR IDEAS"
                    : forgot
                      ? "LET’S GET YOU BACK IN"
                      : reset
                        ? "A FRESH START"
                        : "BACK TO YOUR NEXT BIG IDEA"}
                </span>
                <h1>{title}</h1>
                <p>
                  {signup
                    ? "Choose how you’ll use Daemon. Your workspace starts here."
                    : forgot
                      ? "Enter the email address linked to your account to start the reset flow."
                      : reset
                        ? "Choose a new password to continue to your account."
                        : "Your conversations, campaign plans and creative work are waiting for you."}
                </p>
                {signup && (
                  <>
                    <div className="dp-role-picker" aria-label="Account type">
                      <button
                        aria-pressed={role === "business"}
                        onClick={() => setRole("business")}
                      >
                        <Store />
                        Business
                      </button>
                      <button
                        aria-pressed={role === "agency"}
                        onClick={() => setRole("agency")}
                      >
                        <Building2 />
                        Agency
                      </button>
                    </div>
                    {params.has("plan") && (
                      <div className="dp-plan-choice">
                        Exploring {role === "agency" ? "Agency" : "Business"} ·
                        Pricing to be announced
                      </div>
                    )}
                  </>
                )}
                <form className="dp-form" onSubmit={submit}>
                  {signup && (
                    <label className="dp-field" htmlFor="organization">
                      {role === "agency" ? "Agency name" : "Business name"}
                      <input
                        id="organization"
                        name="organization"
                        autoComplete="organization"
                        maxLength={80}
                        required
                        placeholder={
                          role === "agency" ? "Your agency" : "Your business"
                        }
                      />
                    </label>
                  )}
                  {!reset && <EmailField />}
                  {!forgot && (
                    <PasswordField
                      id="password"
                      label={reset ? "New password" : "Password"}
                      auto={
                        signup || reset ? "new-password" : "current-password"
                      }
                    />
                  )}
                  {(signup || reset) && (
                    <PasswordField id="confirm" label="Confirm password" />
                  )}
                  {!signup && !forgot && !reset && (
                    <div className="dp-form-meta">
                      <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                  )}
                  {error && (
                    <p className="dp-form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" className="dp-button dp-primary">
                    {signup
                      ? "Create account"
                      : forgot
                        ? "Send reset link"
                        : reset
                          ? "Reset password"
                          : "Log in"}
                    <Arrow />
                  </button>
                </form>
                {signup && (
                  <p className="dp-auth-helper">
                    Demo setup only. No account or paid subscription is created.
                  </p>
                )}
                <div className="dp-auth-switch">
                  {signup ? (
                    <>
                      Already have an account? <Link to="/login">Log in</Link>
                    </>
                  ) : forgot || reset ? (
                    <Link to="/login">Back to log in</Link>
                  ) : (
                    <>
                      New to Daemon? <Link to="/signup">Create an account</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </PublicShell>
  );
}

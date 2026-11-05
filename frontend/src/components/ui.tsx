import { createContext, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Moon, Sun } from "lucide-react";

type ThemeOrigin = { x: number; y: number };
const ThemeContext = createContext<{
  theme: string;
  toggle: (origin?: ThemeOrigin) => void;
}>({ theme: "dark", toggle: () => {} });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("daemon.theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  const animating = useRef(false);
  const fallbackTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(fallbackTimer.current);
      document.documentElement.classList.remove("theme-fading");
    },
    [],
  );
  function toggle(origin?: ThemeOrigin) {
    if (animating.current) return;
    const next = theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    const apply = () => {
      html.dataset.theme = next;
      flushSync(() => setTheme(next));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    if (typeof document.startViewTransition !== "function") {
      html.classList.add("theme-fading");
      apply();
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = window.setTimeout(
        () => html.classList.remove("theme-fading"),
        380,
      );
      return;
    }
    animating.current = true;
    const x = origin?.x ?? innerWidth / 2,
      y = origin?.y ?? 40;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    html.classList.add("theme-revealing");
    const transition = document.startViewTransition(apply);
    void transition.ready
      .then(() => {
        html.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 520,
            easing: "cubic-bezier(.22,.68,0,1)",
            pseudoElement: "::view-transition-new(root)",
            fill: "both",
          },
        );
      })
      .catch(() => {
        /* The theme still updates if the browser skips the visual transition. */
      });
    void transition.finished
      .catch(() => {})
      .finally(() => {
        animating.current = false;
        html.classList.remove("theme-revealing");
      });
  }
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("daemon.theme", theme);
    } catch {
      /* Browsing still works without storage. */
    }
  }, [theme]);
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        toggle({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span
        className={`theme-icons ${theme === "light" ? "is-light" : ""}`}
        aria-hidden="true"
      >
        <Sun className="theme-sun" size={17} />
        <Moon className="theme-moon" size={17} />
      </span>
    </button>
  );
}
export function Logo({
  to = "/",
  className = "dp-logo",
}: {
  to?: string;
  className?: string;
}) {
  return (
    <Link to={to} className={className} aria-label="Daemon home">
      <span aria-hidden="true" />
      daemon
    </Link>
  );
}
export function Arrow() {
  return <ArrowUpRight size={16} aria-hidden="true" />;
}
export function DemoNotice() {
  return (
    <div className="dp-preview-bar">
      <span>DAEMON · INTERACTIVE DEMO</span>
      <span>
        Explore with sample data{" "}
        <Link to="/app">
          Open workspace <Arrow />
        </Link>
      </span>
    </div>
  );
}
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div id="daemon-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <DemoNotice />
      {children}
    </div>
  );
}
export function ButtonLink({
  to,
  children,
  outline = false,
  className = "",
}: {
  to: string;
  children: ReactNode;
  outline?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`dp-button ${outline ? "dp-outline" : "dp-primary"} ${className}`}
    >
      {children}
    </Link>
  );
}

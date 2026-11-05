import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider, PublicShell, ButtonLink, Logo } from "./components/ui";
import { WorkspaceProvider } from "./state/WorkspaceProvider";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import "./styles/reference.css";
import "./styles/app.css";
import "./styles/canvas.css";
import "./styles/sidebar.css";

function ScrollAndTitle() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = {
      "/": "Your next campaign starts here",
      "/login": "Welcome back",
      "/signup": "Create your workspace",
      "/forgot-password": "Reset your password",
      "/reset-password": "Set a new password",
    };
    document.title = `Daemon — ${names[pathname] || (pathname.startsWith("/app") ? "Workspace" : "Page not found")}`;
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="error-page">
        <h1>Let’s get you back on track.</h1>
        <p>
          The interface couldn’t load this view. Reload to try again; your saved
          project stays in this browser.
        </p>
        <button
          className="fallback-button"
          onClick={() => window.location.reload()}
        >
          Reload Daemon
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <ScrollAndTitle />
            <Routes>
              <Route path="/" element={<HomePage />} />
              {["login", "signup", "forgot-password", "reset-password"].map(
                (page) => (
                  <Route
                    key={page}
                    path={`/${page}`}
                    element={<AuthPage key={page} mode={page} />}
                  />
                ),
              )}
              <Route path="/app" element={<WorkspacePage />} />
              <Route
                path="/app/projects/:projectId"
                element={<WorkspacePage />}
              />
              <Route
                path="/workspace"
                element={<Navigate to="/app" replace />}
              />
              <Route
                path="*"
                element={
                  <PublicShell>
                    <main id="main-content" className="not-found">
                      <Logo />
                      <span>404</span>
                      <h1>This page took a different direction.</h1>
                      <p>Let’s get you back to your next campaign.</p>
                      <ButtonLink to="/">Back to home</ButtonLink>
                      <Link to="/app">Open demo workspace</Link>
                    </main>
                  </PublicShell>
                }
              />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

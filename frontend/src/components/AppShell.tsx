import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Settings, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_API_BASE, getApiBaseUrl, setApiBaseUrl } from "@/lib/api";

const NAV = [
  { to: "/", label: "Diagnostics" },
  { to: "/predictor", label: "Predictor" },
  { to: "/batch", label: "Batch CSV" },
] as const;

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState(DEFAULT_API_BASE);

  useEffect(() => {
    if (open) setUrl(getApiBaseUrl());
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl shadow-ink/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">API Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Base URL for the ML backend. Defaults to local dev.
        </p>
        <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          API Base URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={DEFAULT_API_BASE}
          className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setUrl(DEFAULT_API_BASE)}
            className="flex-1 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Reset to default
          </button>
          <button
            onClick={() => {
              setApiBaseUrl(url || DEFAULT_API_BASE);
              onClose();
              window.location.reload();
            }}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setApiBase(getApiBaseUrl());
  }, [settingsOpen]);

  const host = apiBase.replace(/^https?:\/\//, "");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute -left-10 -top-10 size-72 rounded-full bg-sun/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 size-80 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 rotate-[-6deg] place-items-center rounded-2xl bg-ink shadow-lg shadow-ink/20">
              <span className="font-display text-2xl font-extrabold text-sun">V</span>
            </div>
            <div>
              <p className="font-display text-xl font-extrabold leading-none">
                Valu<span className="text-brand">IQ</span>
              </p>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                Real Estate ML Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-full bg-card p-1 shadow-md shadow-ink/5 md:flex">
              {NAV.map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-ink text-ink-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold shadow-md shadow-ink/5 transition-colors hover:bg-muted"
            >
              <span className="size-2 rounded-full bg-accent" />
              <span className="hidden font-mono text-xs sm:inline">{host}</span>
              <Settings className="size-4 text-muted-foreground" />
            </button>
          </div>
          <nav className="flex w-full items-center gap-1 rounded-full bg-card p-1 shadow-md shadow-ink/5 md:hidden">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors ${
                    active ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {children ?? <Outlet />}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

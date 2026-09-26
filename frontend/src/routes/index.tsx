import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { fetchMetrics, MODEL_TYPES, type ModelType } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Model Diagnostics — ValuIQ" },
      {
        name: "description",
        content: "Compare OLS, Ridge and Lasso regression models and explore feature importance for house price prediction.",
      },
      { property: "og:title", content: "Model Diagnostics — ValuIQ" },
      {
        property: "og:description",
        content: "Compare OLS, Ridge and Lasso regression models and explore feature importance for house price prediction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiagnosticsPage,
});

const MODEL_LABELS: Record<ModelType, { name: string; tag: string }> = {
  OLS_Linear: { name: "OLS", tag: "Linear" },
  Ridge_L2: { name: "Ridge", tag: "L2" },
  Lasso_L1: { name: "Lasso", tag: "L1" },
};

const CARD_STYLES: Record<ModelType, string> = {
  OLS_Linear: "bg-card border-t-4 border-brand",
  Ridge_L2: "bg-ink text-ink-foreground border-t-4 border-sun",
  Lasso_L1: "bg-card border-t-4 border-accent",
};

const BAR_COLORS = ["#ff5a3c", "#19b3a3", "#ffc53d", "#6f6da8", "#4a4878", "#8f8dc0"];

function DiagnosticsPage() {
  const [selected, setSelected] = useState<ModelType>("Ridge_L2");
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    retry: 1,
  });

  const bestModel = data
    ? MODEL_TYPES.reduce<ModelType | null>(
        (best, m) =>
          data[m] && (best === null || (data[m]?.r2 ?? 0) > (data[best]?.r2 ?? 0))
            ? m
            : best,
        null,
      )
    : null;

  const coefData = Object.entries(data?.[selected]?.coefficients ?? {})
    .map(([feature, value]) => ({ feature, value: Number(value) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="shrink-0 space-y-3 lg:w-80">
        <div className="rounded-3xl bg-card p-5 shadow-lg shadow-ink/5">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${isError ? "bg-destructive" : "bg-accent"}`}
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {isError ? "Offline" : "Connected"}
            </span>
          </div>
          <p className="font-display text-lg font-bold">Model metrics</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">GET /metrics</p>
          <button
            onClick={() => refetch()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh metrics
          </button>
        </div>
        {bestModel && (
          <div className="animate-floaty rounded-3xl bg-brand p-5 text-brand-foreground shadow-lg shadow-brand/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-foreground/70">
              Best model
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold">{bestModel}</p>
            <p className="mt-1 text-sm text-brand-foreground/80">
              R² {data?.[bestModel]?.r2.toFixed(2)} · highest score
            </p>
          </div>
        )}
      </aside>

      <main className="min-w-0 flex-1 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-3xl font-bold">Model Diagnostics</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Compare OLS, Ridge &amp; Lasso — what drives price
            </p>
          </div>
          <p className="font-mono text-xs font-semibold text-muted-foreground">GET /metrics</p>
        </div>

        {isError && (
          <div className="rounded-3xl bg-card p-6 shadow-lg shadow-ink/5">
            <p className="font-display text-lg font-bold text-destructive">
              Couldn't reach the API
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(error as Error).message}. Check the API Base URL in Settings and make sure
              the backend is running.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MODEL_TYPES.map((m) => {
            const metrics = data?.[m];
            const isRidge = m === "Ridge_L2";
            const isSelected = selected === m;
            return (
              <button
                key={m}
                onClick={() => setSelected(m)}
                className={`relative rounded-3xl p-5 text-left shadow-lg transition-all ${CARD_STYLES[m]} ${
                  isSelected ? "ring-2 ring-ink/60 ring-offset-2 ring-offset-background" : ""
                } ${isRidge ? "shadow-ink/20" : "shadow-ink/5"}`}
              >
                {bestModel === m && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-sun px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sun-foreground">
                    Top
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">{MODEL_LABELS[m].name}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      isRidge ? "bg-ink-foreground/10 text-sun" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {MODEL_LABELS[m].tag}
                  </span>
                </div>
                <p
                  className={`mt-3 font-display text-3xl font-extrabold ${isRidge ? "text-sun" : ""}`}
                >
                  {isLoading ? "…" : metrics ? metrics.r2.toFixed(2) : "—"}
                </p>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide ${
                    isRidge ? "text-ink-foreground/40" : "text-muted-foreground"
                  }`}
                >
                  R² Score
                </p>
                <div
                  className={`mt-4 grid grid-cols-2 gap-3 border-t pt-4 ${
                    isRidge ? "border-ink-foreground/10" : "border-border"
                  }`}
                >
                  <div>
                    <p
                      className={`text-[11px] font-semibold ${isRidge ? "text-ink-foreground/40" : "text-muted-foreground"}`}
                    >
                      MSE
                    </p>
                    <p className="font-display text-lg font-bold">
                      {metrics ? metrics.mse.toFixed(2) : "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-[11px] font-semibold ${isRidge ? "text-ink-foreground/40" : "text-muted-foreground"}`}
                    >
                      MAE
                    </p>
                    <p className="font-display text-lg font-bold">
                      {metrics ? metrics.mae.toFixed(2) : "—"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-lg shadow-ink/5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-xl font-bold">Feature Importance</p>
              <p className="text-xs font-semibold text-muted-foreground">
                Coefficients · {selected}
              </p>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
              Model: {MODEL_LABELS[selected].name}
            </span>
          </div>
          {coefData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coefData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,26,69,0.08)" vertical={false} />
                  <XAxis
                    dataKey="feature"
                    tick={{ fill: "#1b1a45", fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: "rgba(27,26,69,0.15)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(27,26,69,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(27,26,69,0.04)" }}
                    contentStyle={{
                      borderRadius: 16,
                      border: "none",
                      boxShadow: "0 8px 24px rgba(27,26,69,0.15)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                    }}
                    formatter={(v) => [Number(v).toFixed(4), "Coefficient"]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {coefData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {isLoading
                ? "Loading coefficients…"
                : "No coefficient data returned for this model."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

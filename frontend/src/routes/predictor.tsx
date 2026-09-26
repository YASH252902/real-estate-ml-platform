import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { MODEL_TYPES, predictSingle, type ModelType } from "@/lib/api";

export const Route = createFileRoute("/predictor")({
  head: () => ({
    meta: [
      { title: "Interactive Predictor — ValuIQ" },
      {
        name: "description",
        content: "Estimate a house price with OLS, Ridge or Lasso regression models.",
      },
      { property: "og:title", content: "Interactive Predictor — ValuIQ" },
      {
        property: "og:description",
        content: "Estimate a house price with OLS, Ridge or Lasso regression models.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PredictorPage,
});

interface FieldDef {
  key: "median_income" | "house_age" | "avg_rooms" | "avg_bedrooms" | "population";
  label: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: FieldDef[] = [
  { key: "median_income", label: "Median Income", min: 0, max: 15, step: 0.1 },
  { key: "house_age", label: "House Age", min: 1, max: 52, step: 1 },
  { key: "avg_rooms", label: "Avg Rooms", min: 1, max: 15, step: 0.1 },
  { key: "avg_bedrooms", label: "Avg Bedrooms", min: 0, max: 5, step: 0.05 },
  { key: "population", label: "Population", min: 0, max: 40000, step: 100 },
];

const DEFAULTS = {
  median_income: 5.0,
  house_age: 20,
  avg_rooms: 5.5,
  avg_bedrooms: 1.1,
  population: 1500,
};

function PredictorPage() {
  const [values, setValues] = useState(DEFAULTS);
  const [modelType, setModelType] = useState<ModelType>("Ridge_L2");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof DEFAULTS, v: number) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictSingle({ ...values, model_type: modelType });
      setResult(res.estimated_value_usd);
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <p className="font-display text-3xl font-bold">Interactive Predictor</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Tune the features, pick a model, get a price estimate
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-3xl bg-card p-6 shadow-lg shadow-ink/5 sm:p-8"
      >
        <div className="space-y-6">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="text-sm font-semibold">{f.label}</label>
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={values[f.key]}
                  onChange={(e) => set(f.key, Number(e.target.value))}
                  className="w-28 rounded-xl border border-input bg-background px-3 py-1.5 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={values[f.key]}
                onChange={(e) => set(f.key, Number(e.target.value))}
                className="w-full accent-brand"
              />
              <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
                <span>{f.min}</span>
                <span>{f.max}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Model</label>
          <div className="relative">
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelType)}
              className="w-full appearance-none rounded-2xl border border-input bg-background px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {MODEL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          <Sparkles className="size-4 text-sun" />
          {loading ? "Predicting…" : "Predict price"}
        </button>
      </form>

      {error && (
        <div className="rounded-3xl bg-card p-5 text-center shadow-lg shadow-ink/5">
          <p className="font-display font-bold text-destructive">Prediction failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {result !== null && !error && (
        <div className="rounded-3xl bg-card p-8 text-center shadow-lg shadow-ink/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Estimated value · {modelType}
          </p>
          <p className="mt-2 font-display text-5xl font-extrabold text-success">
            {result.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      )}
    </div>
  );
}

const STORAGE_KEY = "valuiq_api_base_url";
export const DEFAULT_API_BASE = "http://127.0.0.1:8000";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string) {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/+$/, ""));
}

export const MODEL_TYPES = ["OLS_Linear", "Ridge_L2", "Lasso_L1"] as const;
export type ModelType = (typeof MODEL_TYPES)[number];

export interface ModelMetrics {
  r2: number;
  mse: number;
  mae: number;
  coefficients: Record<string, number>;
}

export type MetricsResponse = Partial<Record<ModelType, ModelMetrics>>;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Normalize a single model's metrics from a variety of backend shapes. */
function normalizeModel(raw: unknown): ModelMetrics {
  const o = (raw ?? {}) as Record<string, unknown>;
  const coefs = (o["coefficients"] ?? o["feature_importance"] ?? o["features"] ?? {}) as Record<
    string,
    unknown
  >;
  const coefficients: Record<string, number> = {};
  for (const [k, v] of Object.entries(coefs)) coefficients[k] = num(v);
  return {
    r2: num(o["r2"] ?? o["r_squared"] ?? o["r2_score"]),
    mse: num(o["mse"] ?? o["mean_squared_error"]),
    mae: num(o["mae"] ?? o["mean_absolute_error"]),
    coefficients,
  };
}

/** Normalize GET /metrics into { OLS_Linear: {...}, Ridge_L2: {...}, Lasso_L1: {...} }. */
export function normalizeMetrics(raw: unknown): MetricsResponse {
  const root = (raw ?? {}) as Record<string, unknown>;
  const models = (root["models"] ?? root) as Record<string, unknown>;
  const out: MetricsResponse = {};
  for (const key of MODEL_TYPES) {
    const candidates: string[] = [key, key.split("_")[0] ?? key, key.toLowerCase()];
    for (const c of candidates) {
      if (models[c] != null) {
        out[key] = normalizeModel(models[c]);
        break;
      }
    }
  }
  return out;
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  const res = await fetch(`${getApiBaseUrl()}/metrics`);
  if (!res.ok) throw new Error(`GET /metrics failed (${res.status})`);
  return normalizeMetrics(await res.json());
}

export interface PredictInput {
  median_income: number;
  house_age: number;
  avg_rooms: number;
  avg_bedrooms: number;
  population: number;
  model_type: ModelType;
}

export interface PredictResult {
  estimated_value_usd: number;
}

export async function predictSingle(input: PredictInput): Promise<PredictResult> {
  const res = await fetch(`${getApiBaseUrl()}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`POST /predict failed (${res.status})`);
  const data = (await res.json()) as Record<string, unknown>;
  const value = num(
    data["estimated_value_usd"] ?? data["prediction"] ?? data["predicted_value"] ?? data["value"],
  );
  return { estimated_value_usd: value };
}

export type BatchRow = Record<string, unknown>;

export interface BatchResult {
  rows: BatchRow[];
}

/** Normalize POST /predict-batch JSON into a flat array of row objects. */
export function normalizeBatch(raw: unknown): BatchRow[] {
  if (Array.isArray(raw)) return raw as BatchRow[];
  const o = (raw ?? {}) as Record<string, unknown>;
  for (const key of ["predictions", "results", "rows", "data"]) {
    if (Array.isArray(o[key])) return o[key] as BatchRow[];
  }
  return [o];
}

export async function predictBatch(file: File): Promise<BatchResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${getApiBaseUrl()}/predict-batch`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`POST /predict-batch failed (${res.status})`);
  return { rows: normalizeBatch(await res.json()) };
}

export function rowsToCsv(rows: BatchRow[]): string {
  if (rows.length === 0) return "";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const row of rows) lines.push(cols.map((c) => escape(row[c])).join(","));
  return lines.join("\n");
}

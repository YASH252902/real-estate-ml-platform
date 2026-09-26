import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import { predictBatch, rowsToCsv, type BatchRow } from "@/lib/api";

export const Route = createFileRoute("/batch")({
  head: () => ({
    meta: [
      { title: "Batch CSV Processing — ValuIQ" },
      {
        name: "description",
        content: "Upload a CSV of properties and get batch price predictions from the ML models.",
      },
      { property: "og:title", content: "Batch CSV Processing — ValuIQ" },
      {
        property: "og:description",
        content: "Upload a CSV of properties and get batch price predictions from the ML models.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BatchPage,
});

const PAGE_SIZE = 10;

function BatchPage() {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columns = useMemo(
    () => Array.from(new Set(rows.flatMap((r) => Object.keys(r)))),
    [rows],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    setRows([]);
    setPage(0);
    try {
      const res = await predictBatch(file);
      setRows(res.rows);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const csv = rowsToCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? fileName.replace(/\.csv$/i, "") + "_predictions.csv" : "predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-display text-3xl font-bold">Batch CSV Processing</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Drop a CSV of properties — get predictions for every row
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed bg-card p-12 text-center shadow-lg shadow-ink/5 transition-colors ${
          dragging ? "border-brand bg-brand/5" : "border-input hover:border-accent"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="grid size-14 place-items-center rounded-2xl bg-ink">
          <UploadCloud className="size-6 text-sun" />
        </div>
        <p className="font-display text-lg font-bold">
          {loading ? "Processing…" : "Drag & drop your CSV here"}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse — sent as multipart/form-data to POST /predict-batch
        </p>
        {fileName && !loading && (
          <span className="mt-1 flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-mono text-xs font-semibold">
            <FileSpreadsheet className="size-3.5 text-accent" />
            {fileName}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-3xl bg-card p-5 shadow-lg shadow-ink/5">
          <p className="font-display font-bold text-destructive">Batch prediction failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-card shadow-lg shadow-ink/5">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display text-xl font-bold">Results</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {rows.length} rows · page {page + 1} of {pageCount}
              </p>
            </div>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90"
            >
              <Download className="size-4 text-sun" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/60">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    #
                  </th>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {page * PAGE_SIZE + i + 1}
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-3 font-mono text-xs">
                        {row[c] == null ? "—" : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border p-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-xl bg-muted px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" /> Prev
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              {page + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="flex items-center gap-1 rounded-xl bg-muted px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-40"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

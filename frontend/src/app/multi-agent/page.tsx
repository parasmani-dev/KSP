"use client"

import { ChangeEvent, useState } from "react"
import { AxiosError } from "axios"
import { ArrowRight, CheckCircle2, FileText, Loader2, RotateCcw, ShieldCheck, Upload } from "lucide-react"
import { evidenceApi } from "@/lib/api"

const SAMPLE_FIR = "SYNTHETIC DEMO RECORD — On 14 November 2024 at 22:30, a witness reported a theft near Whitefield, Bengaluru. The witness mentioned a person named Arun Kumar and a white car. This is fictional sample text; no allegation has been verified."

type EvidenceResult = {
  analysis_mode: string
  notice: string
  summary: { summary: string; key_facts: string[] }
  entities: Record<string, string[]>
  timeline: { events: { timestamp: string; description: string }[] }
}

const ENTITY_LABELS: Record<string, string> = {
  persons: "People mentioned",
  locations: "Places mentioned",
  vehicles: "Vehicles mentioned",
  dates: "Dates mentioned",
  times: "Times mentioned",
  organizations: "Organizations mentioned",
}

export default function EvidenceWorkspace() {
  const [text, setText] = useState(SAMPLE_FIR)
  const [fileName, setFileName] = useState("")
  const [result, setResult] = useState<EvidenceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ""
    if (!file.name.toLowerCase().endsWith(".txt") || file.size > 128 * 1024) {
      setError("Choose a .txt file smaller than 128 KB.")
      return
    }
    setText(await file.text())
    setFileName(file.name)
    setResult(null)
    setError("")
  }

  const processText = async () => {
    if (!text.trim()) {
      setError("Add synthetic text before running the preview.")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const response = await evidenceApi.post<EvidenceResult>("/api/v1/processor/", {
        fir_text: text,
        witness_statements: [],
      })
      setResult(response.data)
    } catch (cause) {
      const status = (cause as AxiosError).response?.status
      setError(status === 503
        ? "The evidence service is waking up or temporarily unavailable. Try again shortly."
        : "The preview could not run. Check that the evidence service is online and try again.")
    } finally {
      setLoading(false)
    }
  }

  const groups = Object.entries(result?.entities ?? {}).filter(([key, values]) => ENTITY_LABELS[key] && values.length > 0)
  const keyless = result?.analysis_mode === "synthetic_preview"

  return (
    <div className="ksp-page min-h-full overflow-y-auto text-slate-200">
      <div className="mx-auto max-w-[1280px] space-y-6 pb-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="ksp-eyebrow mb-2">Casework / demonstration</div>
            <h1 className="ksp-heading flex items-center gap-3"><FileText className="h-6 w-6 text-[#d0ad71]" /> Evidence workspace</h1>
            <p className="ksp-subheading mt-2 max-w-2xl">Explore a fictional report and review text matches. This workspace is for demonstration, not investigative findings.</p>
          </div>
          <span className="rounded-full border border-[#715b40] bg-[#302b27] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ead0a4]">Synthetic demo</span>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-xl border border-[#30404a] bg-[#101d25] p-5 shadow-lg shadow-black/10" aria-labelledby="source-title">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7a770]">01 / Source</p><h2 id="source-title" className="mt-1 text-lg font-semibold text-white">Fictional report text</h2></div>
              <button type="button" onClick={() => { setText(SAMPLE_FIR); setFileName(""); setResult(null); setError("") }} className="inline-flex items-center gap-1.5 rounded border border-[#41525a] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#20303a]"><RotateCcw className="h-3.5 w-3.5" /> Reset sample</button>
            </div>
            <label htmlFor="fir-text" className="mb-2 block text-xs font-medium text-slate-300">Report content</label>
            <textarea id="fir-text" value={text} onChange={(event) => { setText(event.target.value); setResult(null) }} maxLength={8000} rows={13} className="w-full resize-y rounded-lg border border-[#41525a] bg-[#0b151c] p-4 text-sm leading-6 text-slate-100 outline-none focus:border-[#c7a770]" aria-describedby="text-help" />
            <p id="text-help" className="mt-2 text-xs leading-5 text-slate-400">Use fictional text only. The browser reads .txt files locally; it sends the text to the demo API when you run the preview.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-[#41525a] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#20303a]"><Upload className="h-4 w-4" /> Load .txt <input type="file" accept=".txt,text/plain" onChange={loadFile} className="sr-only" /></label>
              {fileName && <span className="max-w-[220px] truncate text-xs text-slate-400" title={fileName}>{fileName}</span>}
            </div>
            <button type="button" disabled={loading} onClick={processText} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c7a770] px-4 py-3 text-sm font-bold text-[#142028] transition-colors hover:bg-[#e1c38e] disabled:cursor-wait disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{loading ? "Processing preview…" : "Run evidence preview"}</button>
            {error && <p role="alert" className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}
          </section>

          <section className="rounded-xl border border-[#30404a] bg-[#101d25] p-5 shadow-lg shadow-black/10" aria-labelledby="review-title">
            <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7a770]">02 / Review</p><h2 id="review-title" className="mt-1 text-lg font-semibold text-white">Preview output</h2></div>{result && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">Completed</span>}</div>
            {!result ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-[#41525a] bg-[#0b151c] p-8 text-center"><ShieldCheck className="mb-4 h-9 w-9 text-[#c7a770]" /><h3 className="text-base font-semibold text-white">Ready for a synthetic walkthrough</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Run the preloaded sample to see a text preview, explicitly mentioned entities, and a timestamp list. No API key is required.</p></div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-[#715b40] bg-[#302b27] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ead0a4]">{keyless ? "Keyless text preview" : "Model-assisted response"}</p><p className="mt-1 text-xs leading-5 text-slate-300">{result.notice || "Review all outputs against the source text. This demonstration is not an operational finding."}</p></div>
                <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Submitted text</h3><p className="rounded-lg border border-[#30404a] bg-[#0b151c] p-4 text-sm leading-6 text-slate-200">{result.summary.summary}</p></div>
                <div><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Explicit text matches</h3>{groups.length ? <div className="grid gap-3 sm:grid-cols-2">{groups.map(([key, values]) => <div key={key} className="rounded-lg border border-[#30404a] bg-[#0b151c] p-3"><p className="mb-2 text-[11px] font-medium text-slate-400">{ENTITY_LABELS[key]}</p><div className="flex flex-wrap gap-1.5">{values.map((value, index) => <span key={`${value}-${index}`} className="rounded border border-[#41525a] bg-[#1b2b34] px-2 py-1 text-xs text-slate-100">{value}</span>)}</div></div>)}</div> : <p className="text-sm text-slate-400">No supported text patterns matched.</p>}</div>
                <div><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Times mentioned</h3>{result.timeline.events.length ? <ol className="space-y-2">{result.timeline.events.map((event, index) => <li key={`${event.timestamp}-${index}`} className="flex gap-3 rounded-lg border border-[#30404a] bg-[#0b151c] p-3 text-xs"><span className="font-semibold text-[#ead0a4]">{event.timestamp}</span><span className="text-slate-300">{event.description}</span></li>)}</ol> : <p className="text-sm text-slate-400">No timestamp found in the submitted text.</p>}</div>
              </div>
            )}
          </section>
        </div>
        <div className="grid gap-3 md:grid-cols-3">{[["01", "Load a sample", "Start with the fictional report or enter your own synthetic text."], ["02", "Run the preview", "The keyless path uses deterministic text matching; no model is invoked."], ["03", "Check the source", "Every match remains a lead to inspect, never a verified allegation."]].map(([number, title, body]) => <div key={number} className="flex gap-3 rounded-lg border border-[#30404a] bg-[#101d25] p-4"><span className="text-xs font-bold text-[#c7a770]">{number}</span><div><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{body}</p></div><CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-[#6c817e]" /></div>)}</div>
      </div>
    </div>
  )
}

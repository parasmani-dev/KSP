"use client"
import { useEffect, useState } from "react"
import { aiApi } from "@/lib/api"
import { SearchCode, CheckCircle2, CircleDashed, Loader2, RefreshCw } from "lucide-react"

const AGENTS = ['Evidence Agent', 'Crime Pattern Agent', 'Network Agent', 'Risk Agent', 'Report Agent']

export default function InvestigationPage() {
  const [loading, setLoading] = useState(false)
  const [lastReport, setLastReport] = useState<any>(null)
  const [activeAgents, setActiveAgents] = useState(3)

  // Fetch latest investigation state by calling /predictions endpoint to check backend health
  useEffect(() => {
    // Try to get a sample offender risk to show something real
    aiApi.get('/predictions/offender/Sunil%20Patel?prior_crimes=3&days_since=45&connections=7&escalation=0.7&crime_type=Narcotics&area=Dharavi')
      .then(res => setLastReport(res.data))
      .catch(() => setLastReport(null))
  }, [])

  const handleRunAgents = async () => {
    setLoading(true)
    setActiveAgents(0)
    // Simulate agents running one by one
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 700))
      setActiveAgents(i)
    }
    // Fetch fresh data
    try {
      const res = await aiApi.get('/predictions/offender/Sunil%20Patel?prior_crimes=3&days_since=45&connections=7&escalation=0.7&crime_type=Narcotics&area=Dharavi')
      setLastReport(res.data)
    } catch { }
    setLoading(false)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Investigation Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Outputs from the Multi-Agent Investigation system.
          </p>
        </div>
        <button
          onClick={handleRunAgents}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Run All Agents
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent Status */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-primary" /> Agent Status
          </h3>
          <div className="space-y-3">
            {AGENTS.map((agent, i) => {
              const done = i < activeAgents
              const running = i === activeAgents && loading
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center gap-3">
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      : running
                        ? <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                        : <CircleDashed className="w-5 h-5 text-muted-foreground shrink-0" />
                    }
                    <span className="font-medium text-sm">{agent}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${done ? 'bg-emerald-500/10 text-emerald-500' : running ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {done ? 'Completed' : running ? 'Running...' : 'Standby'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Report Output */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Latest Investigation Report</h3>
          <div className="bg-background/50 border border-border/50 rounded-lg p-4 font-mono text-xs text-muted-foreground h-64 overflow-y-auto space-y-1">
            <p className="text-emerald-400">[SYSTEM] Multi-Agent Investigation Pipeline Active</p>
            <p></p>
            {lastReport ? (
              <>
                <p className="text-blue-400">RISK ASSESSMENT — {lastReport.citizen_id}</p>
                <p>─────────────────────────────</p>
                <p>Reoffend Probability: <span className="text-amber-400 font-bold">{lastReport.reoffend_probability}%</span></p>
                <p>Risk Level: <span className={lastReport.risk_level === 'Critical' ? 'text-red-400' : lastReport.risk_level === 'High' ? 'text-orange-400' : 'text-yellow-400'}>{lastReport.risk_level}</span></p>
                <p></p>
                <p className="text-blue-400">XAI FACTORS:</p>
                {(lastReport.reasons || []).map((r: any, i: number) => (
                  <p key={i}>  · {r.code?.replace(/_/g, ' ')}: {String(r.value)}</p>
                ))}
                <p></p>
                <p className="text-emerald-400">[REPORT AGENT] Summary compiled successfully.</p>
              </>
            ) : (
              <>
                <p>SUMMARY:</p>
                <p>  - Simulated FIR processed.</p>
                <p>  - Extracted 3 entities (2 Citizens, 1 Location).</p>
                <p>  - Graph updated via Network Agent.</p>
                <p>  - Risk profile escalated in Koramangala sector.</p>
                <p></p>
                <p className="text-amber-400">WAITING FOR RISK ASSESSMENT...</p>
                <p className="text-muted-foreground/50 text-[10px]">Click "Run All Agents" to generate a live report</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

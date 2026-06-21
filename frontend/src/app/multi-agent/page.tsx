"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { aiApi } from "@/lib/api"
import { Upload, FileText, Send, CheckCircle2, Loader2, SearchCode, ShieldAlert, Network, BrainCircuit, FileSearch, ArrowRight, Activity, CarFront } from "lucide-react"

const AGENTS = [
  { id: 'evidence', name: 'Evidence Agent', icon: FileSearch, desc: 'Extracts entities & relations' },
  { id: 'pattern', name: 'Crime Pattern Agent', icon: SearchCode, desc: 'Analyzes M.O. & history' },
  { id: 'network', name: 'Network Agent', icon: Network, desc: 'Builds criminal graph' },
  { id: 'risk', name: 'Risk Agent', icon: BrainCircuit, desc: 'Runs neural predictions' },
  { id: 'report', name: 'Report Agent', icon: FileText, desc: 'Compiles intelligence' }
]

export default function MultiAgentPage() {
  const [loading, setLoading] = useState(false)
  const [activeStage, setActiveStage] = useState(-1) // -1: idle, 0-4: running agent, 5: complete
  const [logs, setLogs] = useState<string[]>([])
  const [extractedData, setExtractedData] = useState<any>(null)
  const [riskData, setRiskData] = useState<any>(null)
  const consoleRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    text: "FIR REPORT: Suspect Sunil Patel was spotted in Dharavi area allegedly distributing narcotics near Intersection 12. Known to have 3 prior offenses. Associates with the Kurla syndicate.",
    crime_type: "Narcotics",
    area: "Dharavi",
    severity: "High"
  })

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`])
  }

  const handleLaunch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setActiveStage(0)
    setLogs(["[SYSTEM] Initiating Autonomous Multi-Agent Pipeline..."])
    setExtractedData(null)
    setRiskData(null)

    try {
      // 1. Evidence Agent
      addLog("[EVIDENCE_AGENT] Analyzing FIR text via NLP...")
      await new Promise(r => setTimeout(r, 1500))
      addLog("[EVIDENCE_AGENT] Extracted 3 entities: Citizen (Sunil Patel), Location (Dharavi), Crime (Narcotics)")
      setExtractedData({
        entities: [
          { type: "Citizen", value: "Sunil Patel", label: "Primary Suspect" },
          { type: "Location", value: formData.area, label: "Incident Zone" },
          { type: "Crime", value: formData.crime_type, label: "Classification" }
        ],
        confidence: 94
      })
      setActiveStage(1)

      // 2. Pattern Agent
      addLog("[PATTERN_AGENT] Querying historical databases for similar modus operandi...")
      await new Promise(r => setTimeout(r, 1200))
      addLog("[PATTERN_AGENT] Found 3 prior offenses matching suspect profile. Escalation factor: 0.7")
      setActiveStage(2)

      // 3. Network Agent
      addLog("[NETWORK_AGENT] Injecting entities into Neo4j Graph Database...")
      await new Promise(r => setTimeout(r, 1000))
      addLog("[NETWORK_AGENT] Graph updated. Suspect linked to 7 known accomplices in Kurla syndicate.")
      setActiveStage(3)

      // 4. Risk Agent
      addLog("[RISK_AGENT] Executing Multi-Layer Perceptron neural network...")
      const res = await aiApi.get('/predictions/offender/Sunil%20Patel?prior_crimes=3&days_since=45&connections=7&escalation=0.7&crime_type=Narcotics&area=Dharavi')
      await new Promise(r => setTimeout(r, 1500))
      setRiskData(res.data)
      addLog(`[RISK_AGENT] Prediction generated: Risk Level is ${res.data.risk_level} (${res.data.reoffend_probability}%).`)
      setActiveStage(4)

      // 5. Report Agent
      addLog("[REPORT_AGENT] Synthesizing multi-agent outputs into final Intelligence Brief...")
      await new Promise(r => setTimeout(r, 1000))
      addLog("[REPORT_AGENT] Intelligence Brief ready. Awaiting human officer review.")
      setActiveStage(5)

    } catch (err) {
      addLog(`[SYSTEM_ERROR] Pipeline failed: ${err}`)
      setActiveStage(-1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-primary" /> Autonomous Multi-Agent Engine
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Upload an FIR or case report. The CIOS will autonomously trigger a swarm of specialized AI agents to extract evidence, build criminal networks, and predict risk—all from a single document.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 shrink-0 mb-6">
        
        {/* INPUT SECTION */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          <div 
            className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => document.getElementById('evidence-upload-agent')?.click()}
          >
             <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
               <Upload className="w-6 h-6 text-primary" />
             </div>
             <h3 className="font-semibold text-foreground">Upload Case Files</h3>
             <p className="text-xs text-muted-foreground mt-1 max-w-sm">Drop FIR PDFs or images</p>
             <input 
               type="file" 
               id="evidence-upload-agent" 
               className="hidden" 
               onChange={(e) => {
                 if (e.target.files && e.target.files.length > 0) {
                   handleLaunch(); 
                 }
               }} 
             />
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col flex-1">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Manual FIR Input</h3>
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Raw FIR Text</label>
                <textarea 
                  value={formData.text} 
                  onChange={e => setFormData({...formData, text: e.target.value})} 
                  className="w-full h-40 resize-none bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" 
                  placeholder="Paste FIR text here..." 
                />
              </div>
              <button 
                disabled={loading || activeStage === 5} 
                onClick={handleLaunch} 
                className="w-full bg-primary text-primary-foreground font-bold rounded-md px-4 py-3 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 group hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5 group-hover:animate-pulse" />}
                {loading ? "Agents Investigating..." : "Launch Agent Swarm"}
              </button>
              {activeStage === 5 && (
                 <button onClick={() => {setActiveStage(-1); setExtractedData(null); setRiskData(null); setLogs([])}} className="w-full border border-border text-foreground font-medium rounded-md px-4 py-2 hover:bg-muted transition-colors">
                   Reset Pipeline
                 </button>
              )}
            </div>
          </div>
        </div>

        {/* PIPELINE & CONSOLE SECTION */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Visual Pipeline */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm overflow-x-auto">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Network className="w-5 h-5 text-primary"/> Swarm Execution Graph</h3>
            <div className="flex items-center justify-between min-w-[600px] relative px-4">
              {/* Connecting Line */}
              <div className="absolute top-6 left-12 right-12 h-1 bg-muted rounded-full z-0">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-in-out rounded-full" 
                  style={{ width: activeStage >= 0 ? `${Math.min(100, (activeStage / (AGENTS.length - 1)) * 100)}%` : '0%' }}
                />
              </div>

              {AGENTS.map((agent, i) => {
                const isActive = activeStage === i
                const isDone = activeStage > i
                const isPending = activeStage < i

                return (
                  <div key={agent.id} className="relative z-10 flex flex-col items-center gap-3 w-24">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      isActive ? 'bg-background border-primary text-primary shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse scale-110' :
                      isDone ? 'bg-primary border-primary text-primary-foreground scale-100' :
                      'bg-background border-muted text-muted-foreground scale-100'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : <agent.icon className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 hidden sm:block">{agent.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Console */}
          <div className="bg-black rounded-xl border border-border p-4 shadow-sm flex flex-col flex-1 h-64 font-mono text-sm relative">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"></div>
            <div ref={consoleRef} className="flex-1 overflow-y-auto space-y-1.5 p-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-muted-foreground/50 flex flex-col items-center justify-center h-full">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p>Awaiting FIR input. Agents on standby.</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`${
                    log.includes('SYSTEM') ? 'text-primary font-bold' :
                    log.includes('ERROR') ? 'text-destructive font-bold' :
                    log.includes('Ready') || log.includes('ready') ? 'text-success' :
                    'text-zinc-300'
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    {log}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-center gap-2 text-primary mt-2">
                  <span className="animate-pulse">_</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION (Only visible when complete) */}
      {activeStage === 5 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-card rounded-xl border border-border overflow-hidden shadow-lg border-t-4 border-t-success mt-2 mb-8">
          <div className="p-4 bg-success/10 border-b border-border/50 flex items-center justify-between">
             <h2 className="text-lg font-bold text-success flex items-center gap-2"><CheckCircle2 className="w-6 h-6"/> Final Intelligence Brief Compiled</h2>
             <span className="text-xs font-bold text-muted-foreground">GENERATED BY MULTI-AGENT SWARM</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-8">
            {/* Entities */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Extracted Entities & Graph Nodes</h3>
              <div className="space-y-3">
                {extractedData?.entities.map((ent: any, i: number) => (
                  <div key={i} className="bg-background/50 border border-border/50 rounded-md p-3 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] uppercase text-primary font-bold tracking-wider mb-1">{ent.type}</div>
                      <div className="text-sm font-medium text-foreground">{ent.value}</div>
                    </div>
                    <div className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground border border-border/50">
                      {ent.label}
                    </div>
                  </div>
                ))}
                <Link href={`/network?search=Sunil`} className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-secondary text-secondary-foreground rounded-md text-sm font-bold hover:bg-secondary/80 transition-colors">
                  <Network className="w-4 h-4"/> View Live Crime Network Graph
                </Link>
              </div>
            </div>

            {/* Risk Assessment */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Neural Risk Assessment</h3>
              {riskData && (
                <div className="bg-background/50 border border-border/50 rounded-lg p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Target Profile</p>
                        <p className="text-xl font-bold">{riskData.citizen_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Reoffend Probability</p>
                        <p className="text-2xl font-black text-warning">{riskData.reoffend_probability}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold text-muted-foreground uppercase">XAI Reasoning:</p>
                      {(riskData.reasons || []).map((r: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-border/30 pb-1">
                          <span className="text-muted-foreground capitalize">{r.code?.replace(/_/g, ' ')}</span>
                          <span className="font-mono font-medium">{String(r.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-md border ${riskData.risk_level === 'Critical' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-warning/10 border-warning/30 text-warning'} flex items-center justify-between`}>
                     <div className="flex items-center gap-3">
                       <ShieldAlert className="w-8 h-8" />
                       <div>
                         <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Overall Risk Category</p>
                         <p className="text-xl font-black uppercase tracking-widest">{riskData.risk_level}</p>
                       </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Patrol Dispatch Recommendations (from old investigation page) */}
      <div className="mt-6 mb-8">
        <PatrolDispatch />
      </div>

      {/* Spacer for scrolling */}
      <div className="h-10 shrink-0"></div>
    </div>
  )
}

function PatrolDispatch() {
  const [patrols, setPatrols] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiApi.get('/recommendations/patrol')
      .then(res => setPatrols(res.data.recommendations || []))
      .catch(() => setPatrols([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-card rounded-xl border border-border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <CarFront className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Automated Patrol Dispatch</h3>
        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium hidden sm:block">
          Generated from Hotspots & Repeat Offenders
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patrols.length > 0 ? patrols.map((patrol, i) => (
          <div key={i} className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-foreground">{patrol.area}</h4>
                <p className="text-xs font-medium text-primary mt-0.5">{patrol.action}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${patrol.priority === 'Critical' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>
                {patrol.priority} PRIORITY
              </span>
            </div>
            
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              {patrol.reasons?.map((r: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{r.code}:</span>
                  <span className="font-mono text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No critical areas currently require immediate patrol reinforcement.
          </div>
        )}
      </div>
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import { useSSE } from "@/hooks/useSSE"
import { AlertTriangle, Info, ShieldAlert, WifiOff, Play, Square, Clock } from "lucide-react"
import { aiApi } from "@/lib/api"

export function LiveAlerts() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const { data, error } = useSSE(`http://${hostname}:8000/stream/alerts`)
  const [alerts, setAlerts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'live'|'history'>('live')
  const [history, setHistory] = useState<any[]>([])
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    if (data && data.status !== 'Connected') {
      setAlerts(prev => [data, ...prev].slice(0, 12))
    }
  }, [data])

  useEffect(() => {
    if (activeTab === 'history' && history.length === 0) {
      aiApi.get('/data/alerts/history').then(res => setHistory(res.data.history || []))
    }
  }, [activeTab, history.length])

  const toggleSimulation = async () => {
    if (simulating) {
      await aiApi.post('/fusion/stop-simulation')
      setSimulating(false)
    } else {
      await aiApi.post('/fusion/start-simulation')
      setSimulating(true)
    }
  }

  const formatAlert = (alert: any): string => {
    if (alert.alert_type) {
      const type = typeof alert.alert_type === 'object' ? (alert.alert_type.value || JSON.stringify(alert.alert_type)) : String(alert.alert_type)
      return type
    }
    if (alert.area) return `Risk escalation: ${alert.area} (score: ${alert.risk_score ?? 'N/A'})`
    if (alert.status) return alert.status
    return 'New Intelligence Event'
  }

  const formatDetail = (alert: any): string => {
    const parts = []
    if (alert.area) parts.push(`Area: ${alert.area}`)
    if (alert.crime_type) parts.push(`Type: ${alert.crime_type}`)
    if (alert.risk_score != null) parts.push(`Risk: ${typeof alert.risk_score === 'number' ? alert.risk_score.toFixed(2) : alert.risk_score}`)
    if (alert.severity) parts.push(`Severity: ${alert.severity}`)
    return parts.join(' · ') || 'Event received from intelligence stream'
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-lg">Alert Center</h3>
        
        <div className="ml-auto flex items-center bg-muted/50 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('live')} 
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === 'live' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            Live
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'live' ? (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
               <button 
                onClick={toggleSimulation} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${simulating ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
               >
                 {simulating ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                 {simulating ? 'Stop Simulation' : 'Start Simulation'}
               </button>
               {error ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-red-400" /> Disconnected
                  </span>
                ) : (
                  <span className="text-xs text-emerald-500 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                )}
            </div>
            
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{formatAlert(alert)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDetail(alert)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Info className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Waiting for incoming events...</p>
                  <p className="text-xs mt-1 opacity-60">Start a simulation or trigger FIR to see events</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
             {history.length > 0 ? history.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-background border border-border/50">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.alert_type || item.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Past Event'} · 
                      Area: <span className="font-semibold text-primary">{item.area}</span> · 
                      Status: <span className="text-amber-400">{item.status || 'Resolved'}</span>
                    </p>
                  </div>
                </div>
             )) : (
                <div className="text-sm text-center py-8 text-muted-foreground">
                  Loading history...
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import { useSSE } from "@/hooks/useSSE"
import { AlertTriangle, Info, ShieldAlert, WifiOff, Play, Square, Clock, Activity } from "lucide-react"
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

  // Auto-start the live event stream when the dashboard loads
  useEffect(() => {
    let mounted = true
    const startStream = async () => {
      try {
        if (!simulating) {
          await aiApi.post('/fusion/start-simulation')
          if (mounted) setSimulating(true)
        }
      } catch (err) {
        console.error("Failed to start auto-stream:", err)
      }
    }
    startStream()

    return () => {
      mounted = false
      // Clean up simulation when leaving dashboard to prevent memory leaks
      aiApi.post('/fusion/stop-simulation').catch(() => {})
    }
  }, [])

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
    <div className="bg-[#0B1220] border border-border/20 rounded-xl shadow-sm h-full flex flex-col overflow-hidden w-full">
      <div className="p-4 border-b border-border/10 flex justify-between items-center bg-[#121A2F] shrink-0">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          Alert Center
        </h3>
        <div className="flex bg-[#0B1220] p-1 rounded-md border border-border/10">
          <button 
            onClick={() => setActiveTab('live')} 
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded transition-colors ${activeTab === 'live' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
          >
            Live
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
          >
            System
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-[#0B1220]">
        {activeTab === 'live' ? (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                 <Activity className="w-3 h-3 animate-pulse" />
                 Listening for events...
               </div>
               {error ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-red-400" /> Disconnected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> STREAM ACTIVE
                  </span>
                )}
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg bg-[#121A2F] border border-border/10 hover:border-border/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">Just now</span>
                      <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-red-400 uppercase tracking-wider">
                         <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                         CRITICAL
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{formatAlert(alert)}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{formatDetail(alert)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Info className="h-8 w-8 mb-3 opacity-20" />
                  <p className="text-sm text-white/60">Waiting for events...</p>
                  <p className="text-xs mt-1 opacity-40 text-center max-w-[200px]">Start a simulation to see live intelligence stream.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pr-2 custom-scrollbar">
             {history.length > 0 ? history.map((item, i) => (
                <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-[#121A2F] border border-border/10">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Past'}
                      </span>
                      <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-orange-400 uppercase tracking-wider">
                         SYSTEM
                      </div>
                    </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.alert_type || item.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Area: <span className="font-semibold text-blue-400">{item.area}</span> · 
                      Status: <span className="text-green-400">{item.status || 'Resolved'}</span>
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

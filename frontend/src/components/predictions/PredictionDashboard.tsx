"use client"

import { useEffect, useState } from "react"
import { aiApi, graphApi } from "@/lib/api"
import { Loader2, TrendingUp, AlertOctagon, Activity, BarChart2, ShieldAlert, Navigation, Map } from "lucide-react"
import dynamic from 'next/dynamic'
import Link from 'next/link'

const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-[#0f172a]">
      <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-50" />
      <p className="text-sm">Initializing Geospatial Engine...</p>
    </div>
  )
})

function getRiskColor(level: string) {
  switch (level?.toLowerCase()) {
    case 'critical': return 'text-red-500'
    case 'high': return 'text-orange-400'
    case 'moderate': return 'text-amber-400'
    default: return 'text-emerald-400'
  }
}

function getRiskBarColor(level: string) {
  switch (level?.toLowerCase()) {
    case 'critical': return 'bg-red-500'
    case 'high': return 'bg-orange-400'
    case 'moderate': return 'bg-amber-400'
    default: return 'bg-emerald-400'
  }
}

export function PredictionDashboard() {
  const [hotspots, setHotspots] = useState<any[]>([])
  const [escalating, setEscalating] = useState<any[]>([])
  const [graphStats, setGraphStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      aiApi.get('/predictions/hotspots').catch(() => ({ data: { hotspots: [] } })),
      aiApi.get('/predictions/escalation').catch(() => ({ data: { escalating_areas: [] } })),
      graphApi.get('/graph/centrality').catch(() => ({ data: { degree: [], betweenness: [] } })),
    ]).then(([hotspotsRes, escalationRes, centralityRes]) => {
      const allHotspots = hotspotsRes.data.hotspots || []
      // Sort by risk_score descending and only show real data (not unknown)
      const sorted = allHotspots
        .filter((h: any) => !h.insufficient_data && h.risk_score != null)
        .sort((a: any, b: any) => b.risk_score - a.risk_score)
      setHotspots(sorted)
      setEscalating(escalationRes.data.escalating_areas || [])
      setGraphStats(centralityRes.data || { degree: [], betweenness: [] })
      setLoading(false)
    })
  }, [])

  const [activeTab, setActiveTab] = useState<'anomalies' | 'patrol'>('anomalies')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-xl border border-border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Map & Core Stats */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Mock Map Visualization */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm relative h-80 flex flex-col">
          <div className="p-4 border-b border-border/50 bg-background/50 flex items-center justify-between z-10 shrink-0">
            <Link href="/map" className="font-semibold text-lg flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group">
              <Map className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" /> 
              Live Area Map
              <span className="text-xs font-normal text-muted-foreground ml-2 opacity-0 group-hover:opacity-100 transition-opacity">View full screen &rarr;</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Stream</span>
            </div>
          </div>
          <div className="flex-1 relative z-0">
            <LiveMap hotspots={hotspots} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotspots Card */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <AlertOctagon className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-lg text-foreground">Critical Hotspots</h3>
              <span className="ml-auto text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                {hotspots.filter(h => h.risk_level === 'Critical').length} Critical
              </span>
            </div>
            <div className="space-y-3">
              {hotspots.length > 0 ? hotspots.slice(0, 6).map((spot, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{spot.area}</p>
                      <p className={`text-xs font-semibold ${getRiskColor(spot.risk_level)}`}>{spot.risk_level}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{spot.avg_predicted_incidents?.toFixed(1) ?? 0}</div>
                      <div className="text-[10px] uppercase text-muted-foreground">incidents/wk</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getRiskBarColor(spot.risk_level)}`}
                      style={{ width: `${Math.round((spot.risk_score ?? 0) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  No hotspot data. Ensure AI Service is running on port 8000.
                </div>
              )}
            </div>
          </div>

          {/* Escalation Card */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-lg text-foreground">Escalating Areas</h3>
              <span className="ml-auto text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">
                {escalating.length} Flagged
              </span>
            </div>
            <div className="space-y-3">
              {escalating.length > 0 ? escalating.slice(0, 6).map((area, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{area.area}</p>
                    <p className="text-xs text-muted-foreground">{area.status}</p>
                  </div>
                  <div className="text-right text-warning font-bold text-sm">
                    +{area.growth_rate_percentage?.toFixed(1) ?? 0}%
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  No escalating areas detected at this time.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graph Centrality Stats */}
        {graphStats && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Most Influential Suspects (Graph Centrality)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(graphStats.degree || []).slice(0, 6).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.node}</p>
                    <p className="text-xs text-muted-foreground">Centrality score: {(item.score * 100).toFixed(1)}%</p>
                  </div>
                  <div className="text-xs font-bold text-primary shrink-0">
                    {Math.round(item.score * 43)} links
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: TABS */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          {/* Tabs Header */}
          <div className="flex border-b border-border bg-background/50 shrink-0">
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'anomalies' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              onClick={() => setActiveTab('anomalies')}
            >
              Real-time Anomalies
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'patrol' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              onClick={() => setActiveTab('patrol')}
            >
              Patrol Analysis
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'anomalies' ? <AnomalyScanner /> : <PatrolAnalysis />}
          </div>
        </div>
      </div>

    </div>
  )
}

function PatrolAnalysis() {
  const [patrols, setPatrols] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiApi.get('/data/patrols')
      .then(res => setPatrols((res.data.patrols || []).slice(0, 5)))
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Patrol Routes</h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Area</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3 text-center">Officers</th>
              <th className="px-4 py-3 text-center">Days W/O Patrol</th>
              <th className="px-4 py-3 text-center">Incidents</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Hotspot Coverage</th>
            </tr>
          </thead>
          <tbody>
            {patrols.length > 0 ? patrols.map((p, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{p.area}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.date} • {p.time_start} - {p.time_end}</td>
                <td className="px-4 py-3 text-center">{p.officer_count}</td>
                <td className="px-4 py-3 text-center text-warning">{p.days_without_patrol}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.incidents_during_patrol > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                    {p.incidents_during_patrol}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.is_hotspot_area == 1 ? (
                    <span className="text-success font-medium text-xs">Covered</span>
                  ) : (
                    <span className="text-muted-foreground font-medium text-xs">Standard</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">No historical patrol data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnomalyScanner() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    area: 'Indiranagar',
    crime_type: 'Theft',
    hour: 23,
    day: 'Saturday',
    month: 12,
    is_festival_period: 1,
    is_night_crime: 1,
    is_weekend: 1
  })

  async function handleScan() {
    setLoading(true)
    try {
      const res = await aiApi.post('/predictions/emerging_threats', formData)
      setResult(res.data)
    } catch (e) {
      console.error(e)
      setResult({ error: "Failed to scan for anomalies." })
    }
    setLoading(false)
  }

  useEffect(() => {
    handleScan()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Emerging Threats</h3>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scan specific conditions to detect novel crime spikes or anomalies.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Area</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Crime Type</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                value={formData.crime_type}
                onChange={(e) => setFormData({...formData, crime_type: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hour (0-23)</label>
              <input 
                type="number" 
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                value={formData.hour}
                onChange={(e) => setFormData({...formData, hour: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Month (1-12)</label>
              <input 
                type="number" 
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.is_festival_period === 1} onChange={(e) => setFormData({...formData, is_festival_period: e.target.checked ? 1 : 0})} className="rounded bg-background border-border" />
              Festival Period
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.is_weekend === 1} onChange={(e) => setFormData({...formData, is_weekend: e.target.checked ? 1 : 0})} className="rounded bg-background border-border" />
              Weekend
            </label>
          </div>
          
          <button 
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            Scan for Anomalies
          </button>
        </div>
        
          <div className="bg-background rounded-lg border border-border p-4 min-h-[200px]">
            {result ? (
              result.error ? (
                <div className="text-destructive text-sm h-full flex items-center justify-center">{result.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-3 rounded-md flex items-start gap-3 ${result.is_anomaly ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
                    <div className={`mt-0.5 rounded-full p-1 ${result.is_anomaly ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${result.is_anomaly ? 'text-destructive' : 'text-success'}`}>
                        {result.is_anomaly ? 'Anomaly Detected!' : 'Normal Pattern'}
                      </h4>
                    <p className="text-sm text-foreground mt-1">
                      {result.is_anomaly ? result.alerts?.[0] : `No unusual spikes or novel patterns detected for ${result.area}.`}
                    </p>
                  </div>
                </div>
                
                {result.reasons && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Reasoning</p>
                    {result.reasons.map((r: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{r.code}:</span>
                        <span className="font-mono text-primary">{Array.isArray(r.value) ? r.value.join(', ') : r.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <Activity className="h-8 w-8 opacity-20" />
              <p className="text-sm">Awaiting scan parameters...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

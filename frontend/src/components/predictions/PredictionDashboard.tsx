"use client"

import { useEffect, useState } from "react"
import { aiApi, graphApi } from "@/lib/api"
import { Loader2, TrendingUp, AlertOctagon, Activity, BarChart2 } from "lucide-react"

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-xl border border-border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold text-lg text-foreground">Escalating Areas</h3>
            <span className="ml-auto text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
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
                <div className="text-right text-amber-400 font-bold text-sm">
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
  )
}

"use client"
import { useEffect, useState } from "react"
import { aiApi } from "@/lib/api"
import { TrendingUp, AlertTriangle } from "lucide-react"

export function EscalationsList() {
  const [escalating, setEscalating] = useState<any[]>([])

  useEffect(() => {
    aiApi.get('/predictions/escalation').then(res => {
      const data = res.data.escalating_areas || []
      // Sort by growth desc and take top 4
      const sorted = data.sort((a: any, b: any) => (b.growth_rate_percentage || 0) - (a.growth_rate_percentage || 0)).slice(0, 4)
      setEscalating(sorted)
    }).catch(err => console.error(err))
  }, [])

  // Provide realistic mock data if the API returns an empty array while we develop
  const mockData = [
    { area: "Koramangala", status: "Critical Spikes Detected", growth_rate_percentage: 87, risk_level: "Critical" },
    { area: "Indiranagar", status: "Rapid Escalation", growth_rate_percentage: 73, risk_level: "High" },
    { area: "Whitefield", status: "Moderate Increase", growth_rate_percentage: 62, risk_level: "Moderate" },
    { area: "HSR Layout", status: "Slight Trend Up", growth_rate_percentage: 58, risk_level: "Low" }
  ]

  const displayData = escalating.length > 0 ? escalating : mockData

  const getIconColor = (idx: number) => {
    if (idx === 0) return "text-red-500"
    if (idx === 1) return "text-orange-500"
    if (idx === 2) return "text-yellow-500"
    return "text-blue-500"
  }

  const getPercentageColor = (idx: number) => {
    if (idx === 0) return "text-red-400"
    if (idx === 1) return "text-orange-400"
    if (idx === 2) return "text-yellow-400"
    return "text-blue-400"
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-orange-400" />
        <h3 className="font-semibold text-white">Predicted Escalations</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-between gap-2 overflow-y-auto pr-2 custom-scrollbar">
        {displayData.map((area, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#121A2F] border border-border/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-4 w-4 ${getIconColor(idx)}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{area.area}</span>
                <span className="text-[10px] text-muted-foreground truncate w-32 md:w-48">{area.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
               <TrendingUp className={`h-3 w-3 ${getPercentageColor(idx)}`} />
               <span className={`text-sm font-bold ${getPercentageColor(idx)}`}>{area.growth_rate_percentage?.toFixed(0) || 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import { aiApi } from "@/lib/api"
import { TrendingUp, AlertTriangle } from "lucide-react"

export function EscalationsList() {
  const [escalating, setEscalating] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true;
    const fetchEscalations = () => {
      aiApi.get('/predictions/escalation').then(res => {
        if (!isMounted) return;
        const data = res.data.escalating_areas || []
        const sorted = data.sort((a: any, b: any) => (b.growth_rate_percentage || 0) - (a.growth_rate_percentage || 0)).slice(0, 4)
        setEscalating(sorted)
      }).catch(err => console.error(err))
    }

    fetchEscalations();
    const interval = setInterval(fetchEscalations, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    }
  }, [])

  const displayData = escalating

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
      
      <div className="flex-1 flex flex-col justify-between gap-1.5 overflow-hidden">
        {displayData.length === 0 && <p className="text-xs text-slate-500 py-6">No escalation estimates available.</p>}
        {displayData.map((area, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 py-1.5 rounded-lg bg-[#0f172a]/50 border border-slate-700/30 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${getIconColor(idx)}`} />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] leading-tight font-bold text-white truncate">{area.area}</span>
                <span className="text-[10px] text-muted-foreground truncate">{area.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
               <TrendingUp className={`h-3 w-3 ${getPercentageColor(idx)}`} />
               <span className={`text-[13px] font-bold ${getPercentageColor(idx)}`}>{area.growth_rate_percentage?.toFixed(0) || 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

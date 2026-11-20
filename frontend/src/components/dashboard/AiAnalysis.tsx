"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Radar } from "lucide-react"
import { aiApi } from "@/lib/api"

type Hotspot = { area: string; risk_score: number; risk_level?: string; reasons?: { code: string; value: string }[] }

export function AiAnalysis() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [error, setError] = useState(false)
  useEffect(() => {
    aiApi.get('/predictions/hotspots').then(res => setHotspots((res.data.hotspots || []).filter((h: Hotspot) => h.area && h.area !== 'Unknown').sort((a: Hotspot, b: Hotspot) => b.risk_score - a.risk_score).slice(0, 5))).catch(() => setError(true))
  }, [])

  return <div className="flex h-full flex-col">
    <div className="flex items-center justify-between border-b ksp-rule pb-3"><div className="flex items-center gap-2 text-sm font-semibold text-white"><Radar size={17} className="text-[#d0ad71]" /> Highest forecast scores</div><Link href="/predictions" aria-label="Open forecasts" className="text-slate-400 hover:text-white"><ArrowUpRight size={17} /></Link></div>
    <p className="py-3 text-xs leading-relaxed text-slate-500">Seven day estimate from the demonstration dataset. Review source records before acting.</p>
    <div className="flex-1 space-y-1 overflow-y-auto">
      {hotspots.map((spot, i) => <div key={spot.area} className="flex items-center gap-3 border-b ksp-rule py-3"><span className="w-5 text-xs tabular-nums text-slate-500">{String(i + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-200">{spot.area}</div><div className="mt-0.5 text-[11px] text-slate-500">{spot.risk_level || 'Forecast'}</div></div><div className="text-sm font-semibold tabular-nums text-[#d7b378]">{Math.round(spot.risk_score * 100)}%</div></div>)}
      {!hotspots.length && <p className="py-6 text-xs text-slate-500">{error ? 'Forecast service unavailable.' : 'No forecast data available.'}</p>}
    </div>
  </div>
}

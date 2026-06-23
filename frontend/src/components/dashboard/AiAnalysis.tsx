"use client"
import { useEffect, useState } from "react"
import { aiApi } from "@/lib/api"
import { Target, AlertTriangle, ShieldAlert } from "lucide-react"

export function AiAnalysis() {
  const [hotspots, setHotspots] = useState<any[]>([])

  useEffect(() => {
    aiApi.get('/predictions/hotspots').then(res => {
      const data = res.data.hotspots || []
      // filter out unknown, sort by risk desc, limit to 4
      const sorted = data.filter((h: any) => h.area !== 'Unknown').sort((a: any, b: any) => b.risk_score - a.risk_score).slice(0, 4)
      setHotspots(sorted)
    }).catch(err => console.error(err))
  }, [])

  return (
    <div className="h-full flex flex-col gap-4 min-h-0 w-full">
      <div className="flex items-center gap-2 px-1 shrink-0">
        <Target className="h-4 w-4 text-blue-400" />
        <h3 className="font-semibold text-white">AI Threat Analysis</h3>
      </div>
      
      {/* Risk Score Widget */}
      <div className="border border-border/10 rounded-lg bg-[#121A2F] p-4 flex gap-4 items-center relative overflow-hidden shrink-0">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
        
        <div className="flex-shrink-0 flex flex-col items-center justify-center h-20 w-20 rounded-full border-4 border-red-500/20 bg-red-500/10 relative">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="36" cy="36" r="34" stroke="currentColor" strokeWidth="4" fill="none" className="text-red-500/20" />
            <circle cx="36" cy="36" r="34" stroke="currentColor" strokeWidth="4" fill="none" className="text-red-500" strokeDasharray="213" strokeDashoffset="27.69" />
          </svg>
          <span className="text-2xl font-bold text-white z-10">87</span>
          <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest z-10">Risk</span>
        </div>
        
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5 mb-1">
             <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
             <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Threat Level</span>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
             Multiple escalating patterns detected across Central zones. Organized cybercrime syndicate highly active. Immediate preventive patrols recommended.
           </p>
        </div>
      </div>

      {/* Top Hotspots */}
      <div className="flex-1 border border-border/10 rounded-lg bg-[#121A2F] p-4 flex flex-col min-h-0">
         <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Top Crime Hotspots</h4>
         
         <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
           {hotspots.length > 0 ? hotspots.map((spot, i) => (
              <div key={i} className="flex justify-between items-center bg-[#0B1220] p-2.5 rounded-md border border-border/5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{spot.area}</span>
                  <span className="text-[10px] text-muted-foreground">Primary: <span className="text-white/70">{spot.primary_crime || 'General'}</span></span>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-sm font-bold ${spot.risk_level === 'Critical' ? 'text-red-400' : spot.risk_level === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {(spot.risk_score * 100).toFixed(0)}%
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Probability</span>
                </div>
              </div>
           )) : (
             <div className="text-xs text-muted-foreground text-center py-4">Loading hotspots...</div>
           )}
         </div>
      </div>
    </div>
  )
}

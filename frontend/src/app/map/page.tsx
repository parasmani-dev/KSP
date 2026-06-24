"use client"

import { useEffect, useState } from "react"
import { aiApi } from "@/lib/api"
import { Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'

const LiveMap = dynamic(() => import('@/components/predictions/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-[#0f172a]">
      <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-50" />
      <p className="text-sm">Initializing National Geospatial Engine...</p>
    </div>
  )
})

export default function MapPage() {
  const [hotspots, setHotspots] = useState<any[]>([])
  const [crimes, setCrimes] = useState<any[]>([])
  const [patrols, setPatrols] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>(['Critical', 'High', 'Moderate', 'Low'])
  const [isExpanded, setIsExpanded] = useState(true)
  const [initialTheme, setInitialTheme] = useState<'live' | 'forecast'>('live')

  const toggleFilter = (level: string) => {
    setActiveFilters(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

  const filteredHotspots = hotspots.filter(h => activeFilters.includes(h.risk_level))

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 4500)
      return () => clearTimeout(timer)
    }
  }, [isExpanded])

  useEffect(() => {
    let isMounted = true

    if (typeof window !== 'undefined' && window.location.search.includes('mode=forecast')) {
      setInitialTheme('forecast')
    }

    const fetchData = () => {
      Promise.all([
        aiApi.get('/predictions/hotspots'),
        aiApi.get('/data/map/crimes'),
        aiApi.get('/data/map/patrols')
      ])
        .then(([hotspotsRes, crimesRes, patrolsRes]) => {
          if (!isMounted) return
          // Handle Hotspots
          const allHotspots = hotspotsRes.data.hotspots || []
          const sorted = allHotspots
            .filter((h: any) => !h.insufficient_data && h.risk_score != null)
            .sort((a: any, b: any) => b.risk_score - a.risk_score)
          setHotspots(sorted)

          // Handle Crimes
          setCrimes(crimesRes.data.crimes || [])

          // Handle Patrols
          setPatrols(patrolsRes.data.patrols || [])
        })
        .catch(() => {
          if (!isMounted) return
          setHotspots([])
          setCrimes([])
          setPatrols([])
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }

    // Initial fetch
    fetchData()

    // Setup 10-second polling
    const intervalId = setInterval(fetchData, 10000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="p-0 h-[calc(100vh-4rem)] flex flex-col relative bg-[#0f172a]">
      {/* Overlay header for the map */}
      <div 
        className={`absolute top-6 left-8 z-10 bg-background/80 backdrop-blur-md border border-border rounded-xl shadow-lg transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? 'w-96 p-4 max-h-48' : 'w-48 p-3 max-h-14 cursor-pointer hover:bg-background/95'}`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center justify-between gap-3">
          <h1 className={`font-bold tracking-tight whitespace-nowrap transition-all duration-700 ${isExpanded ? 'text-2xl' : 'text-lg'}`}>Live Area Map</h1>
          {!isExpanded && (
             <span className="flex h-2 w-2 relative mr-2 shrink-0">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
             </span>
          )}
        </div>
        <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'opacity-100 mt-1' : 'opacity-0 mt-0 h-0 pointer-events-none'}`}>
          <p className="text-sm text-muted-foreground">
            Real-time national geospatial monitoring of AI-predicted crime hotspots and escalations.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="font-medium text-foreground whitespace-nowrap">LIVE STREAM</span>
            </div>
            <div className="text-muted-foreground font-medium whitespace-nowrap">
              {filteredHotspots.length} ACTIVE ZONES
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0 flex">
        <div className="flex-1 relative">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <LiveMap hotspots={filteredHotspots} crimes={crimes} patrols={patrols} theme={initialTheme} />
          )}

          {/* Map Legend / Index */}
          <div className="absolute bottom-6 left-8 z-10 bg-background/80 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg w-52">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Risk Level Index</h3>
            <div className="space-y-2">
              <div 
                className={`flex items-center gap-2.5 cursor-pointer transition-opacity ${activeFilters.includes('Critical') ? 'opacity-100 hover:opacity-90' : 'opacity-40 hover:opacity-70'}`}
                onClick={() => toggleFilter('Critical')}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]"></span>
                <span className="text-xs font-medium">Critical (&ge; 86%)</span>
              </div>
              <div 
                className={`flex items-center gap-2.5 cursor-pointer transition-opacity ${activeFilters.includes('High') ? 'opacity-100 hover:opacity-90' : 'opacity-40 hover:opacity-70'}`}
                onClick={() => toggleFilter('High')}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_#f97316]"></span>
                <span className="text-xs font-medium">High (61% - 85%)</span>
              </div>
              <div 
                className={`flex items-center gap-2.5 cursor-pointer transition-opacity ${activeFilters.includes('Moderate') ? 'opacity-100 hover:opacity-90' : 'opacity-40 hover:opacity-70'}`}
                onClick={() => toggleFilter('Moderate')}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_4px_#eab308]"></span>
                <span className="text-xs font-medium">Moderate (31% - 60%)</span>
              </div>
              <div 
                className={`flex items-center gap-2.5 cursor-pointer transition-opacity ${activeFilters.includes('Low') ? 'opacity-100 hover:opacity-90' : 'opacity-40 hover:opacity-70'}`}
                onClick={() => toggleFilter('Low')}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_3px_#22c55e]"></span>
                <span className="text-xs font-medium">Low (&le; 30%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

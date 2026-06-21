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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiApi.get('/predictions/hotspots')
      .then((res) => {
        const allHotspots = res.data.hotspots || []
        const sorted = allHotspots
          .filter((h: any) => !h.insufficient_data && h.risk_score != null)
          .sort((a: any, b: any) => b.risk_score - a.risk_score)
        setHotspots(sorted)
      })
      .catch(() => {
        setHotspots([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-0 h-[calc(100vh-4rem)] flex flex-col relative bg-[#0f172a]">
      {/* Overlay header for the map */}
      <div className="absolute top-6 left-8 z-10 bg-background/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold tracking-tight">Live Area Map</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time national geospatial monitoring of AI-predicted crime hotspots and escalations.
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="font-medium text-foreground">LIVE STREAM</span>
          </div>
          <div className="text-muted-foreground font-medium">
            {hotspots.length} ACTIVE ZONES
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <LiveMap hotspots={hotspots} />
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowUpRight, Database } from "lucide-react"
import { KpiCards } from "@/components/dashboard/KpiCards"
import { LiveAlerts } from "@/components/dashboard/LiveAlerts"
import { AiAnalysis } from "@/components/dashboard/AiAnalysis"
import { CrimeTrendChart, CrimeCategoryChart } from "@/components/dashboard/TrendCharts"
import { EscalationsList } from "@/components/dashboard/EscalationsList"
import { PatrolStatus } from "@/components/dashboard/PatrolStatus"
import { aiApi } from "@/lib/api"

const LiveMap = dynamic(() => import("@/components/predictions/LiveMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-slate-400">Loading map…</div>,
})

export default function DashboardPage() {
  const [crimes, setCrimes] = useState<any[]>([])
  const [patrols, setPatrols] = useState<any[]>([])
  const [cctvs, setCctvs] = useState<any[]>([])
  const [hotspots, setHotspots] = useState<any[]>([])

  useEffect(() => {
    let active = true
    const load = () => {
      aiApi.get('/data/map/crimes').then(r => { if (active) setCrimes(r.data.crimes || []) }).catch(() => {})
      aiApi.get('/data/map/patrols').then(r => { if (active) setPatrols(r.data.patrols || []) }).catch(() => {})
      aiApi.get('/data/map/cctv').then(r => { if (active) setCctvs(r.data.cctv || []) }).catch(() => {})
      aiApi.get('/predictions/hotspots').then(r => { if (active) setHotspots(r.data.hotspots || []) }).catch(() => {})
    }
    load()
    const timer = setInterval(load, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  return <div className="ksp-page mx-auto max-w-[1800px] space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4 border-b ksp-rule pb-6">
      <div><div className="ksp-eyebrow mb-2 flex items-center gap-2"><Database size={13} /> KSP / synthetic multi-city test corpus</div><h1 className="ksp-heading">Command overview</h1><p className="ksp-subheading mt-2">Explore fictional case activity, geographic patterns, and research scenarios.</p></div>
      <Link href="/predictions" className="ksp-action">Review forecasts <ArrowUpRight size={15} /></Link>
    </section>
    <KpiCards />
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="h-[440px] xl:col-span-3"><LiveAlerts /></div>
      <div className="ksp-panel h-[440px] overflow-hidden xl:col-span-6 flex flex-col"><div className="flex items-center justify-between border-b ksp-rule px-4 py-3"><h2 className="ksp-panel-heading">Geospatial overview</h2><Link href="/map" className="text-xs text-[#d0ad71] hover:text-white">Open full map ↗</Link></div><div className="min-h-0 flex-1"><LiveMap hotspots={hotspots} crimes={crimes} patrols={patrols} cctvs={cctvs} hideOverlay /></div></div>
      <div className="ksp-panel h-[440px] overflow-y-auto p-4 xl:col-span-3"><AiAnalysis /></div>
    </section>
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="ksp-panel h-[290px] p-4"><CrimeTrendChart /></div>
      <div className="ksp-panel h-[290px] p-4"><CrimeCategoryChart /></div>
      <div className="ksp-panel h-[290px] p-4"><EscalationsList /></div>
      <div className="ksp-panel h-[290px] p-4"><PatrolStatus /></div>
    </section>
  </div>
}

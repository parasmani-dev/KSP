"use client"
import { useState, useEffect } from "react";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LiveAlerts } from "@/components/dashboard/LiveAlerts";
import { AiAnalysis } from "@/components/dashboard/AiAnalysis";
import { CrimeTrendChart, CrimeCategoryChart } from "@/components/dashboard/TrendCharts";
import { EscalationsList } from "@/components/dashboard/EscalationsList";
import { PatrolStatus } from "@/components/dashboard/PatrolStatus";
import dynamic from 'next/dynamic';
import { ShieldAlert, Users, Activity, Server, Target } from "lucide-react";
import { aiApi } from "@/lib/api";

// The LiveMap will be extracted or used from prediction dashboard, for now we will dynamically load it or a placeholder
const LiveMap = dynamic(() => import('@/components/predictions/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-[#0B1220] rounded-xl border border-border/20">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-sm">Initializing Geospatial Engine...</p>
    </div>
  )
})

export default function DashboardPage() {
  const [crimes, setCrimes] = useState<any[]>([]);
  const [patrols, setPatrols] = useState<any[]>([]);
  const [cctvs, setCctvs] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    aiApi.get('/data/map/crimes').then(res => setCrimes(res.data.crimes || [])).catch(() => {});
    aiApi.get('/data/map/patrols').then(res => setPatrols(res.data.patrols || [])).catch(() => {});
    aiApi.get('/data/map/cctv').then(res => setCctvs(res.data.cctv || [])).catch(() => {});
    aiApi.get('/predictions/hotspots').then(res => setHotspots(res.data.hotspots || [])).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* SECTION A: Top Row - KPI Cards */}
      <section>
        <KpiCards />
      </section>

      {/* SECTION B: Middle Row - Alert Center, Live Map, AI Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
        {/* Left: Alert Center (25%) */}
        <div className="lg:col-span-1 flex flex-col overflow-hidden h-full min-h-0">
           <LiveAlerts />
        </div>

        {/* Center: Live Crime Map (50%) */}
        <div className="lg:col-span-2 bg-[#0B1220] border border-border/20 rounded-xl overflow-hidden shadow-sm relative h-full min-h-0">
          <div className="absolute inset-0 z-0">
            <LiveMap 
              hotspots={hotspots}
              crimes={crimes}
              patrols={patrols}
              cctvs={cctvs}
            />
          </div>
        </div>

        {/* Right: AI Analysis (25%) */}
        <div className="lg:col-span-1 bg-[#0B1220] border border-border/20 rounded-xl shadow-sm p-4 h-full min-h-0 flex flex-col">
           <AiAnalysis />
        </div>
      </section>

      {/* SECTION C: Bottom Row - Analytics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[300px]">
        {/* Crime Trend */}
        <div className="bg-[#0B1220] border border-border/20 rounded-xl p-4 shadow-sm xl:col-span-1">
           <CrimeTrendChart />
        </div>
        {/* Crime By Category */}
        <div className="bg-[#0B1220] border border-border/20 rounded-xl p-4 shadow-sm xl:col-span-1">
           <CrimeCategoryChart />
        </div>
        {/* Predicted Escalations */}
        <div className="bg-[#0B1220] border border-border/20 rounded-xl p-4 shadow-sm xl:col-span-1">
           <EscalationsList />
        </div>
        {/* Patrol Status */}
        <div className="bg-[#0B1220] border border-border/20 rounded-xl p-4 shadow-sm xl:col-span-1">
           <PatrolStatus />
        </div>
      </section>
    </div>
  );
}

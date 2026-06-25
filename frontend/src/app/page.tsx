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
    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      <p className="text-sm font-semibold tracking-wide">Initializing Geospatial Engine...</p>
    </div>
  )
})

export default function DashboardPage() {
  const [crimes, setCrimes] = useState<any[]>([]);
  const [patrols, setPatrols] = useState<any[]>([]);
  const [cctvs, setCctvs] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = () => {
      aiApi.get('/data/map/crimes').then(res => { if(isMounted) setCrimes(res.data.crimes || []) }).catch(() => {});
      aiApi.get('/data/map/patrols').then(res => { if(isMounted) setPatrols(res.data.patrols || []) }).catch(() => {});
      aiApi.get('/data/map/cctv').then(res => { if(isMounted) setCctvs(res.data.cctv || []) }).catch(() => {});
      aiApi.get('/predictions/hotspots').then(res => { if(isMounted) setHotspots(res.data.hotspots || []) }).catch(() => {});
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
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
        <div className="lg:col-span-2 bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20 relative h-full min-h-0 group">
          <div className="absolute inset-0 z-0">
            <LiveMap 
              hotspots={hotspots}
              crimes={crimes}
              patrols={patrols}
              cctvs={cctvs}
              showMaximize={true}
            />
          </div>
        </div>

        {/* Right: AI Analysis (25%) */}
        <div className="lg:col-span-1 bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl shadow-black/20 p-4 h-full min-h-0 flex flex-col relative overflow-y-auto group custom-scrollbar">
           <AiAnalysis />
        </div>
      </section>

      {/* SECTION C: Bottom Row - Analytics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[300px]">
        {/* Crime Trend */}
        <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl shadow-black/20 xl:col-span-1 relative overflow-y-auto custom-scrollbar group">
           <CrimeTrendChart />
        </div>
        {/* Crime By Category */}
        <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl shadow-black/20 xl:col-span-1 relative overflow-y-auto custom-scrollbar group">
           <CrimeCategoryChart />
        </div>
        {/* Predicted Escalations */}
        <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl shadow-black/20 xl:col-span-1 relative overflow-y-auto custom-scrollbar group">
           <EscalationsList />
        </div>
        {/* Patrol Status */}
        <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl shadow-black/20 xl:col-span-1 relative overflow-y-auto custom-scrollbar group">
           <PatrolStatus />
        </div>
      </section>
    </div>
  );
}

"use client";
import { ShieldAlert, MapPin, Activity, Server, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { aiApi } from "@/lib/api";

export function KpiCards() {
  const [data, setData] = useState<null | {
    total_incidents: number; active_cases: number; solved_cases: number; cities_represented: number; clearance_rate: number;
  }>(null);

  useEffect(() => {
    aiApi.get("/data/dashboard/kpis")
      .then(res => { if (typeof res.data.total_incidents === 'number') setData(res.data) })
      .catch(err => console.error("Error fetching KPIs:", err));
  }, []);

  const stats = [
    { label: "Total incidents", value: data?.total_incidents.toLocaleString() ?? '—', icon: Activity },
    { label: "Under investigation", value: data?.active_cases.toLocaleString() ?? '—', icon: ShieldAlert },
    { label: "Closed cases", value: data?.solved_cases.toLocaleString() ?? '—', icon: Target },
    { label: "Cities in sample", value: data?.cities_represented.toLocaleString() ?? '—', icon: MapPin },
    { label: "Closure rate", value: data ? `${data.clearance_rate}%` : '—', icon: Server },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="ksp-panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-[0.12em]">{s.label}</p>
              <h3 className="text-3xl font-semibold tracking-tight text-[#f5f2eb] tabular-nums">{s.value}</h3>
            </div>
            <div className="p-2 rounded border border-[#5b4935] bg-[#2e2924]">
              <s.icon className="w-4 h-4 text-[#d0ad71]" />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">{data ? 'Synthetic dataset' : 'Data unavailable'}</p>
        </div>
      ))}
    </div>
  );
}

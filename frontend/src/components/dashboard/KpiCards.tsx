"use client";
import { ShieldAlert, Users, Activity, Server, Target } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export function KpiCards() {
  const [data, setData] = useState({
    total_incidents: 0,
    active_cases: 0,
    solved_cases: 0,
    arrests: 0,
    clearance_rate: 0
  });

  useEffect(() => {
    axios.get("http://localhost:8000/data/dashboard/kpis")
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching KPIs:", err));
  }, []);

  const stats = [
    { label: "Total Incidents", value: data.total_incidents.toLocaleString(), change: "+12%", trend: "up", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active Cases", value: data.active_cases.toLocaleString(), change: "-4%", trend: "down", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Solved Cases", value: data.solved_cases.toLocaleString(), change: "+8%", trend: "up", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Arrests Made", value: data.arrests.toLocaleString(), change: "+15%", trend: "up", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Clearance Rate", value: `${data.clearance_rate}%`, change: "+2.1%", trend: "up", icon: Server, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((s, i) => (
        <div key={i} className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] -z-10 opacity-50 group-hover:opacity-100 transition-opacity ${s.bg.replace('/10', '/20')}`} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{s.label}</p>
              <h3 className="text-2xl font-bold tracking-tight text-white">{s.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${s.bg} border ${s.border}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className={`font-semibold ${s.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {s.change}
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      ))}
    </div>
  );
}

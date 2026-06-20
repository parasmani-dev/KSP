"use client"
import { LiveAlerts } from "@/components/dashboard/LiveAlerts";
import { PredictionDashboard } from "@/components/predictions/PredictionDashboard";
import { useEffect, useState } from "react";
import { aiApi, graphApi } from "@/lib/api";
import { ShieldAlert, Users, Activity, Server } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    criticalHotspots: '-',
    monitored: '-',
    aiStatus: 'checking',
    graphStatus: 'checking',
  });

  useEffect(() => {
    // Check AI service
    aiApi.get('/predictions/hotspots').then(res => {
      const hotspots = res.data.hotspots || [];
      const critical = hotspots.filter((h: any) => h.risk_level === 'Critical').length;
      setStats(prev => ({ ...prev, criticalHotspots: String(critical), aiStatus: 'online' }));
    }).catch(() => setStats(prev => ({ ...prev, aiStatus: 'offline' })));

    // Check Graph service
    graphApi.get('/graph/network').then(res => {
      const nodes = res.data.network?.nodes || [];
      const citizens = nodes.filter((n: any) => n.type === 'Citizen' || !n.type).length;
      setStats(prev => ({ ...prev, monitored: String(citizens), graphStatus: 'online' }));
    }).catch(() => setStats(prev => ({ ...prev, graphStatus: 'offline' })));
  }, []);

  const allOnline = stats.aiStatus === 'online' && stats.graphStatus === 'online';

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Live crime intelligence, predictive alerts, and system health.
        </p>
      </div>

      {/* Live stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-destructive/10">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Critical Hotspots</p>
            <div className="text-2xl font-bold text-destructive">{stats.criticalHotspots}</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monitored Citizens</p>
            <div className="text-2xl font-bold">{stats.monitored}</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className={`p-2.5 rounded-lg ${stats.aiStatus === 'online' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <Activity className={`h-5 w-5 ${stats.aiStatus === 'online' ? 'text-emerald-500' : 'text-red-400'}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">AI Service (8000)</p>
            <div className={`text-sm font-bold capitalize ${stats.aiStatus === 'online' ? 'text-emerald-500' : stats.aiStatus === 'offline' ? 'text-red-400' : 'text-muted-foreground'}`}>
              {stats.aiStatus === 'checking' ? 'Checking...' : stats.aiStatus}
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className={`p-2.5 rounded-lg ${stats.graphStatus === 'online' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <Server className={`h-5 w-5 ${stats.graphStatus === 'online' ? 'text-emerald-500' : 'text-red-400'}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Graph Service (8001)</p>
            <div className={`text-sm font-bold capitalize ${stats.graphStatus === 'online' ? 'text-emerald-500' : stats.graphStatus === 'offline' ? 'text-red-400' : 'text-muted-foreground'}`}>
              {stats.graphStatus === 'checking' ? 'Checking...' : stats.graphStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Live stream + predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 480 }}>
        <div className="lg:col-span-1 h-full">
          <LiveAlerts />
        </div>
        <div className="lg:col-span-2 overflow-y-auto">
          <PredictionDashboard />
        </div>
      </div>
    </div>
  );
}

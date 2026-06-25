import React from 'react';
import Link from 'next/link';
import { Network, Activity, TrendingUp, MapPin, Phone, CreditCard, ChevronRight, Share2, Eye, Users, Target } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export function RelationshipNetwork({ result, searchName }: { result: any, searchName: string }) {
  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 h-full min-h-[350px] flex flex-col justify-center items-center text-center relative overflow-hidden group">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
         <svg width="200%" height="200%" className="animate-[spin_60s_linear_infinite] opacity-30">
           <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 12" />
           <circle cx="50%" cy="50%" r="30%" fill="transparent" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 20" />
         </svg>
      </div>
      
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        <Network className="w-8 h-8 text-blue-500" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 z-10">Explore Crime Network</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-8 z-10 leading-relaxed">
        Launch the interactive graph visualizer to uncover hidden connections, known associates, and linked cases for <strong className="text-slate-200 capitalize">{searchName || 'this citizen'}</strong>.
      </p>
      
      <Link href={`/network?search=${encodeURIComponent(searchName || '')}`} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 z-10">
        Analyze Network <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function LinkedCasesWidget({ result }: { result: any }) {
  const allNodes = result?.graph_nodes || [];
  const linkedIds = result?.linked_node_ids || [];
  
  // Find cases connected to this citizen
  const cases = allNodes.filter((n: any) => linkedIds.includes(n.id) && n.type === 'Case');

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl shadow-black/20 h-full flex flex-col min-h-[350px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors" />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm">Linked Case Files</span>
        </div>
        <span className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1">{cases.length} Cases</span>
      </div>

      <div className="flex-1 relative space-y-3 overflow-y-auto pr-2">
         {cases.length === 0 ? (
           <div className="text-sm text-slate-500 italic flex items-center justify-center h-full">No linked cases found.</div>
         ) : (
           cases.map((c: any, i: number) => (
             <div key={i} className="bg-slate-800/30 border border-slate-700/50 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <div className="text-xs font-bold text-slate-200">{c.id}</div>
                 <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                   {c.crime_type || 'Unknown Type'}
                 </div>
               </div>
               <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-2">
                 <MapPin className="w-3 h-3 text-slate-500" /> {c.area || 'Unknown Area'}
               </div>
               {c.investigating_officer && (
                 <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
                   <Users className="w-3 h-3 text-slate-500" /> IO: {c.investigating_officer}
                 </div>
               )}
             </div>
           ))
         )}
      </div>
    </div>
  );
}

export function ThreatProfilerWidget({ result }: { result: any }) {
  const allNodes = result?.graph_nodes || [];
  const linkedIds = result?.linked_node_ids || [];
  
  // 1. Violence Potential
  const cases = allNodes.filter((n: any) => linkedIds.includes(n.id) && n.type === 'Case');
  const violentKeywords = ['assault', 'murder', 'arms', 'weapon', 'homicide', 'riot', 'kidnap'];
  const violentCases = cases.filter((c: any) => violentKeywords.some(k => String(c.crime_type).toLowerCase().includes(k)));
  const violenceScore = Math.min(100, (violentCases.length / Math.max(1, cases.length)) * 100 + (violentCases.length * 20));

  // 2. Flight Risk (based on distinct areas)
  const locations = allNodes.filter((n: any) => linkedIds.includes(n.id) && n.type === 'Location');
  const flightScore = Math.min(100, locations.length * 25);

  // 3. Syndicate Link
  const orgs = allNodes.filter((n: any) => linkedIds.includes(n.id) && n.type === 'Organization');
  const suspects = allNodes.filter((n: any) => linkedIds.includes(n.id) && (n.type === 'Suspect' || n.type === 'Citizen'));
  const syndicateScore = Math.min(100, (orgs.length * 40) + (suspects.length * 15));

  // 4. Network Influence
  const influenceScore = Math.min(100, linkedIds.length * 10);

  // 5. Recidivism Risk
  const recidivismScore = result?.reoffend_probability || 0;

  // Compile data for Radar Chart
  const data = [
    { subject: 'Violence', A: Math.max(10, violenceScore), fullMark: 100 },
    { subject: 'Flight Risk', A: Math.max(10, flightScore), fullMark: 100 },
    { subject: 'Syndicate', A: Math.max(10, syndicateScore), fullMark: 100 },
    { subject: 'Influence', A: Math.max(10, influenceScore), fullMark: 100 },
    { subject: 'Recidivism', A: Math.max(10, recidivismScore), fullMark: 100 },
  ];

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl shadow-black/20 h-full flex flex-col min-h-[350px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors" />
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm">Threat Profiler Matrix</span>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#ef4444' }}
              formatter={(value) => [`${Math.round(value as number)}%`, 'Risk Level']}
            />
            <Radar name="Threat Profile" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

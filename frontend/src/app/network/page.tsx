"use client"

import React, { useState } from 'react';
import { 
  Network, Maximize, Search, ChevronDown, 
  MapPin, User, FileText, CarFront, Building2, Eye, ShieldAlert,
  ArrowLeft, ArrowRight, Minus, Plus, Layers, Target, Clock, AlertTriangle
} from 'lucide-react';

import CrimeNetworkGraphClient from "@/components/graph/CrimeNetworkGraphClient";
export default function CrimeNetworkPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0 });

  return (
    <div className="p-6 h-full flex flex-col bg-[#020817] text-slate-200 overflow-y-auto overflow-x-hidden min-h-screen custom-scrollbar">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-white">
            <Network className="w-7 h-7 text-blue-500" /> Crime Network Discovery
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Interactive graph visualization of entities, crimes, and hidden connections.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-col gap-6">
        
         {/* TOP ROW: GRAPH & DETAILS PANEL */}
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[650px]">
            
            {/* GRAPH CANVAS (col-span-3) */}
            <div className="xl:col-span-3 bg-[#0B1220] rounded-xl border border-slate-800 relative overflow-hidden flex flex-col shadow-lg">
               
               {/* Background Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
               </div>

               {/* Top Controls Overlay */}
               <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10 pointer-events-none">
                 {/* Search */}
                 <div className="w-80 bg-[#0B1220]/90 backdrop-blur-sm border border-slate-800/80 rounded-lg flex items-center px-3 py-2.5 pointer-events-auto">
                   <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0"/>
                   <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search entity, case, or location..." className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-500 w-full" />
                 </div>
                 

               </div>

               {/* Left Controls Overlay */}
               <div className="absolute top-24 left-5 bottom-5 flex flex-col justify-between z-10 pointer-events-none w-52">
                 {/* Entity Types Legend */}
                 <div className="bg-[#0B1220]/90 backdrop-blur-sm border border-slate-800/80 rounded-xl p-4 pointer-events-auto">
                   <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Entity Types</p>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>
                         <span className="text-xs text-slate-200 font-medium">Citizen</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1e293b" stroke="#f97316" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
                         <span className="text-xs text-slate-200 font-medium">Case</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1e293b" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round"><polygon points="12,2 22,12 12,22 2,12"/></svg>
                         <span className="text-xs text-slate-200 font-medium">Location</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1e293b" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round"><polygon points="12,3 22,21 2,21"/></svg>
                         <span className="text-xs text-slate-200 font-medium">Vehicle</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round"><polygon points="12,2 22,7.5 22,16.5 12,22 2,16.5 2,7.5"/></svg>
                         <span className="text-xs text-slate-200 font-medium">Organization</span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Network Statistics */}
                 <div className="bg-[#0B1220]/90 backdrop-blur-sm border border-slate-800/80 rounded-xl p-4 pointer-events-auto">
                   <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Network Statistics</p>
                   <div className="flex flex-col gap-2.5">
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Total Nodes</span>
                        <span className="text-xs font-bold text-white">{graphStats.nodes > 0 ? graphStats.nodes : 124}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Total Connections</span>
                        <span className="text-xs font-bold text-white">{graphStats.edges > 0 ? graphStats.edges : 287}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Clusters</span>
                        <span className="text-xs font-bold text-white">7</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Density</span>
                        <span className="text-xs font-bold text-white">0.38</span>
                     </div>
                   </div>
                   <button onClick={() => setIsAnalyzing(true)} className="w-full mt-5 bg-[#1e3a8a]/60 hover:bg-[#1e3a8a] text-blue-400 border border-blue-900/50 text-[11px] font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors">
                     <Network className="w-3.5 h-3.5" /> {isAnalyzing ? 'Analysis Active' : 'Analyze Network'}
                   </button>
                 </div>
               </div>





               {/* ========================================= */}
               {/* THE GRAPH CANVAS (SVG Rendering) */}
               {/* ========================================= */}
               <div className="absolute inset-0 z-0 overflow-hidden">
                 <CrimeNetworkGraphClient 
                   searchQuery={searchQuery}
                   onNodeSelected={setSelectedNode}
                   onStatsLoaded={setGraphStats}
                 />
               </div>
            </div>

            {/* DETAILS PANEL (col-span-1) */}
            {isAnalyzing ? (
              <div className="xl:col-span-1 bg-[#0f172a] rounded-xl border border-slate-800 p-5 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-lg">
               
               {/* Header */}
               <div className="flex items-center justify-between mb-5">
                 <button onClick={() => setIsAnalyzing(false)} className="flex items-center gap-1.5 text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors">
                   <ArrowLeft className="w-3.5 h-3.5"/> Back to Network
                 </button>
                 <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">{selectedNode?.type || 'Entity'}</span>
               </div>

               {/* Profile Info */}
               <div className="flex items-start gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                   <User className="w-6 h-6" />
                 </div>
                 <div className="flex flex-col flex-1">
                   <h2 className="text-xl font-bold text-white leading-none mb-1.5">{selectedNode?.name || selectedNode?.id || 'Unknown Entity'}</h2>
                   <p className="text-xs text-slate-400 font-medium">Selected Node</p>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">{selectedNode?.risk_score || '0'} Risk</span>
                 </div>
               </div>

               {/* Tabs */}
               <div className="flex items-center gap-4 border-b border-slate-800 mb-6">
                  <button className="text-xs font-bold text-blue-400 border-b-2 border-blue-500 pb-2 px-1">Overview</button>
                  <button className="text-xs font-medium text-slate-400 hover:text-slate-200 pb-2 px-1 transition-colors">Connections (7)</button>
                  <button className="text-xs font-medium text-slate-400 hover:text-slate-200 pb-2 px-1 transition-colors">History</button>
                  <button className="text-xs font-medium text-slate-400 hover:text-slate-200 pb-2 px-1 transition-colors">AI Analysis</button>
               </div>

               {/* Metadata Grid */}
               <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8">
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><User className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Entity ID</span></div>
                     <span className="text-xs text-white">P-2024-1587</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><Clock className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Date of Birth</span></div>
                     <span className="text-xs text-white">14 Mar 1986 (38)</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><User className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Known Aliases</span></div>
                     <span className="text-xs text-white">Sunny, S. Patel, Sunil P.</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Primary Location</span></div>
                     <span className="text-xs text-white">Dharavi, Mumbai</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><Eye className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Last Seen</span></div>
                     <span className="text-xs text-white">18 May 2024, 22:14</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><AlertTriangle className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Status</span></div>
                     <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/> Under Investigation
                     </span>
                  </div>
               </div>

               {/* AI Risk Assessment Gauge */}
               <div className="mb-8">
                 <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">AI Risk Assessment</h3>
                 <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 shrink-0">
                       <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 100">
                          {/* Background Arc */}
                          <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                          {/* Foreground Arc (Orange for Moderate) */}
                          <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset={188.5 * (1 - 0.4827)} className="drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                         <span className="text-lg font-bold text-white leading-none">48.27%</span>
                         <span className="text-[9px] font-bold text-orange-400 mt-1">Moderate Risk</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Reoffend Probability</span>
                          <span className="text-white font-bold">53.28%</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Network Centrality</span>
                          <span className="text-white font-bold">0.72</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Escalation Risk</span>
                          <span className="text-orange-400 font-bold">Medium</span>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Top Connections List */}
               <div className="mt-auto">
                 <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">Top Connections</h3>
                 <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">1</div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Imran Qureshi</p>
                            <p className="text-[10px] text-blue-400">Associate</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 mb-0.5">Associate</p>
                          <p className="text-xs font-bold text-red-500">0.89</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">2</div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Lokesh Yadav</p>
                            <p className="text-[10px] text-blue-400">Associate</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 mb-0.5">Associate</p>
                          <p className="text-xs font-bold text-orange-500">0.76</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">3</div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Kurla Syndicate</p>
                            <p className="text-[10px] text-emerald-400">Organization</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 mb-0.5">Organization</p>
                          <p className="text-xs font-bold text-orange-400">0.68</p>
                       </div>
                    </div>
                 </div>
                 <button className="w-full mt-5 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors">
                    View All Connections <ArrowRight className="w-3 h-3" />
                 </button>
               </div>

            </div>
            ) : (
              <div className="xl:col-span-1 bg-[#0f172a]/40 rounded-xl border border-slate-800/40 p-5 flex flex-col items-center justify-center h-full text-center shadow-inner">
                 <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                   <Network className="w-8 h-8 text-slate-500" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-300 mb-2">Awaiting Analysis</h3>
                 <p className="text-sm text-slate-500 max-w-[200px]">Select a node or click "Analyze Network" to view detailed entity intelligence.</p>
              </div>
            )}
         </div>

         {/* BOTTOM ROW: ANALYTICS WIDGETS */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
             
             {/* CRIME TYPE DISTRIBUTION */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                 <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase mb-6">Crime Type Distribution</h3>
                 <div className="flex items-center justify-between flex-1">
                    <div className="relative w-36 h-36">
                       <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                         {(() => {
                           let cumulative = 0;
                           const colors = ["#4c1d95", "#f97316", "#a855f7", "#3b82f6", "#10b981"];
                           
                           const slices: any[] = [];
                           (graphStats?.crimeTypes || []).forEach((ct: any, i: number) => {
                             cumulative += (ct.percent / 100);
                             slices.unshift({
                               ...ct,
                               color: colors[i % colors.length],
                               cumulative: cumulative
                             });
                           });
                           
                           return slices.map((slice: any, i: number) => {
                             const strokeDashoffset = 219.9 * (1 - slice.cumulative);
                             return (
                               <circle key={i} cx="50" cy="50" r="35" fill="none" stroke={slice.color} strokeWidth="25" strokeDasharray="219.9" strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
                             );
                           });
                         })()}
                         <circle cx="50" cy="50" r="22" fill="#0f172a" />
                       </svg>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-[45%]">
                       {(graphStats?.crimeTypes || []).map((ct: any, i: number) => {
                          const colors = ["#4c1d95", "#f97316", "#a855f7", "#3b82f6", "#10b981"];
                          return (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full shrink-0`} style={{backgroundColor: colors[i % colors.length]}}/><span className="text-[11px] text-slate-300 truncate max-w-[80px]" title={ct.name}>{ct.name}</span></div>
                             <span className="text-xs font-bold text-white">{ct.percent}%</span>
                          </div>
                       )})}
                    </div>
                 </div>
              </div>

             {/* TOP CRIME AREAS */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase mb-5">Top Crime Areas</h3>
                <div className="flex flex-col gap-4">
                   {(graphStats?.areas || []).map((area: any, i: number) => {
                      const colors = ["#a855f7", "#f97316", "#ef4444", "#3b82f6", "#10b981"];
                      return (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0`} style={{backgroundColor: colors[i % colors.length]}} />
                            <span className="text-sm text-slate-300 truncate max-w-[150px]">{area.name}</span>
                         </div>
                         <span className="text-xs font-bold text-slate-400">{area.count} nodes</span>
                      </div>
                   )})}
                </div>
                <button className="w-full mt-auto bg-[#0B1220] hover:bg-slate-800 border border-slate-800 text-blue-400 text-xs font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors">
                   View All Areas <ArrowRight className="w-3.5 h-3.5" />
                </button>
             </div>

             {/* RISK SCORE DISTRIBUTION */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase">Risk Score Distribution</h3>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B1220] border border-slate-700 rounded text-[10px] font-medium text-slate-300 hover:text-white transition-colors">
                    Global Network <ChevronDown className="w-3 h-3"/>
                  </button>
                </div>
                
                {/* Line Chart SVG */}
                <div className="flex-1 relative w-full h-full pb-4">
                  
                  {/* Y-axis Labels */}
                  <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] text-slate-500 font-medium">
                     {(() => {
                        const maxRisk = Math.max(...(graphStats?.riskBins || [10]));
                        return (
                           <>
                              <span>{maxRisk}</span>
                              <span>{Math.round(maxRisk * 0.75)}</span>
                              <span>{Math.round(maxRisk * 0.5)}</span>
                              <span>{Math.round(maxRisk * 0.25)}</span>
                              <span>0</span>
                           </>
                        )
                     })()}
                  </div>

                  {/* Chart Area */}
                  <div className="absolute left-10 right-2 top-2 bottom-6 border-l border-b border-slate-800 relative">
                     {/* Horizontal Grid lines */}
                     <div className="absolute inset-x-0 top-0 border-t border-slate-800/50" />
                     <div className="absolute inset-x-0 top-1/4 border-t border-slate-800/50" />
                     <div className="absolute inset-x-0 top-2/4 border-t border-slate-800/50" />
                     <div className="absolute inset-x-0 top-3/4 border-t border-slate-800/50" />
                     
                     {/* Data Line Path */}
                     <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                       {/* Gradient fill under line */}
                       <defs>
                         <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                           <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                         </linearGradient>
                       </defs>
                       
                       {(() => {
                           const bins = graphStats?.riskBins || Array(10).fill(0);
                           const maxCount = Math.max(...bins, 1);
                           const points = bins.map((count: number, i: number) => ({
                               x: i * (420 / 9),
                               y: 100 - (count / maxCount) * 80
                           }));
                           
                           let d = `M ${points[0].x},${points[0].y}`;
                           for (let i = 0; i < points.length - 1; i++) {
                              const p1 = points[i];
                              const p2 = points[i+1];
                              const xc = (p1.x + p2.x) / 2;
                              const yc = (p1.y + p2.y) / 2;
                              if (i === 0) d += ` Q ${p1.x},${p1.y} ${xc},${yc}`;
                              else d += ` T ${xc},${yc}`;
                           }
                           d += ` T ${points[points.length-1].x},${points[points.length-1].y}`;

                           return (
                               <>
                                 <path d={`${d} L 420,100 L 0,100 Z`} fill="url(#lineGrad)" vectorEffect="non-scaling-stroke" className="transition-all duration-1000 ease-out" />
                                 <path d={d} fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" className="transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                                 
                                 {/* Data Points */}
                                 {points.map((p: any, i: number) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" className="transition-all duration-1000 ease-out hover:r-[5px] hover:fill-white hover:stroke-[#a855f7] hover:stroke-2 cursor-pointer" />
                                 ))}
                               </>
                           );
                       })()}
                     </svg>
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute left-10 right-2 bottom-0 h-6 flex justify-between items-end text-[9px] text-slate-500 font-medium px-2">
                     <span>0</span>
                     <span>20</span>
                     <span>40</span>
                     <span>60</span>
                     <span>80</span>
                     <span>100</span>
                  </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}

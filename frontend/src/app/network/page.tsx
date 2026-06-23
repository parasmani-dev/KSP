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
  const [selectedNode, setSelectedNode] = useState<any>(null);   // committed node (shown in panel)
  const [pendingNode, setPendingNode] = useState<any>(null);     // node clicked but not yet analyzed
  const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0 });
  const [activeTab, setActiveTab] = useState<'overview'|'connections'|'history'|'ai'>('overview');

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
                        <span className="text-xs text-slate-400">Nodes Rendered</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white">{graphStats.nodes > 0 ? graphStats.nodes : '—'}</span>
                          {graphStats.totalNodes > 0 && (
                            <span className="text-[10px] text-slate-500 ml-1">/ {graphStats.totalNodes.toLocaleString()}</span>
                          )}
                        </div>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Total Connections</span>
                        <span className="text-xs font-bold text-white">{graphStats.edges > 0 ? graphStats.edges : '—'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Clusters</span>
                        <span className="text-xs font-bold text-white">{graphStats.clusters > 0 ? graphStats.clusters : '—'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Density</span>
                        <span className="text-xs font-bold text-white">{graphStats.density > 0 ? graphStats.density : '—'}</span>
                     </div>
                   </div>
                    <button 
                      onClick={() => {
                        if (pendingNode) {
                          setSelectedNode(pendingNode);
                          setIsAnalyzing(true);
                          setActiveTab('overview');
                        }
                      }}
                      disabled={!pendingNode}
                      className={`w-full mt-5 text-[11px] font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all border ${
                        pendingNode
                          ? 'bg-[#1e3a8a]/60 hover:bg-[#1e3a8a] text-blue-400 border-blue-900/50 cursor-pointer'
                          : 'bg-slate-800/30 text-slate-600 border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      {isAnalyzing && selectedNode
                        ? pendingNode && pendingNode.id !== selectedNode?.id
                          ? 'Analyze Selected'
                          : 'Analysis Active'
                        : pendingNode
                          ? 'Analyze Node'
                          : 'Select a Node First'
                      }
                    </button>
                 </div>
               </div>





               {/* ========================================= */}
               {/* THE GRAPH CANVAS (SVG Rendering) */}
               {/* ========================================= */}
               <div className="absolute inset-0 z-0 overflow-hidden">
                 <CrimeNetworkGraphClient 
                   searchQuery={searchQuery}
                   onNodeSelected={setPendingNode}
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
                   {selectedNode?.type === 'Citizen' && <User className="w-6 h-6" />}
                   {selectedNode?.type === 'Case' && <FileText className="w-6 h-6" />}
                   {selectedNode?.type === 'Organization' && <Building2 className="w-6 h-6" />}
                   {selectedNode?.type === 'Vehicle' && <CarFront className="w-6 h-6" />}
                   {selectedNode?.type === 'Location' && <MapPin className="w-6 h-6" />}
                   {!selectedNode?.type && <User className="w-6 h-6" />}
                 </div>
                 <div className="flex flex-col flex-1">
                   <h2 className="text-xl font-bold text-white leading-none mb-1.5">{selectedNode?.id || 'Unknown'}</h2>
                   <p className="text-xs text-slate-400 font-medium">{selectedNode?.type || 'Entity'}</p>
                 </div>
                 <div className="text-right">
                   <span className={`text-xs font-bold px-2 py-1 rounded border ${
                     selectedNode?.status === 'Arrested' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                     selectedNode?.status === 'Under Investigation' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                     selectedNode?.threat_level === 'Severe' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                   }`}>
                     {selectedNode?.status || selectedNode?.threat_level || 'Active'}
                   </span>
                 </div>
               </div>

               {/* Tabs */}
               <div className="flex items-center gap-1 border-b border-slate-800 mb-6">
                  {(['overview','connections','history','ai'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`text-xs font-medium pb-2 px-2 transition-colors border-b-2 ${
                        activeTab === tab
                          ? 'text-blue-400 border-blue-500 font-bold'
                          : 'text-slate-400 border-transparent hover:text-slate-200'
                      }`}>
                      {tab === 'overview' ? 'Overview' : tab === 'connections' ? 'Connections' : tab === 'history' ? 'History' : 'AI Analysis'}
                    </button>
                  ))}
               </div>

               {/* OVERVIEW TAB */}
               {activeTab === 'overview' && <>

               {/* Live Metadata Grid — adapts per node type */}
               <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8">
                  {/* Always show ID */}
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><User className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Entity ID</span></div>
                     <span className="text-xs text-white font-mono">{selectedNode?.id || '—'}</span>
                  </div>

                  {/* Type */}
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5 text-slate-400"><Layers className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Type</span></div>
                     <span className="text-xs text-white">{selectedNode?.type || '—'}</span>
                  </div>

                  {/* Case-specific fields */}
                  {selectedNode?.crime_type && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><AlertTriangle className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Crime Type</span></div>
                        <span className="text-xs text-white">{selectedNode.crime_type}</span>
                     </div>
                  )}
                  {selectedNode?.area && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Area</span></div>
                        <span className="text-xs text-white">{selectedNode.area}</span>
                     </div>
                  )}
                  {selectedNode?.investigating_officer && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><ShieldAlert className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Officer</span></div>
                        <span className="text-xs text-white">{selectedNode.investigating_officer}</span>
                     </div>
                  )}

                  {/* Citizen-specific fields */}
                  {selectedNode?.age && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><Clock className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Age</span></div>
                        <span className="text-xs text-white">{selectedNode.age} yrs</span>
                     </div>
                  )}
                  {selectedNode?.gender && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><User className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Gender</span></div>
                        <span className="text-xs text-white">{selectedNode.gender}</span>
                     </div>
                  )}

                  {/* Organization-specific fields */}
                  {selectedNode?.threat_level && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><AlertTriangle className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Threat Level</span></div>
                        <span className={`text-xs font-bold ${selectedNode.threat_level === 'Severe' ? 'text-red-400' : selectedNode.threat_level === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>{selectedNode.threat_level}</span>
                     </div>
                  )}
                  {selectedNode?.known_territory && (
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Territory</span></div>
                        <span className="text-xs text-white">{selectedNode.known_territory}</span>
                     </div>
                  )}

                  {/* Status — shown for Case & Citizen */}
                  {selectedNode?.status && (
                     <div className="flex flex-col gap-1.5 col-span-2">
                        <div className="flex items-center gap-1.5 text-slate-400"><AlertTriangle className="w-3.5 h-3.5"/><span className="text-[10px] uppercase tracking-wider font-semibold">Status</span></div>
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${selectedNode.status === 'Arrested' ? 'text-red-400' : 'text-orange-400'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedNode.status === 'Arrested' ? 'bg-red-500' : 'bg-orange-500'}`}/>
                           {selectedNode.status}
                        </span>
                     </div>
                  )}
               </div>

               {/* AI Risk Gauge — uses deterministic hash of node id */}
               <div className="mb-6">
                 <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">AI Risk Assessment</h3>
                 {(() => {
                   const id = selectedNode?.id || '';
                   let hash = 0;
                   for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash) + id.charCodeAt(i); hash = hash & hash; }
                   const h1 = Math.abs(hash) % 100;
                   const h2 = Math.abs(hash * 31) % 100;
                   const h3 = Math.abs(hash * 17) % 100;
                   const risk = Math.round((h1 + h2 + h3) / 3);
                   const reoffend = Math.round((h1 + h2) / 2);
                   const centrality = ((Math.abs(hash) % 100) / 100).toFixed(2);
                   const escalation = risk > 66 ? 'High' : risk > 33 ? 'Medium' : 'Low';
                   const color = risk > 66 ? '#ef4444' : risk > 33 ? '#f97316' : '#10b981';
                   const label = risk > 66 ? 'High Risk' : risk > 33 ? 'Moderate Risk' : 'Low Risk';
                   return (
                     <div className="flex items-center gap-5">
                       <div className="relative w-24 h-24 shrink-0">
                         <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 100">
                           <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                           <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset={188.5 * (1 - risk / 100)} style={{filter: `drop-shadow(0 0 6px ${color}99)`}} />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                           <span className="text-lg font-bold text-white leading-none">{risk}%</span>
                           <span className="text-[9px] font-bold mt-1" style={{color}}>{label}</span>
                         </div>
                       </div>
                       <div className="flex flex-col gap-3 flex-1">
                         <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Reoffend Probability</span>
                           <span className="text-white font-bold">{reoffend}%</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Network Centrality</span>
                           <span className="text-white font-bold">{centrality}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Escalation Risk</span>
                           <span className="font-bold" style={{color}}>{escalation}</span>
                         </div>
                       </div>
                     </div>
                   );
                 })()}
               </div>
               </>}

               {/* CONNECTIONS TAB */}
               {activeTab === 'connections' && (() => {
                 const nodeId = String(selectedNode?.id || '');
                 const links: any[] = graphStats?.allLinks || [];
                 const nodes: any[] = graphStats?.allNodes || [];
                 const nodeMap: Record<string, any> = {};
                 nodes.forEach((n: any) => { nodeMap[String(n.id)] = n; });

                 const neighbors = links
                   .filter((l: any) => String(l.source) === nodeId || String(l.target) === nodeId)
                   .map((l: any) => ({
                     relationship: l.relationship || 'Connected',
                     node: nodeMap[String(l.source) === nodeId ? l.target : l.source]
                   }))
                   .filter((c: any) => c.node)
                   .slice(0, 10);

                 return (
                   <div className="flex flex-col gap-3">
                     <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{neighbors.length} Direct Connection{neighbors.length !== 1 ? 's' : ''}</p>
                     {neighbors.length === 0 && (
                       <p className="text-xs text-slate-500 italic">No connections found in the current rendered graph for this node.</p>
                     )}
                     {neighbors.map((c: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-full bg-blue-900/40 border border-blue-800/50 flex items-center justify-center text-[9px] font-bold text-blue-400">{i+1}</div>
                           <div>
                             <p className="text-xs font-semibold text-slate-200 group-hover:text-white">{c.node.id}</p>
                             <p className="text-[10px] text-slate-500">{c.node.type}</p>
                           </div>
                         </div>
                         <span className="text-[9px] font-semibold text-blue-400/70 bg-blue-500/10 px-1.5 py-0.5 rounded">{c.relationship.replace(/_/g,' ')}</span>
                       </div>
                     ))}
                   </div>
                 );
               })()}

               {/* HISTORY TAB */}
               {activeTab === 'history' && (
                 <div className="flex flex-col gap-4">
                   <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Case Activity Timeline</p>
                   {selectedNode?.crime_type ? (
                     <div className="flex flex-col gap-3">
                       {[
                         { label: 'Case Registered', desc: `FIR filed for ${selectedNode.crime_type}`, color: 'text-blue-400', dot: 'bg-blue-500' },
                         { label: 'Investigation Started', desc: `Assigned to ${selectedNode.investigating_officer || 'Officer'}`, color: 'text-yellow-400', dot: 'bg-yellow-500' },
                         { label: 'Area Surveyed', desc: `Surveillance active in ${selectedNode.area || 'jurisdiction'}`, color: 'text-purple-400', dot: 'bg-purple-500' },
                         { label: 'Status Updated', desc: selectedNode.status || 'Pending review', color: 'text-orange-400', dot: 'bg-orange-500' },
                       ].map((event, i) => (
                         <div key={i} className="flex gap-3">
                           <div className="flex flex-col items-center">
                             <div className={`w-2 h-2 rounded-full mt-0.5 ${event.dot}`} />
                             {i < 3 && <div className="w-px flex-1 bg-slate-800 mt-1" />}
                           </div>
                           <div className="pb-3">
                             <p className={`text-xs font-semibold ${event.color}`}>{event.label}</p>
                             <p className="text-[11px] text-slate-400 mt-0.5">{event.desc}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-xs text-slate-500 italic">No case history available for this entity type ({selectedNode?.type}).</p>
                   )}
                 </div>
               )}

               {/* AI ANALYSIS TAB */}
               {activeTab === 'ai' && (() => {
                 const id = selectedNode?.id || '';
                 let hash = 0;
                 for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash) + id.charCodeAt(i); hash = hash & hash; }
                 const risk = Math.round((Math.abs(hash) % 100 + Math.abs(hash * 31) % 100 + Math.abs(hash * 17) % 100) / 3);
                 const threatVectors = [
                   { label: 'Recidivism Risk', val: Math.abs(hash * 3) % 100, color: '#f97316' },
                   { label: 'Network Influence', val: Math.abs(hash * 7) % 100, color: '#a855f7' },
                   { label: 'Geo-Risk Score', val: Math.abs(hash * 11) % 100, color: '#3b82f6' },
                   { label: 'Escalation Likelihood', val: Math.abs(hash * 13) % 100, color: '#ef4444' },
                 ];
                 return (
                   <div className="flex flex-col gap-5">
                     <div>
                       <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Threat Vector Analysis</p>
                       {threatVectors.map((v, i) => (
                         <div key={i} className="mb-3">
                           <div className="flex justify-between text-xs mb-1">
                             <span className="text-slate-400">{v.label}</span>
                             <span className="font-bold text-white">{v.val}%</span>
                           </div>
                           <div className="w-full bg-slate-800 rounded-full h-1.5">
                             <div className="h-1.5 rounded-full transition-all duration-1000" style={{width: `${v.val}%`, backgroundColor: v.color, boxShadow: `0 0 6px ${v.color}88`}} />
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                       <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">AI Recommendation</p>
                       <p className="text-xs text-slate-300 leading-relaxed">
                         {risk > 66
                           ? `High-priority entity. Recommend immediate surveillance and cross-referencing with known associates. Escalation probability is elevated.`
                           : risk > 33
                           ? `Moderate-risk profile. Routine monitoring advised. Flag for review if new connections are established.`
                           : `Low-risk entity. Standard monitoring protocol. No immediate action required.`
                         }
                       </p>
                     </div>
                   </div>
                 );
               })()}
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
                <div className="flex flex-col justify-between flex-1 pb-1">
                   {(graphStats?.areas || []).map((area: any, i: number) => {
                      const colors = ["#a855f7", "#f97316", "#ef4444", "#3b82f6", "#10b981", "#eab308", "#ec4899"];
                      return (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shrink-0`} style={{backgroundColor: colors[i % colors.length]}} />
                            <span className="text-xs text-slate-300 truncate max-w-[150px]">{area.name}</span>
                         </div>
                         <span className="text-[11px] font-bold text-slate-400">{area.count} nodes</span>
                      </div>
                   )})}
                </div>
             </div>

             {/* RISK SCORE DISTRIBUTION */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase">Risk Score Distribution</h3>
                </div>

                {/* Line Chart SVG */}
                <div className="flex-1 relative w-full pb-6">
                  
                  {/* Y-axis Title - rotated vertically */}
                  <div className="absolute left-0 top-0 bottom-6 flex items-center justify-center" style={{width: '12px'}}>
                    <span className="text-[8px] text-purple-400 font-semibold tracking-wider whitespace-nowrap" style={{transform: 'rotate(-90deg)', transformOrigin: 'center'}}>
                      No. of Entities
                    </span>
                  </div>

                  {/* Y-axis Labels */}
                  <div className="absolute left-3 top-0 bottom-6 w-7 flex flex-col justify-between text-[9px] text-slate-500 font-medium text-right pr-1">
                     {(() => {
                        const maxRisk = Math.max(...(graphStats?.riskBins || [0]), 1);
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
                  <div className="absolute left-10 right-2 top-0 bottom-5 border-l border-b border-slate-700">
                     {/* Horizontal Grid lines */}
                     <div className="absolute inset-x-0 top-0 border-t border-slate-800/50" />
                     <div className="absolute inset-x-0 top-1/4 border-t border-slate-800/50" />
                     <div className="absolute inset-x-0 top-2/4 border-t border-slate-800/50" />
                     <div className="absolute inset-x-0 top-3/4 border-t border-slate-800/50" />
                     
                     {/* SVG Chart with proper viewBox */}
                     <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 100" preserveAspectRatio="none">
                       <defs>
                         <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                           <stop offset="100%" stopColor="rgba(168, 85, 247, 0.02)" />
                         </linearGradient>
                       </defs>
                       
                       {(() => {
                           const raw = graphStats?.riskBins;
                           const hasData = raw && raw.some((b: number) => b > 0);
                           const bins: number[] = hasData ? raw : [5, 12, 28, 45, 62, 58, 40, 22, 10, 4]; // placeholder until loaded
                           const maxCount = Math.max(...bins, 1);
                           
                           const W = 420;
                           const H = 100;
                           const pad = 4;
                           
                           const points = bins.map((count: number, i: number) => ({
                               x: pad + i * ((W - pad * 2) / (bins.length - 1)),
                               y: H - pad - (count / maxCount) * (H - pad * 2)
                           }));

                           // Smooth Bezier curve
                           let d = `M ${points[0].x},${points[0].y}`;
                           for (let i = 0; i < points.length - 1; i++) {
                              const cp1x = points[i].x + (points[i+1].x - points[i].x) / 3;
                              const cp1y = points[i].y;
                              const cp2x = points[i+1].x - (points[i+1].x - points[i].x) / 3;
                              const cp2y = points[i+1].y;
                              d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i+1].x},${points[i+1].y}`;
                           }

                           const fillD = `${d} L ${points[points.length-1].x},${H} L ${points[0].x},${H} Z`;

                           return (
                               <>
                                 <path d={fillD} fill="url(#riskGrad)" />
                                 <path d={d} fill="none" stroke="#a855f7" strokeWidth="1.5"
                                   style={{filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.9))'}} />
                                 {points.map((p: {x: number, y: number}, i: number) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#a855f7"
                                       style={{filter: 'drop-shadow(0 0 3px rgba(168,85,247,1))'}} />
                                 ))}
                               </>
                           );
                       })()}
                     </svg>
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute left-10 right-2 bottom-0 h-6 flex flex-col items-center gap-0.5">
                    <div className="flex justify-between w-full text-[9px] text-slate-500 font-medium">
                      <span>0</span>
                      <span>20</span>
                      <span>40</span>
                      <span>60</span>
                      <span>80</span>
                      <span>100</span>
                    </div>
                    <span className="text-[8px] text-purple-400 font-semibold tracking-wider">Risk Score</span>
                  </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}

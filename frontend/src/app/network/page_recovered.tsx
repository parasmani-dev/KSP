"use client"

import React, { useState } from 'react';
import { 
  Network, Maximize, Search, ChevronDown, 
  MapPin, User, FileText, CarFront, Building2, Eye, ShieldAlert,
  ArrowLeft, ArrowRight, Minus, Plus, Layers, Target, Clock, AlertTriangle
} from 'lucide-react';

export default function CrimeNetworkPage() {

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
        <div className="flex gap-4">
           <div className="flex bg-[#0B1220] border border-slate-800 rounded-lg p-1 shadow-sm">
             <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md flex items-center gap-2">
               <Network className="w-4 h-4"/> Graph View
             </button>
             <button className="px-4 py-1.5 text-slate-400 hover:text-white text-sm font-medium rounded-md flex items-center gap-2 transition-colors">
               Table View
             </button>
           </div>
           <button className="p-2.5 bg-[#0B1220] border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shadow-sm">
             <Maximize className="w-4 h-4"/>
           </button>
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
                 <div className="w-80 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-lg flex items-center px-3 py-2.5 pointer-events-auto shadow-xl">
                   <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0"/>
                   <input type="text" placeholder="Search entity, case, or location..." className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-500 w-full" />
                 </div>
                 
                 {/* Dropdowns */}
                 <div className="flex gap-3 pointer-events-auto">
                   <button className="flex items-center gap-2 px-3 py-2 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors shadow-xl">
                     Entity Types <ChevronDown className="w-4 h-4"/>
                   </button>
                   <button className="flex items-center gap-2 px-3 py-2 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors shadow-xl">
                     Time Range: 30 Days <ChevronDown className="w-4 h-4"/>
                   </button>
                 </div>
               </div>

               {/* Left Controls Overlay */}
               <div className="absolute top-24 left-5 bottom-5 flex flex-col justify-between z-10 pointer-events-none w-52">
                 {/* Entity Types Legend */}
                 <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-lg p-4 pointer-events-auto shadow-xl">
                   <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">Entity Types</p>
                   <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"/><span className="text-xs text-slate-300 font-medium">Person</span></div>
                      <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"/><span className="text-xs text-slate-300 font-medium">Location</span></div>
                      <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"/><span className="text-xs text-slate-300 font-medium">Crime</span></div>
                      <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"/><span className="text-xs text-slate-300 font-medium">Case</span></div>
                      <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"/><span className="text-xs text-slate-300 font-medium">Vehicle</span></div>
                      <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"/><span className="text-xs text-slate-300 font-medium">Organization</span></div>
                   </div>
                 </div>
                 
                 {/* Network Statistics */}
                 <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-lg p-4 pointer-events-auto shadow-xl">
                   <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">Network Statistics</p>
                   <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Total Nodes</span>
                        <span className="text-xs font-bold text-white">124</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Total Connections</span>
                        <span className="text-xs font-bold text-white">287</span>
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
                   <button className="w-full mt-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold py-2 rounded flex justify-center items-center gap-2 transition-colors">
                     <Network className="w-3.5 h-3.5" /> Analyze Network
                   </button>
                 </div>
               </div>

               {/* Right Controls Overlay */}
               <div className="absolute top-24 right-5 flex flex-col gap-2 z-10 pointer-events-auto">
                 <div className="flex flex-col bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                    <button className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white border-b border-slate-700 transition-colors"><Plus className="w-4 h-4"/></button>
                    <button className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white border-b border-slate-700 transition-colors"><Minus className="w-4 h-4"/></button>
                    <button className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white border-b border-slate-700 transition-colors"><Target className="w-4 h-4"/></button>
                    <button className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><Layers className="w-4 h-4"/></button>
                 </div>
               </div>

               {/* Bottom Legend Overlay */}
               <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-10 pointer-events-auto bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 rounded-full px-6 py-2 shadow-xl">
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Connection Strength:</span>
                  <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-400"/> <span className="text-[10px] text-slate-300 uppercase tracking-wider">Strong</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-500 border-t border-dashed border-slate-500" style={{borderTopWidth: 2}}/> <span className="text-[10px] text-slate-300 uppercase tracking-wider">Medium</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-600 border-t border-dotted border-slate-600" style={{borderTopWidth: 2}}/> <span className="text-[10px] text-slate-300 uppercase tracking-wider">Weak</span></div>
               </div>

               {/* ========================================= */}
               {/* THE GRAPH CANVAS (SVG Rendering) */}
               {/* ========================================= */}
               <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                 <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* EDGES (Lines) */}
                    <g className="edges" opacity="0.6">
                       {/* Center to Top (Narcotics) */}
                       <line x1="500" y1="300" x2="450" y2="180" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
                       {/* Center to Top Left (Dharavi) */}
                       <line x1="500" y1="300" x2="330" y2="190" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 4" />
                       {/* Center to Top Right (Kurla Syndicate) */}
                       <line x1="500" y1="300" x2="570" y2="170" stroke="#10b981" strokeWidth="2" />
                       {/* Center to Mid Left (Drug Dist) */}
                       <line x1="500" y1="300" x2="290" y2="280" stroke="#a855f7" strokeWidth="3" />
                       {/* Center to Mid Right (Vehicle) */}
                       <line x1="500" y1="300" x2="650" y2="280" stroke="#f97316" strokeWidth="2" />
                       {/* Center to Bottom Left (Imran) */}
                       <line x1="500" y1="300" x2="360" y2="400" stroke="#3b82f6" strokeWidth="2" />
                       {/* Center to Bottom Center (FIR) */}
                       <line x1="500" y1="300" x2="480" y2="450" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4"/>
                       {/* Center to Bottom Right (Kurla hotspot) */}
                       <line x1="500" y1="300" x2="600" y2="400" stroke="#ef4444" strokeWidth="2" />
                       {/* Center to Far Bottom Right (Lokesh) */}
                       <line x1="500" y1="300" x2="730" y2="400" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 4" />
                       
                       {/* Inter-node connections */}
                       <line x1="450" y1="180" x2="330" y2="190" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
                       <line x1="450" y1="180" x2="570" y2="170" stroke="#10b981" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
                       <line x1="330" y1="190" x2="290" y2="280" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                       <line x1="290" y1="280" x2="360" y2="400" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
                       <line x1="570" y1="170" x2="650" y2="280" stroke="#f97316" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
                       <line x1="600" y1="400" x2="730" y2="400" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                       <line x1="480" y1="450" x2="360" y2="400" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
                       
                       {/* Extra floating nodes connections (background noise) */}
                       <line x1="200" y1="150" x2="330" y2="190" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                       <line x1="250" y1="450" x2="360" y2="400" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                       <line x1="800" y1="200" x2="650" y2="280" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                       <line x1="850" y1="350" x2="730" y2="400" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                    </g>

                    {/* NODES */}
                    <g className="nodes">
                       
                       {/* Center Node (Sunil Patel) */}
                       <g transform="translate(500, 300)" filter="url(#glow-blue)">
                          <circle r="35" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                          <circle r="25" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
                          <text x="0" y="5" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">👤</text>
                          <text x="0" y="55" fontFamily="sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">Sunil Patel</text>
                          <text x="0" y="70" fontFamily="sans-serif" fontSize="10" fill="#94a3b8" textAnchor="middle">Primary Suspect</text>
                       </g>

                       {/* Top Node (Narcotics) */}
                       <g transform="translate(450, 180)" filter="url(#glow-purple)">
                          <circle r="18" fill="#4c1d95" stroke="#a855f7" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">💊</text>
                          <text x="0" y="35" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">Narcotics</text>
                          <text x="0" y="48" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Crime Type</text>
                       </g>

                       {/* Top Left (Dharavi) */}
                       <g transform="translate(330, 190)" filter="url(#glow-red)">
                          <circle r="18" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">📍</text>
                          <text x="0" y="35" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">Dharavi</text>
                          <text x="0" y="48" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Hotspot</text>
                       </g>

                       {/* Top Right (Kurla Syndicate) */}
                       <g transform="translate(570, 170)" filter="url(#glow-emerald)">
                          <circle r="18" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">🏢</text>
                          <text x="0" y="35" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">Kurla Syndicate</text>
                          <text x="0" y="48" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Organization</text>
                       </g>

                       {/* Mid Left (Drug Dist) */}
                       <g transform="translate(290, 280)" filter="url(#glow-purple)">
                          <circle r="16" fill="#4c1d95" stroke="#a855f7" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">🔍</text>
                          <text x="0" y="32" fontFamily="sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">Drug Distribution</text>
                          <text x="0" y="45" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Modus Operandi</text>
                       </g>

                       {/* Mid Right (Vehicle) */}
                       <g transform="translate(650, 280)" filter="url(#glow-orange)">
                          <circle r="16" fill="#7c2d12" stroke="#f97316" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">🚗</text>
                          <text x="0" y="32" fontFamily="sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">Vehicle MH01AB1234</text>
                          <text x="0" y="45" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Involved</text>
                       </g>

                       {/* Bottom Left (Imran) */}
                       <g transform="translate(360, 400)" filter="url(#glow-blue)">
                          <circle r="16" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">👤</text>
                          <text x="0" y="32" fontFamily="sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">Imran Qureshi</text>
                          <text x="0" y="45" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Associate</text>
                       </g>

                       {/* Bottom Center (FIR) */}
                       <g transform="translate(480, 450)" filter="url(#glow-purple)">
                          <circle r="16" fill="#4c1d95" stroke="#a855f7" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">📄</text>
                          <text x="0" y="32" fontFamily="sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">FIR #1587/24</text>
                          <text x="0" y="45" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Case</text>
                       </g>

                       {/* Bottom Right (Kurla) */}
                       <g transform="translate(600, 400)" filter="url(#glow-red)">
                          <circle r="16" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">📍</text>
                          <text x="0" y="32" fontFamily="sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">Kurla</text>
                          <text x="0" y="45" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Hotspot</text>
                       </g>

                       {/* Far Bottom Right (Lokesh) */}
                       <g transform="translate(730, 400)" filter="url(#glow-blue)">
                          <circle r="16" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
                          <text x="0" y="4" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle">👤</text>
                          <text x="0" y="32" fontFamily="sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">Lokesh Yadav</text>
                          <text x="0" y="45" fontFamily="sans-serif" fontSize="9" fill="#94a3b8" textAnchor="middle">Associate</text>
                       </g>

                       {/* Small Background Nodes */}
                       <circle cx="200" cy="150" r="4" fill="#64748b" opacity="0.5" />
                       <circle cx="250" cy="450" r="4" fill="#64748b" opacity="0.5" />
                       <circle cx="800" cy="200" r="4" fill="#64748b" opacity="0.5" />
                       <circle cx="850" cy="350" r="4" fill="#64748b" opacity="0.5" />
                       <circle cx="150" cy="300" r="3" fill="#64748b" opacity="0.3" />
                       <circle cx="900" cy="500" r="5" fill="#64748b" opacity="0.4" />
                    </g>
                 </svg>
               </div>
            </div>

            {/* DETAILS PANEL (col-span-1) */}
            <div className="xl:col-span-1 bg-[#0f172a] rounded-xl border border-slate-800 p-5 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-lg">
               
               {/* Header */}
               <div className="flex items-center justify-between mb-5">
                 <button className="flex items-center gap-1.5 text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors">
                   <ArrowLeft className="w-3.5 h-3.5"/> Back to Network
                 </button>
                 <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Person</span>
               </div>

               {/* Profile Info */}
               <div className="flex items-start gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                   <User className="w-6 h-6" />
                 </div>
                 <div className="flex flex-col flex-1">
                   <h2 className="text-xl font-bold text-white leading-none mb-1.5">Sunil Patel</h2>
                   <p className="text-xs text-slate-400 font-medium">Primary Suspect</p>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">48.27% Risk</span>
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
         </div>

         {/* BOTTOM ROW: ANALYTICS WIDGETS */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
             
             {/* CRIME TYPE DISTRIBUTION */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase mb-6">Crime Type Distribution</h3>
                <div className="flex items-center justify-between flex-1">
                   {/* Donut Chart SVG */}
                   <div className="relative w-36 h-36">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                         {/* Other (12%) */}
                         <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="25" strokeDasharray="219.9" strokeDashoffset={219.9 * (1 - 1)} />
                         {/* Fraud (12%) */}
                         <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="25" strokeDasharray="219.9" strokeDashoffset={219.9 * (1 - 0.88)} />
                         {/* Assault (16%) */}
                         <circle cx="50" cy="50" r="35" fill="none" stroke="#a855f7" strokeWidth="25" strokeDasharray="219.9" strokeDashoffset={219.9 * (1 - 0.76)} />
                         {/* Theft (18%) */}
                         <circle cx="50" cy="50" r="35" fill="none" stroke="#f97316" strokeWidth="25" strokeDasharray="219.9" strokeDashoffset={219.9 * (1 - 0.60)} />
                         {/* Narcotics (42%) */}
                         <circle cx="50" cy="50" r="35" fill="none" stroke="#4c1d95" strokeWidth="25" strokeDasharray="219.9" strokeDashoffset={219.9 * (1 - 0.42)} />
                         {/* Inner Cutout for donut hole */}
                         <circle cx="50" cy="50" r="22" fill="#0f172a" />
                      </svg>
                   </div>
                   
                   {/* Legend */}
                   <div className="flex flex-col gap-3 w-[45%]">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#4c1d95]"/><span className="text-xs text-slate-300">Narcotics</span></div>
                         <span className="text-xs font-bold text-white">42%</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"/><span className="text-xs text-slate-300">Theft</span></div>
                         <span className="text-xs font-bold text-white">18%</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"/><span className="text-xs text-slate-300">Assault</span></div>
                         <span className="text-xs font-bold text-white">16%</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-xs text-slate-300">Fraud</span></div>
                         <span className="text-xs font-bold text-white">12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/><span className="text-xs text-slate-300">Other</span></div>
                         <span className="text-xs font-bold text-white">12%</span>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* NETWORK CLUSTERS */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase mb-5">Network Clusters</h3>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                         <span className="text-sm text-slate-300">Cluster 1 - Narcotics Network</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">23 nodes</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                         <span className="text-sm text-slate-300">Cluster 2 - Theft Ring</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">18 nodes</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                         <span className="text-sm text-slate-300">Cluster 3 - Drug Distribution</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">15 nodes</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                         <span className="text-sm text-slate-300">Cluster 4 - Financial Network</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">12 nodes</span>
                   </div>
                </div>
                <button className="w-full mt-auto bg-[#0B1220] hover:bg-slate-800 border border-slate-800 text-blue-400 text-xs font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors">
                   View All Clusters <ArrowRight className="w-3.5 h-3.5" />
                </button>
             </div>
             
             {/* CONNECTION TIMELINE */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase">Connection Timeline</h3>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B1220] border border-slate-700 rounded text-[10px] font-medium text-slate-300 hover:text-white transition-colors">
                    Last 30 Days <ChevronDown className="w-3 h-3"/>
                  </button>
                </div>
                
                {/* Line Chart SVG */}
                <div className="flex-1 relative w-full h-full pb-4">
                  
                  {/* Y-axis Labels */}
                  <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] text-slate-500 font-medium">
                     <span>200</span>
                     <span>150</span>
                     <span>100</span>
                     <span>50</span>
                     <span>0</span>
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
                           <stop offset="0%" stopColor="rgba(168, 85, 247, 0.2)" />
                           <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                         </linearGradient>
                       </defs>
                       <path d="M 0,90 Q 30,50 60,70 T 120,20 T 180,60 T 240,40 T 300,80 T 360,90 T 420,25" fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                       <path d="M 0,90 Q 30,50 60,70 T 120,20 T 180,60 T 240,40 T 300,80 T 360,90 T 420,25 L 420,100 L 0,100 Z" fill="url(#lineGrad)" vectorEffect="non-scaling-stroke" />
                       
                       {/* Data Points */}
                       <circle cx="0" cy="90" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                       <circle cx="60" cy="70" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                       <circle cx="120" cy="20" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                       <circle cx="180" cy="60" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                       <circle cx="240" cy="40" r="4" fill="white" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]" /> {/* Active point */}
                       <circle cx="300" cy="80" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                       <circle cx="360" cy="90" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                       <circle cx="420" cy="25" r="3" fill="#a855f7" vectorEffect="non-scaling-stroke" />
                     </svg>

                     {/* Tooltip on active point */}
                     <div className="absolute top-[10%] left-[57%] transform -translate-x-1/2 -translate-y-full bg-slate-800 text-white text-[10px] py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap border border-slate-700 font-medium z-10">
                        May 12, 2024<br/>
                        <span className="text-slate-300">Connections:</span> 156
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
                     </div>
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute left-10 right-2 bottom-0 h-6 flex justify-between items-end text-[9px] text-slate-500 font-medium px-2">
                     <span>Apr 20</span>
                     <span>Apr 27</span>
                     <span>May 04</span>
                     <span>May 11</span>
                     <span>May 18</span>
                  </div>
                </div>
             </div>

         </div>
      </div>

    </div>
  )
}

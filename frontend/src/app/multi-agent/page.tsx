"use client"
import { useState, useEffect } from "react"
import { 
  Upload, FileText, Settings, Network, BrainCircuit, FileSearch, 
  CheckCircle2, ShieldAlert, Activity, ArrowRight, Server, ShieldCheck, 
  Database, Fingerprint, Share2, Scale, Settings2, User, Gavel, MapPin, Building2, Star, Target, Shield, CarFront
} from "lucide-react"

const AGENTS = [
  { id: 'evidence', name: 'Evidence Agent', role: 'Data Collection', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500' },
  { id: 'pattern', name: 'Pattern Agent', role: 'Pattern Recognition', icon: Fingerprint, color: 'text-teal-400', bg: 'bg-teal-400', border: 'border-teal-400', shadow: 'shadow-teal-400' },
  { id: 'network', name: 'Network Agent', role: 'Link Analysis', icon: Share2, color: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500' },
  { id: 'risk', name: 'Risk Agent', role: 'Risk Assessment', icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500' },
  { id: 'report', name: 'Report Agent', role: 'Intel. Output', icon: FileText, color: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500', shadow: 'shadow-green-500' }
]

export default function MultiAgentPage() {
  const [activeStage, setActiveStage] = useState(-1) // Start in awaiting state
  const [loading, setLoading] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [completionTimes, setCompletionTimes] = useState<string[]>(Array(5).fill('--:--:--'))
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    text: "FIR REPORT: Suspect Sunil Patel was spotted in Dharavi area allegedly distributing narcotics near Intersection 12. Known to have 3 prior offenses. Associates with the Kurla syndicate.",
    suspect: '',
    location: '',
    description: ''
  })

  const [intelData, setIntelData] = useState({
    suspect: 'Sunil Patel',
    location: 'Dharavi',
    crimeType: 'Narcotics',
    riskScore: '53.28',
    riskLevel: 'Moderate',
    connections: 7,
    crimes: 3,
    daysSince: 45,
    summary: 'Analysis indicates Suspect Sunil Patel is part of a narcotics distribution network operating in the Whitefield-Dharavi corridor.'
  })

  // Simulate pipeline execution
  useEffect(() => {
    if (activeStage >= 0 && activeStage < 5) {
      const timer = setTimeout(() => {
        setCompletionTimes(prev => {
          const newTimes = [...prev];
          newTimes[activeStage] = new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' });
          return newTimes;
        });
        setActiveStage(prev => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (activeStage === 5) {
      setLoading(false)
    }
  }, [activeStage])

  const handleLaunch = () => {
    if (activeStage >= 0) {
      // Reset
      setActiveStage(-1)
      setLoading(false)
      setShowBrief(false)
      setCompletionTimes(Array(5).fill('--:--:--'))
    } else {
      // Launch
      setLoading(true)
      setActiveStage(0)
      setShowBrief(false)
      setCompletionTimes(Array(5).fill('--:--:--'))

      // Dynamically parse FIR to generate realistic mock output
      const text = formData.text || '';
      const suspectMatch = text.match(/(?:Suspect|Accused|Name:?|Mr\.|Ms\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const suspect = suspectMatch ? suspectMatch[1] : 'Unknown Subject';
      
      const hash = text.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      const scoreNum = (Math.abs(hash) % 50) + 35 + (Math.random() * 5); // 35 to 90
      const riskScore = scoreNum.toFixed(2);
      const riskLevel = scoreNum > 75 ? 'Critical' : scoreNum > 50 ? 'Moderate' : 'Low';
      const crimes = (Math.abs(hash) % 5) + 1;
      const connections = crimes * 3 + (Math.abs(hash) % 4);
      const daysSince = (Math.abs(hash) % 50) + 5;
      
      const locMatch = text.match(/(?:in|near|at|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      const location = locMatch ? locMatch[1] : 'the targeted sector';

      const crimeMatch = text.match(/(narcotics|theft|fraud|smuggling|assault|murder|cyber|phishing)/i);
      const crimeType = crimeMatch ? crimeMatch[1].charAt(0).toUpperCase() + crimeMatch[1].slice(1) : 'Narcotics';
      
      setIntelData({
        suspect,
        location,
        crimeType,
        riskScore,
        riskLevel,
        connections,
        crimes,
        daysSince,
        summary: `Analysis indicates Suspect ${suspect} is operating near ${location}. ${crimes} prior offenses match the current modus operandi. Risk of escalation is `
      })
    }
  }

  return (
    <div className="p-6 h-full flex flex-col bg-[#020817] text-slate-200 overflow-y-auto overflow-x-hidden min-h-screen custom-scrollbar">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white">
            <BrainCircuit className="w-7 h-7 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">Autonomous Multi-Agent Engine</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
            The CIOS autonomously activates a swarm of specialized AI agents to extract intelligence, build criminal networks, assess risk and generate actionable insights.
          </p>
        </div>
      </div>
      
      {/* 3-COLUMN MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 shrink-0 mb-6">
        
        {/* LEFT COLUMN: INPUTS (3/12) */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Upload Widget */}
          <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col items-center shadow-xl shadow-black/20 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center gap-2 w-full mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">1</div>
              <h3 className="font-semibold text-slate-200 text-sm">Upload Case Files</h3>
            </div>
            
            <div 
              className="w-full border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors mb-4 cursor-pointer bg-[#0B1220]/50"
              onClick={() => document.getElementById('file-upload-agent')?.click()}
            >
               <Upload className="w-8 h-8 text-blue-500 mb-3" />
               <p className="text-xs text-slate-300">Drag & drop text (.txt) files only</p>
               <p className="text-[10px] text-slate-500 mt-1">Max 50MB per file</p>
               <input 
                 type="file" 
                 accept=".txt"
                 id="file-upload-agent" 
                 className="hidden" 
                 onChange={(e) => {
                   if (e.target.files && e.target.files.length > 0) {
                     const file = e.target.files[0]
                     setUploadedFile(file)
                     
                     if (file.type === "text/plain" || file.name.endsWith(".txt")) {
                       const reader = new FileReader();
                       reader.onload = (event) => {
                         const content = event.target?.result as string;
                         setFormData(prev => ({ ...prev, text: content }));
                       };
                       reader.readAsText(file);
                     } else {
                       setFormData(prev => ({
                         ...prev,
                         text: `FIR REPORT [Auto-Extracted from ${file.name}]: Suspect unknown was spotted near Whitefield intersection. Reported to have connections with the local cartel. Involved in multiple altercations.`
                       }))
                     }
                   }
                 }} 
               />
            </div>

            {uploadedFile && (
              <div className="w-full bg-[#0B1220] border border-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-red-500/20 p-2 rounded text-red-500">
                     <FileText className="w-4 h-4" />
                   </div>
                   <div className="min-w-0 flex-1">
                     <p className="text-xs font-medium text-slate-200 truncate pr-2" title={uploadedFile.name}>
                       {uploadedFile.name}
                     </p>
                     <p className="text-[10px] text-slate-500">
                       {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Uploaded
                     </p>
                   </div>
                 </div>
                 <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            )}

            <div className="w-full text-center mt-4 mb-2 text-xs text-slate-500 font-medium">OR</div>
          </div>

          {/* Manual FIR Input */}
          <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col flex-1 shadow-xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors" />
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-slate-200">
              <FileText className="w-4 h-4 text-blue-500"/> Manual FIR Input
            </h3>
            <div className="flex-1 mb-6">
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Raw FIR Text</label>
              <textarea 
                value={formData.text} 
                onChange={e => setFormData({...formData, text: e.target.value})} 
                className="w-full h-[150px] resize-none bg-[#0B1220] border border-slate-700 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-300 font-mono custom-scrollbar leading-relaxed" 
                placeholder="Paste FIR text here..." 
              />
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={handleLaunch} 
                className="w-full bg-blue-600 text-white font-semibold rounded-md px-4 py-2.5 flex items-center justify-center gap-2 text-sm hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                <Activity className="w-4 h-4" />
                Launch Agent Swarm
              </button>
              <button 
                onClick={() => setActiveStage(-1)}
                className="w-full bg-transparent border border-slate-700 text-slate-300 font-medium rounded-md px-4 py-2.5 flex items-center justify-center gap-2 text-sm hover:bg-slate-800 transition-colors"
              >
                <Activity className="w-4 h-4 opacity-50" />
                Reset Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: EXECUTION GRAPH & OUTPUT (6/12) */}
        <div className="xl:col-span-6 flex flex-col gap-5">
          
          {/* Swarm Execution Graph */}
          <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col flex-1 relative overflow-hidden shadow-xl shadow-black/20 group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-semibold text-base flex items-center gap-2 text-slate-200">
                <Network className="w-5 h-5 text-blue-500"/> Swarm Execution Graph
              </h3>
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-500 tracking-wider">PIPELINE ACTIVE</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between relative px-2 mt-4 mb-10">
              {/* Connecting Gradient Line */}
              <div className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-slate-800 z-0">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-1000 ease-in-out relative"
                  style={{ width: `${Math.min(100, (Math.max(0, activeStage) / (AGENTS.length - 1)) * 100)}%` }}
                >
                  {activeStage >= 0 && activeStage < 5 && (
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] animate-pulse"></div>
                  )}
                </div>
              </div>

              {AGENTS.map((agent, i) => {
                const isActive = activeStage === i
                const isDone = activeStage > i
                const isPending = activeStage < i

                return (
                  <div key={agent.id} className="relative z-10 flex flex-col items-center gap-3 w-[20%]">
                    
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isActive ? `bg-[#0B1220] ${agent.border} ${agent.color} shadow-[0_0_20px_currentColor] scale-110 animate-pulse` :
                      isDone ? `${agent.bg} border-transparent text-white shadow-lg ${agent.shadow}/40` :
                      'bg-[#0B1220] border-slate-700 text-slate-600'
                    }`}>
                      <agent.icon className={`w-6 h-6 ${isDone ? 'text-white' : ''}`} />
                    </div>

                    <div className="text-center mt-2">
                      <p className={`text-xs font-bold leading-tight ${isActive || isDone ? 'text-slate-200' : 'text-slate-500'}`}>{agent.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{agent.role}</p>
                    </div>

                    {/* Meta Table under each node */}
                    <div className="mt-2 w-full text-[9px] flex flex-col gap-1 px-1">
                       <div className="flex justify-between w-full">
                         <span className="text-slate-500">Status</span>
                         <span className={isDone ? 'text-green-500 font-bold' : isActive ? 'text-blue-400 font-bold bg-blue-500/10 px-1 rounded' : 'text-orange-500 font-bold bg-orange-500/10 px-1 rounded'}>
                           {isDone ? 'COMPLETED' : isActive ? 'PROCESSING' : 'PENDING'}
                         </span>
                       </div>
                       <div className="flex justify-between w-full">
                         <span className="text-slate-500">Time</span>
                         <span className="text-slate-300">{isDone ? completionTimes[i] : '--:--:--'}</span>
                       </div>
                       <div className="flex justify-between w-full">
                         <span className="text-slate-500">Output</span>
                         <span className="text-slate-300 truncate pl-1">
                            {isDone ? (i === 0 ? 'Extracted Data' : i === 1 ? `${intelData.crimes} Patterns` : i === 2 ? `${intelData.connections} Connections` : i === 3 ? `${intelData.riskScore}% Risk` : 'Intel Brief') : '- - -'}
                         </span>
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Real-time Intelligence Output */}
          <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col shrink-0 shadow-xl shadow-black/20 relative overflow-hidden group">
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors" />
             <h3 className="font-semibold text-base mb-4 text-slate-200">Real-time Intelligence Output</h3>
             
             <div className="relative flex-1 flex flex-col">
               {/* OVERLAY for uncompleted state */}
               {activeStage < 5 && (
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-[2px] bg-[#0f172a]/50 rounded-lg">
                   {loading ? (
                     <div className="flex flex-col items-center text-blue-400">
                       <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                       <p className="text-xs font-bold tracking-widest uppercase">Processing Data...</p>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center text-slate-500">
                       <ShieldAlert className="w-6 h-6 mb-2 opacity-50" />
                       <p className="text-xs font-bold tracking-widest uppercase">Awaiting FIR Input</p>
                     </div>
                   )}
                 </div>
               )}

               <div className={`flex flex-col gap-4 transition-all duration-500 ${activeStage < 5 ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                 <div className="grid grid-cols-4 gap-3">
                    {/* Primary Suspect */}
                    <div className="bg-[#0B1220] border border-blue-500/20 rounded-lg p-3 flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400"><User className="w-5 h-5"/></div>
                      <div>
                        <p className="text-[10px] text-slate-400">Primary Suspect</p>
                        <p className="text-sm font-bold text-white leading-tight">{intelData.suspect}</p>
                        <p className="text-[9px] text-blue-400 mt-1">Confidence <span className="bg-blue-500/20 px-1 py-0.5 rounded">92%</span></p>
                      </div>
                    </div>
                    {/* Risk Score */}
                    <div className="bg-[#0B1220] border border-orange-500/20 rounded-lg p-3 flex items-center gap-3">
                       <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400"><ShieldAlert className="w-5 h-5"/></div>
                       <div>
                         <p className="text-[10px] text-slate-400">Risk Score</p>
                         <p className="text-sm font-bold text-white leading-tight">{intelData.riskScore}%</p>
                         <p className={`text-[9px] font-bold mt-1 ${intelData.riskLevel === 'Critical' ? 'text-red-400' : intelData.riskLevel === 'Moderate' ? 'text-orange-400' : 'text-green-400'}`}>{intelData.riskLevel} Risk</p>
                       </div>
                    </div>
                    {/* Network Links */}
                    <div className="bg-[#0B1220] border border-purple-500/20 rounded-lg p-3 flex items-center gap-3">
                       <div className="bg-purple-500/10 p-2.5 rounded-lg text-purple-400"><Share2 className="w-5 h-5"/></div>
                       <div>
                         <p className="text-[10px] text-slate-400">Network Links</p>
                         <p className="text-sm font-bold text-white leading-tight">{intelData.connections}</p>
                         <p className="text-[9px] text-slate-500 mt-1">Connections</p>
                       </div>
                    </div>
                    {/* Prior Crimes */}
                    <div className="bg-[#0B1220] border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                       <div className="bg-red-500/10 p-2.5 rounded-lg text-red-400"><Scale className="w-5 h-5"/></div>
                       <div>
                         <p className="text-[10px] text-slate-400">Prior Crimes</p>
                         <p className="text-sm font-bold text-white leading-tight">{intelData.crimes}</p>
                         <p className="text-[9px] text-slate-500 mt-1">Matched Records</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-[#0B1220] border border-slate-700/50 rounded-lg p-4 relative">
                    <h4 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                      <Star className="w-3 h-3 fill-blue-400" /> AI Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-[90%]">
                      {intelData.summary} <span className={`font-bold ${intelData.riskLevel === 'Critical' ? 'text-red-400' : intelData.riskLevel === 'Moderate' ? 'text-orange-400' : 'text-green-400'}`}>{intelData.riskLevel}</span>.
                    </p>
                    <button 
                      onClick={() => setShowBrief(true)}
                      className="absolute bottom-4 right-4 text-[10px] font-medium text-blue-400 flex items-center gap-1 hover:text-blue-300"
                    >
                      View Full Intelligence Brief <ArrowRight className="w-3 h-3"/>
                    </button>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OVERVIEW & FEED (3/12) */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          
          {/* Swarm Intelligence Overview */}
          <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors" />
            <h3 className="font-semibold text-sm mb-5 text-slate-200">Swarm Intelligence Overview</h3>
            <div className="flex items-center gap-6">
               <div className="relative w-20 h-20 flex-shrink-0">
                  {/* SVG Circle Gauge */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                     <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (Math.max(0, activeStage * 19.6) / 100))} className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">{Math.max(0, Math.min(98, activeStage * 20))}%</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wide">Efficiency</span>
                  </div>
               </div>
               <div className="flex-1 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Agents Active</span>
                    <span className="text-green-400 font-bold">{Math.max(0, activeStage === 5 ? 5 : activeStage + 1)} / 5</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Tasks Completed</span>
                    <span className="text-slate-200 font-semibold">{Math.max(0, activeStage * 31)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Data Points Processed</span>
                    <span className="text-slate-200 font-semibold">{(Math.max(0, activeStage * 2569)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Patterns Detected</span>
                    <span className="text-slate-200 font-semibold">{Math.max(0, activeStage * 49)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Links Discovered</span>
                    <span className="text-slate-200 font-semibold">{(Math.max(0, activeStage * 265)).toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Swarm Activity Feed */}
          <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col flex-1 h-[320px] shadow-xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10 group-hover:bg-red-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-sm text-slate-200">Swarm Activity Feed</h3>
               <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold tracking-wider">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> LIVE
               </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-2 overflow-y-auto custom-scrollbar pr-2">
               {[
                 { id: 1, agent: 'Evidence Agent', msg: 'Extracted key entities from FIR document', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                 { id: 2, agent: 'Pattern Agent', msg: `Matched with ${intelData.crimes} historical crime patterns`, icon: Fingerprint, color: 'text-teal-400', bg: 'bg-teal-500/10' },
                 { id: 3, agent: 'Network Agent', msg: `Linked ${intelData.connections} nodes in criminal network graph`, icon: Share2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                 { id: 4, agent: 'Risk Agent', msg: `Calculated escalation risk score of ${intelData.riskScore}%`, icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                 { id: 5, agent: 'Report Agent', msg: 'Synthesizing final intelligence brief', icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10' },
               ].map((item, idx) => {
                  const currentStatus = activeStage > idx ? 'done' : activeStage === idx ? 'processing' : 'waiting';
                  const displayTime = activeStage > idx ? completionTimes[idx] : '--:--:--';

                  return (
                    <div key={item.id} className={`flex gap-3 transition-all duration-500 ${activeStage >= idx ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                         <item.icon className="w-4 h-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-bold text-slate-200">{item.agent}</p>
                         <p className="text-[10px] text-slate-400 truncate mt-0.5">
                           {currentStatus === 'waiting' ? 'Awaiting execution...' : item.msg}
                         </p>
                       </div>
                       <div className={`flex flex-col items-end justify-center shrink-0 ${item.color}`}>
                         <span className="text-[9px] text-slate-500 mb-1">{displayTime}</span>
                         {currentStatus === 'done' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                         {currentStatus === 'processing' && <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></div>}
                         {currentStatus === 'waiting' && <div className="text-slate-600 tracking-widest text-[8px]">- - -</div>}
                       </div>
                    </div>
                  )
               })}
            </div>

          </div>
        </div>
      </div>

      {/* FINAL INTELLIGENCE BRIEF EXPANDED */}
      {showBrief && activeStage === 5 && (
        <div className="bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-slate-700/50 flex flex-col shrink-0 shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6 relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="font-semibold text-sm text-slate-200">Final Intelligence Brief Compiled</h2>
            </div>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Generated by Multi-Agent Swarm</span>
          </div>
          
          {/* Body */}
          <div className="p-6 grid grid-cols-2 gap-10">
            {/* Left Column: Entities */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-sm mb-1 text-slate-200">Extracted Entities & Graph Nodes</h3>
              
              {/* Entity Rows */}
              <div className="flex flex-col gap-3">
                {/* Citizen */}
                <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex justify-between items-center transition-colors hover:border-slate-600">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Citizen</p>
                    <p className="text-sm font-semibold text-white">{intelData.suspect}</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded">Primary Suspect</span>
                </div>
                {/* Location */}
                <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex justify-between items-center transition-colors hover:border-slate-600">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Location</p>
                    <p className="text-sm font-semibold text-white">{intelData.location}</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded">Incident Zone</span>
                </div>
                {/* Crime */}
                <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex justify-between items-center transition-colors hover:border-slate-600">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Crime</p>
                    <p className="text-sm font-semibold text-white">{intelData.crimeType}</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded">Classification</span>
                </div>
              </div>
            </div>

            {/* Right Column: Neural Risk Assessment */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-sm mb-1 text-slate-200">Neural Risk Assessment</h3>
              
              {/* Profile Header */}
              <div className="flex justify-between items-end border-b border-slate-800 pb-4 mb-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Target Profile</p>
                  <p className="text-lg font-semibold text-white leading-none">{intelData.suspect}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Reoffend Probability</p>
                  <p className="text-lg font-semibold text-orange-400 leading-none">{intelData.riskScore}%</p>
                </div>
              </div>

              {/* XAI Reasoning */}
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400 mb-1">XAI Reasoning:</p>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Prior Crime Count</span>
                  <span className="text-white font-semibold">{intelData.crimes}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Days Since Last Crime</span>
                  <span className="text-white font-semibold">{intelData.daysSince}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Network Connections</span>
                  <span className="text-white font-semibold">{intelData.connections}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">XGBoost Probability</span>
                  <span className="text-white font-semibold font-mono">{(parseFloat(intelData.riskScore)/100).toFixed(4)}</span>
                </div>
              </div>

              {/* Overall Risk Card */}
              <div className={`mt-auto rounded-lg p-4 flex items-center gap-4 border ${intelData.riskLevel === 'Critical' ? 'bg-red-500/10 border-red-500/20' : intelData.riskLevel === 'Moderate' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                <ShieldAlert className={`w-8 h-8 ${intelData.riskLevel === 'Critical' ? 'text-red-500' : intelData.riskLevel === 'Moderate' ? 'text-orange-500' : 'text-green-500'}`} />
                <div>
                   <p className="text-xs text-slate-400 mb-0.5">Overall Risk Category</p>
                   <p className={`text-xl font-bold uppercase leading-none ${intelData.riskLevel === 'Critical' ? 'text-red-500' : intelData.riskLevel === 'Moderate' ? 'text-orange-500' : 'text-green-500'}`}>{intelData.riskLevel}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

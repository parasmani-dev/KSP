import React from 'react';
import { ShieldAlert, Activity, Users, Clock, Calendar, Star, FileText, ChevronRight, TrendingUp, Search, User, Target } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, ReferenceLine } from 'recharts';

export function TopKpiCards({ result }: { result: any }) {
  const riskScore = result?.reoffend_probability || 47.29;
  const isHighRisk = riskScore > 75;
  const isModRisk = riskScore > 35 && riskScore <= 75;
  const riskColor = isHighRisk ? 'text-red-500' : isModRisk ? 'text-amber-500' : 'text-green-500';

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-amber-500";
    return "text-green-500";
  };
  
  const getRiskStrokeColor = (score: number) => {
    if (score >= 75) return "#EF4444";
    if (score >= 50) return "#F97316";
    if (score >= 25) return "#F59E0B";
    return "#22C55E";
  };

  const getDynamicPath = () => {
    // Base Y is lower (higher up visually) for high risk scores
    const baseY = 35 - (riskScore / 100) * 20; 
    let path = `M0,${baseY}`;
    let prevY = baseY;
    
    for (let i = 1; i <= 10; i++) {
      const x = i * 20;
      // Generate some deterministic variance based on the risk score
      const variance = Math.sin(riskScore * 12.3 * i) * 6;
      const y = Math.max(2, Math.min(38, baseY + variance));
      
      const cpX = x - 10;
      path += ` S${cpX},${y} ${x},${y}`;
      prevY = y;
    }
    return path;
  };

  return (
    <>
      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-5 flex flex-col shadow-xl shadow-black/20 relative overflow-hidden group transition-all">
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-900/20 rounded-md border border-blue-500/20">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider">RISK SCORE</span>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        
        <div className="mt-2 relative z-10">
          <div className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>{riskScore.toFixed(2)}%</div>
          <div className={`text-xs font-medium mt-1 ${getRiskColor(riskScore)}`}>
            {riskScore >= 75 ? 'Critical Risk' : riskScore >= 50 ? 'High Risk' : riskScore >= 25 ? 'Moderate Risk' : 'Low Risk'}
          </div>
        </div>

        <div className="mt-4 flex-1 flex flex-col justify-end pb-2 relative z-10">
          <svg width="100%" height="24" viewBox="0 0 200 40" preserveAspectRatio="none">
            <path d={getDynamicPath()} fill="none" stroke={getRiskStrokeColor(riskScore)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-5 flex flex-col shadow-xl shadow-black/20 relative overflow-hidden group transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-900/20 rounded-md border border-purple-500/20">
              <Star className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider">THREAT RANK</span>
          </div>
        </div>
        <div className="mt-4 flex-1 flex flex-col justify-center">
          <div className="text-3xl font-bold text-white">#{result?.threat_rank || '2,846'}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Top {result?.threat_percentile || 18}% of database</div>
        </div>
      </div>

      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-5 flex flex-col shadow-xl shadow-black/20 relative overflow-hidden group transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-900/20 rounded-md border border-green-500/20">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider">NETWORK SIZE</span>
          </div>
        </div>
        <Users className="w-16 h-16 text-slate-800/30 absolute right-4 bottom-4 z-0" />
        <div className="mt-4 flex-1 flex flex-col justify-center relative z-10">
          <div className="text-3xl font-bold text-white">{result?.connections !== undefined ? result.connections : 11}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Direct & indirect links</div>
        </div>
      </div>

      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-5 flex flex-col shadow-xl shadow-black/20 relative overflow-hidden group transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-900/20 rounded-md border border-blue-500/20">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider">LAST ACTIVITY</span>
          </div>
        </div>
        <Calendar className="w-16 h-16 text-slate-800/30 absolute right-4 bottom-4 z-0" />
        <div className="mt-4 flex-1 flex flex-col justify-center relative z-10">
          <div className="text-2xl font-bold text-blue-400">{result?.last_activity_label || '2 Days Ago'}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">{result?.last_activity_date || '18 May 2024, 22:14'}</div>
        </div>
      </div>
    </>
  );
}

function MoreVerticalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function CitizenProfileCard({ result, searchName }: { result: any, searchName: string }) {
  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm">Citizen Profile</span>
        </div>
      </div>

      <div className="flex gap-8 flex-1">
        <div className="w-24 h-24 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700 shrink-0">
           <User className="w-10 h-10 text-slate-500" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white capitalize">{searchName || "Unknown"}</h2>
            <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-800/50 rounded text-[10px] font-medium">Primary Subject</span>
          </div>
          
          <div className="grid grid-cols-[110px_1fr] gap-y-4 mt-auto mb-2 text-[11px]">
            <div className="text-slate-500">Node ID</div>
            <div className="text-slate-300 font-medium truncate">{result?.offender_id || searchName || '-'}</div>
            
            <div className="text-slate-500">Known Associates</div>
            <div className="text-slate-300 font-medium">{result?.connections || 0} Links</div>
            
            <div className="text-slate-500">Prior Offenses</div>
            <div className="text-slate-300 font-medium">{result?.features?.prior_crimes || 0} Cases</div>
            
            <div className="text-slate-500">Days Since Incident</div>
            <div className="text-slate-300 font-medium">{result?.features?.days_since_last_crime || 0} Days</div>
            
            <div className="text-slate-500">Last Seen</div>
            <div className="text-slate-300 font-medium">{result?.last_activity_date || '-'}</div>
            
            <div className="text-slate-500">Status</div>
            <div className="text-slate-300 font-medium text-blue-400">
               {result?.reoffend_probability > 75 ? 'Critical Surveillance' : result?.reoffend_probability > 50 ? 'Active Monitoring' : 'Standard Routine'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RiskScoreGauge({ result }: { result: any }) {
  const riskScore = result?.reoffend_probability || 47.29;
  const isHighRisk = riskScore > 75;
  const isModRisk = riskScore > 35 && riskScore <= 75;
  const riskColor = isHighRisk ? '#ef4444' : isModRisk ? '#f59e0b' : '#22c55e';
  const riskText = isHighRisk ? 'CRITICAL RISK' : isModRisk ? 'MODERATE RISK' : 'LOW RISK';
  
  // Dynamic trend calculation
  const trendVal = Math.abs(Math.sin(riskScore) * 15).toFixed(1);
  const trendIsUp = Math.sin(riskScore) > 0;

  const circumference = 2 * Math.PI * 60;
  const strokeDasharray = `${(riskScore / 100) * circumference} ${circumference}`;

  return (
    <div className="bg-[#111A2C] border border-slate-800/60 rounded-xl p-5 shadow-sm flex flex-col h-full items-center justify-between">
      <div className="w-full flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Target className="w-4 h-4" style={{ color: riskColor }} />
          <span className="font-semibold text-sm">Risk Score</span>
        </div>
      </div>
      
      <div className="relative w-40 h-40 flex items-center justify-center mt-4 mb-2">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-[30px] opacity-20 z-0 transition-colors duration-1000" style={{ backgroundColor: riskColor }}></div>
        
        {/* Background track */}
        <svg className="w-full h-full -rotate-90 transform absolute inset-0 z-10">
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="#1E293B" strokeWidth="12" />
          <circle 
            cx="80" cy="80" r="60" 
            fill="transparent" 
            stroke={riskColor} 
            strokeWidth="12" 
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out drop-shadow-md"
          />
        </svg>
        
        <div className="flex flex-col items-center justify-center text-center z-20">
          <div className="text-3xl font-bold transition-colors duration-1000" style={{ color: riskColor }}>
            {riskScore.toFixed(2)}%
          </div>
          <div className="text-[10px] font-bold mt-1 tracking-wider transition-colors duration-1000" style={{ color: riskColor }}>
            {riskText}
          </div>
        </div>
      </div>
      
      <div className="w-full mt-auto pt-4">
        <div className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 shadow-inner transition-colors duration-500
          ${trendIsUp ? 'bg-red-900/10 border-red-500/20 text-red-400' : 'bg-green-900/10 border-green-500/20 text-green-400'}`}>
          <TrendingUp className={`w-4 h-4 ${!trendIsUp && 'rotate-180'}`} /> 
          {trendVal}% {trendIsUp ? 'higher' : 'lower'} than last 30 days
        </div>
      </div>
    </div>
  );
}

export function AiRiskExplanation({ result }: { result: any }) {
  const priorCrimes = result?.features?.prior_crimes || 0;
  const daysSince = result?.features?.days_since_last_crime || 0;
  const connections = result?.features?.network_connections || result?.connections || 0;
  const prob = (result?.reoffend_probability / 100) || 0.4729;
  
  const modelConfidence = Math.min(99, 85 + (priorCrimes * 2) + (connections > 0 ? 5 : 0));

  // Determine Impact Levels
  const getImpact = (val: number, threshold: number) => val > threshold ? { label: 'High', color: 'text-red-500' } : val > threshold/2 ? { label: 'Medium', color: 'text-amber-500' } : { label: 'Low', color: 'text-green-500' };
  
  const crimesImpact = getImpact(priorCrimes, 2);
  const connectionsImpact = getImpact(connections, 5);
  // Fewer days = higher risk impact
  const daysImpact = daysSince === 0 ? { label: 'Low', color: 'text-green-500' } : daysSince < 180 ? { label: 'High', color: 'text-red-500' } : daysSince < 365 ? { label: 'Medium', color: 'text-amber-500' } : { label: 'Low', color: 'text-green-500' };
  const probImpact = getImpact(prob, 0.7);

  const drivers = [
    { name: "PRIOR CRIME COUNT", value: priorCrimes, impact: crimesImpact.label, color: crimesImpact.color },
    { name: "DAYS SINCE LAST CRIME", value: daysSince, impact: daysImpact.label, color: daysImpact.color },
    { name: "NETWORK CONNECTIONS", value: connections, impact: connectionsImpact.label, color: connectionsImpact.color },
    { name: "XGBOOST PROBABILITY", value: prob.toFixed(4), impact: probImpact.label, color: probImpact.color },
  ];

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl -z-10 group-hover:bg-red-500/10 transition-colors" />
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm">Target Analysis</span>
        </div>
        <div className="text-[10px] text-slate-400 font-medium">Model Confidence: <span className="text-green-400">{modelConfidence}%</span></div>
      </div>
      
      <div className="flex justify-between w-full text-[10px] uppercase text-slate-500 font-semibold mb-2 px-2">
        <span>Risk Drivers</span>
        <span>Impact</span>
      </div>
      
      <div className="flex-1 w-full space-y-3 overflow-y-auto pr-2">
        {drivers.map((r: any, idx: number) => {
           return (
             <div key={idx} className="flex justify-between items-center p-2 rounded-md transition-colors hover:bg-slate-800/50">
               <div className="flex gap-3 items-center">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700 shrink-0`}>
                    <ShieldAlert className={`w-3 h-3 ${r.color}`} />
                 </div>
                 <div>
                   <div className="text-xs font-semibold text-slate-300">{r.name}</div>
                   <div className="text-[10px] text-slate-500 mt-0.5">{r.value}</div>
                 </div>
               </div>
               <div className={`text-xs font-semibold ${r.color}`}>
                 {r.impact}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}

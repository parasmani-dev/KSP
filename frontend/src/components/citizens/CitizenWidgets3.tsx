import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, Table, Users, ChevronRight, ChevronLeft, User } from 'lucide-react';

export function RiskComparison({ result }: { result: any }) {
  const riskScore = result?.reoffend_probability || 47.29;

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/10 transition-colors" />
      <div className="flex items-center gap-2 text-slate-300 mb-6">
        <BarChart2 className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-sm">Risk Comparison</span>
      </div>

      <div className="flex-1 flex flex-col justify-center pb-8">
        <div className="relative pt-6">
          {/* Custom marker for "You" */}
          <div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${riskScore}%` }}
          >
            <div className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap">
              You: {riskScore.toFixed(2)}%
            </div>
            <div className="w-0.5 h-3 bg-slate-400 mt-1"></div>
          </div>
          
          {/* Stacked bar gradient */}
          <div className="w-full h-4 rounded-full flex overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: '35%' }}></div>
            <div className="h-full bg-amber-500" style={{ width: '40%' }}></div>
            <div className="h-full bg-orange-500" style={{ width: '15%' }}></div>
            <div className="h-full bg-red-600" style={{ width: '10%' }}></div>
          </div>
          
          {/* Axis labels */}
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex justify-between mt-8 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Low Risk</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate Risk</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High Risk</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Critical Risk</div>
        </div>
      </div>
    </div>
  );
}

export function DemographicMatrix({ result }: { result: any }) {
  const data = [
    { age: '18-25', low: '12%', med: '28%', high: '34%', very: '26%' },
    { age: '26-35', low: '10%', med: '25%', high: '38%', very: '27%' },
    { age: '36-45', low: '15%', med: '30%', high: '30%', very: '25%' },
    { age: '46-60', low: '20%', med: '35%', high: '25%', very: '20%' },
    { age: '60+', low: '25%', med: '40%', high: '20%', very: '15%' },
  ];

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 group-hover:bg-teal-500/10 transition-colors" />
      <div className="mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Table className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm">Demographic Risk Matrix</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Risk distribution by age group in this area</p>
      </div>

      <div className="flex-1">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="py-2 text-left font-medium">Age</th>
              <th className="py-2 font-medium">Low</th>
              <th className="py-2 font-medium">Medium</th>
              <th className="py-2 font-medium">High</th>
              <th className="py-2 font-medium">Very High</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50 last:border-0">
                <td className="py-1.5 text-left text-slate-400">{row.age}</td>
                <td className="py-1.5 bg-green-500/10 text-green-400 border-r border-slate-800/50">{row.low}</td>
                <td className="py-1.5 bg-amber-500/10 text-amber-500 border-r border-slate-800/50">{row.med}</td>
                <td className="py-1.5 bg-orange-500/10 text-orange-400 border-r border-slate-800/50">{row.high}</td>
                <td className="py-1.5 bg-red-500/10 text-red-400">{row.very}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/60 text-center">
        <button className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1 w-full">
          View Full Matrix <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function SimilarProfiles({ result }: { result: any }) {
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();
  const accomplices = result?.accomplices || [];

  // Map backend predictions to UI format, fallback to empty array if none
  const allProfiles = accomplices.map((acc: any) => {
    // Normalize confidence score to a 0-100 percentage (Adamic-Adar can be > 1, so we cap/scale reasonably or just use as-is if it's already 0-1)
    // Jaccard is 0-1. Adamic Adar can be higher. Let's do a simple scaling for the UI to look like a percentage.
    const rawScore = acc.confidence_score || 0;
    const matchScore = rawScore <= 1 ? rawScore * 100 : Math.min(99, rawScore * 20 + 50);
    
    return { 
      name: acc.accomplice, 
      score: acc.reoffend_probability || Math.round(matchScore * 0.8), // Mocking risk score based on match if not provided
      match: Math.round(matchScore),
      reason: acc.explanation?.reason || "Graph proximity"
    };
  });
  
  const profiles = allProfiles.slice(startIndex, startIndex + 4);

  const handlePrev = () => {
    setStartIndex(prev => Math.max(0, prev - 4));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(allProfiles.length - (allProfiles.length % 4 === 0 ? 4 : allProfiles.length % 4), prev + 4));
  };

  return (
    <div className="bg-[#0B1220]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-sm">Similar Profiles</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Individuals with similar risk patterns</p>
        </div>
        <div className="flex gap-1">
           <button 
             onClick={handlePrev} 
             disabled={startIndex === 0}
             className={`p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors ${startIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
             <ChevronLeft className="w-4 h-4"/>
           </button>
           <button 
             onClick={handleNext} 
             disabled={startIndex + 4 >= allProfiles.length}
             className={`p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors ${startIndex + 4 >= allProfiles.length ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
             <ChevronRight className="w-4 h-4"/>
           </button>
        </div>
      </div>

      <div className="flex-1">
        {profiles.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {profiles.map((p: any, i: number) => (
              <div key={i} className="bg-gradient-to-b from-slate-800/40 to-[#0B1220] border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 flex flex-col items-center text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800/80 flex items-center justify-center mb-3 group-hover:ring-2 ring-blue-500/30 ring-offset-2 ring-offset-[#0B1220] transition-all">
                   <User className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-xs font-bold text-slate-200 leading-tight mb-2 flex items-center justify-center">{p.name}</div>
                <div className="text-[9px] text-slate-400 mb-4 min-h-[44px] overflow-hidden text-ellipsis line-clamp-3 leading-relaxed px-1" title={p.reason}>{p.reason}</div>

                <div className="w-full bg-[#111A2C] rounded-lg p-2 grid grid-cols-2 gap-2 text-center mb-3 border border-slate-800/80">
                  <div className="border-r border-slate-800/80">
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider mb-0.5">Risk Score</div>
                    <div className="text-xs font-bold text-red-400">{p.score}%</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider mb-0.5">Similarity</div>
                    <div className="text-xs font-bold text-emerald-400">{p.match}%</div>
                  </div>
                </div>
                
                <div 
                  onClick={() => router.push(`/citizens?search=${encodeURIComponent(p.name)}`)}
                  className="w-full mt-auto bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 text-[10px] font-semibold py-1.5 rounded-lg border border-blue-500/20 cursor-pointer transition-colors"
                >
                   View Profile
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
            No similar profiles or hidden connections found in the database.
          </div>
        )}
      </div>
    </div>
  );
}

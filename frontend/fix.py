with open('src/app/network/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '{/* BOTTOM ROW: ANALYTICS WIDGETS */}'
idx = text.find(target)

if idx != -1:
    top_part = text[:idx]
    
    bottom_part = '''{/* BOTTOM ROW: ANALYTICS WIDGETS */}
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
                           return (graphStats?.crimeTypes || []).map((ct: any, i: number) => {
                             const sliceLength = (ct.percent / 100) * 219.9;
                             const gapLength = 219.9 - sliceLength;
                             const offset = - (cumulative / 100) * 219.9;
                             cumulative += ct.percent;
                             return (
                               <circle 
                                  key={i} 
                                  cx="50" cy="50" r="35" 
                                  fill="none" 
                                  stroke={colors[i % colors.length]} 
                                  strokeWidth="25" 
                                  strokeDasharray={${sliceLength} } 
                                  strokeDashoffset={offset} 
                                  className="transition-all duration-1000 ease-out" 
                               />
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
                             <div className="flex items-center gap-2"><div className={w-2.5 h-2.5 rounded-full shrink-0} style={{backgroundColor: colors[i % colors.length]}}/><span className="text-[11px] text-slate-300 truncate max-w-[80px]" title={ct.name}>{ct.name}</span></div>
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
                            <div className={w-2.5 h-2.5 rounded-full shrink-0} style={{backgroundColor: colors[i % colors.length]}} />
                            <span className="text-sm text-slate-300 truncate max-w-[150px]">{area.name}</span>
                         </div>
                         <span className="text-xs font-bold text-white">{area.count} nodes</span>
                      </div>
                   )})}
                </div>
                <button className="w-full mt-auto bg-[#0B1220] hover:bg-slate-800 border border-slate-800 text-blue-400 text-xs font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors">
                   View All Areas <ArrowRight className="w-3.5 h-3.5" />
                </button>
             </div>

             {/* TOP INVESTIGATING OFFICERS */}
             <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-200 tracking-widest uppercase">Top Officers</h3>
                </div>
                <div className="flex-1 flex flex-col justify-end gap-3 pb-2 relative">
                   <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-20">
                     <div className="border-t border-slate-700 w-full"></div>
                     <div className="border-t border-slate-700 w-full"></div>
                     <div className="border-t border-slate-700 w-full"></div>
                     <div className="border-t border-slate-700 w-full"></div>
                     <div className="border-t border-slate-700 w-full"></div>
                   </div>
                   
                   <div className="flex justify-around items-end h-[180px] z-10">
                     {(graphStats?.officers || []).map((officer: any, i: number) => {
                       const maxCases = graphStats?.officers?.[0]?.count || 1;
                       const heightPercent = Math.max(10, Math.round((officer.count / maxCases) * 100));
                       return (
                         <div key={i} className="flex flex-col items-center gap-2 w-full group relative h-full justify-end">
                           <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap pointer-events-none z-20 shadow-lg border border-slate-700">
                             {officer.count} Cases
                           </div>
                           <div className="w-8 bg-blue-500/80 rounded-t-sm hover:bg-blue-400 transition-all duration-1000 ease-out" style={{ height: ${heightPercent}% }}></div>
                           <span className="text-[9px] text-slate-400 font-medium truncate w-14 text-center" title={officer.name}>
                             {officer.name.split(' ')[0]}
                           </span>
                         </div>
                       )
                     })}
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
'''
    
    with open('src/app/network/page.tsx', 'w', encoding='utf-8') as f:
        f.write(top_part + bottom_part)
        print('Successfully replaced bottom layout!')
else:
    print('Could not find BOTTOM ROW marker')

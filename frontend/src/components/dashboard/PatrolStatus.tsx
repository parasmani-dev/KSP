"use client"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CarFront } from "lucide-react"
import { aiApi } from "@/lib/api"

export function PatrolStatus() {
  const [data, setData] = useState<any[]>([])
  const [coverage, setCoverage] = useState(0)

  useEffect(() => {
    aiApi.get('/data/dashboard/patrols').then(res => {
      setData(res.data.status || [])
      setCoverage(res.data.coverage || 0)
    }).catch(console.error)
  }, [])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CarFront className="h-4 w-4 text-teal-400" />
        <h3 className="font-semibold text-white">Patrol Status</h3>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="h-[140px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1e293b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text (Adjusted for semi-circle) */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">{coverage}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Coverage</span>
          </div>
        </div>
        
        {/* Legend Row */}
        <div className="flex items-center justify-center gap-4 w-full mt-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

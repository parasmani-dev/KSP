"use client"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react"
import { aiApi } from "@/lib/api"

export function CrimeTrendChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    aiApi.get('/data/dashboard/trends').then(res => {
      setData(res.data.trends || [])
    }).catch(console.error)
  }, [])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-400" />
        <h3 className="font-semibold text-white">Crime Trend (Overall Year)</h3>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 15 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              dy={10} 
              label={{ value: 'Month', position: 'bottom', fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              label={{ value: 'Incidents', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, dx: 15 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ fontSize: '12px', color: '#94a3b8' }}
            />
            {/* Previous Period - Dashed Line */}
            <Line type="monotone" dataKey="previous" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Previous Year" />
            {/* Current Period - Area */}
            <Area type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" name="Current Year" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function CrimeCategoryChart() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    aiApi.get('/data/dashboard/categories').then(res => {
      setData(res.data.categories || [])
      setTotal(res.data.total || 0)
    }).catch(console.error)
  }, [])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <PieChartIcon className="h-4 w-4 text-purple-400" />
        <h3 className="font-semibold text-white">Crime by Category</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-between">
        <div className="h-[120px] w-[120px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
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
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-white">{total > 1000 ? (total/1000).toFixed(1) + 'k' : total}</span>
          </div>
        </div>
        
        {/* Custom Legend */}
        <div className="flex flex-col gap-2 flex-1 pl-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-white">{item.percentage?.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

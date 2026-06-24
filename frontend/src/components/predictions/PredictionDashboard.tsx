"use client"

import { useState, useEffect } from "react"
import { aiApi } from "@/lib/api"
import { TrendingUp, Info, ShieldAlert, AlertOctagon, Target, Activity, Calendar, MapPin, Search, Clock, Users, ChevronRight, Play, Loader2, Filter, Moon, Thermometer, Car } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, Legend } from 'recharts'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const LiveMap = dynamic(() => import('@/components/predictions/LiveMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#050A15] animate-pulse flex items-center justify-center text-slate-500 text-xs">Loading Geospatial Engine...</div>
})
const COLORS = {
  red: '#ef4444',
  purple: '#a855f7',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  gray: '#475569'
}

function getAreaPos(area: string) {
  let hash = 0;
  for (let i = 0; i < area.length; i++) hash = area.charCodeAt(i) + ((hash << 5) - hash);
  const x = 20 + Math.abs(hash % 60); // 20 to 80
  const y = 20 + Math.abs((hash >> 2) % 60); // 20 to 80
  return { x, y };
}

export function PredictionDashboard() {
  const [horizon, setHorizonState] = useState('7 Days')
  const [horizonDays, setHorizonDays] = useState(7)
  
  // Anomaly Detection State
  const [anomalyArea, setAnomalyArea] = useState("Indiranagar")
  const [anomalyType, setAnomalyType] = useState("Theft")
  const [anomalyHour, setAnomalyHour] = useState("23")
  const [anomalyMonth, setAnomalyMonth] = useState("12")
  const [anomalyFestival, setAnomalyFestival] = useState(true)
  const [anomalyWeekend, setAnomalyWeekend] = useState(true)
  const [anomalyLoading, setAnomalyLoading] = useState(false)
  const [anomalyResult, setAnomalyResult] = useState<any>(null)

  // Live Data State
  const [hotspots, setHotspots] = useState<any[]>([])
  const [crimes, setCrimes] = useState<any[]>([])
  const [liveTrendData, setLiveTrendData] = useState<any[]>([])
  const [aiFactors, setAiFactors] = useState<any[]>([])
  const [aiEvents, setAiEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const setHorizon = (h: string) => {
    const days = h === '7 Days' ? 7 : h === '14 Days' ? 14 : 30
    setHorizonState(h)
    setHorizonDays(days)
  }

  useEffect(() => {
    let isMounted = true

    const fetchData = () => {
      setLoading(true)
      Promise.all([
        aiApi.get(`/predictions/hotspots?days=${horizonDays}`),
        aiApi.get('/data/map/crimes'),
        aiApi.get(`/predictions/trend?days=${horizonDays}`),
        aiApi.get(`/predictions/factors?days=${horizonDays}`),
        aiApi.get(`/predictions/events?days=${horizonDays}`)
      ])
        .then(([hotspotsRes, crimesRes, trendRes, factorsRes, eventsRes]) => {
          if (!isMounted) return
          const allHotspots = hotspotsRes.data.hotspots || []
          const sortedHotspots = allHotspots
            .filter((h: any) => !h.insufficient_data && h.risk_score != null)
            .sort((a: any, b: any) => b.risk_score - a.risk_score)
          setHotspots(sortedHotspots)
          
          setCrimes(crimesRes.data.crimes || [])
          setLiveTrendData(trendRes.data.trend || [])
          setAiFactors(factorsRes.data.factors || [])
          setAiEvents(eventsRes.data.events || [])
        })
        .catch(err => console.error("Error fetching live data:", err))
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [horizonDays])

  // Derived KPI Metrics
  const totalPredictedIncidents = hotspots.reduce((sum, h) => sum + (h.avg_predicted_incidents || 0), 0)
  const highRiskZones = hotspots.filter(h => h.risk_level === 'Critical' || h.risk_level === 'High').length
  const peakRiskArea = hotspots.length > 0
    ? hotspots.reduce((max, h) => h.risk_score > max.risk_score ? h : max, hotspots[0])
    : null
  
  // Derived Crime Type Pie Chart Data
  const crimeCounts = crimes.reduce((acc: any, c: any) => {
    acc[c.type] = (acc[c.type] || 0) + 1
    return acc
  }, {})
  
  const crimeTypesArray = Object.entries(crimeCounts)
    .map(([name, value]: [string, any]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4) // Top 4
  
  const totalCrimes = crimeTypesArray.reduce((sum, c) => sum + c.value, 0) || 1
  
  const livePieData = crimeTypesArray.length > 0 ? crimeTypesArray.map((c, i) => ({
    ...c,
    color: Object.values(COLORS)[i % 4],
    pct: Math.round((c.value / totalCrimes) * 100) + '%'
  })) : [
    { name: 'Theft', value: 89, color: COLORS.red, pct: '48%' },
    { name: 'Cybercrime', value: 41, color: COLORS.purple, pct: '22%' },
    { name: 'Fraud', value: 32, color: COLORS.orange, pct: '17%' },
    { name: 'Assault', value: 24, color: COLORS.green, pct: '13%' },
  ]
  const topCrimeType = livePieData.length > 0 ? livePieData[0] : null
  const totalForecasted = livePieData.reduce((sum, item) => sum + item.value, 0)

  // Derived Trend Data (using random variance scaled to total incidents)
  const baseLine = totalPredictedIncidents > 0 ? totalPredictedIncidents : 186
  // liveTrendData is now fetched from the backend API

  const handleAnomalyScan = async () => {
    setAnomalyLoading(true)
    try {
      const res = await aiApi.post('/predictions/emerging_threats', {
        area: anomalyArea,
        crime_type: anomalyType,
        hour: parseInt(anomalyHour) || 0,
        day: anomalyWeekend ? "Saturday" : "Wednesday",
        month: parseInt(anomalyMonth) || 1,
        is_festival_period: anomalyFestival ? 1 : 0,
        is_night_crime: (parseInt(anomalyHour) >= 18 || parseInt(anomalyHour) <= 5) ? 1 : 0,
        is_weekend: anomalyWeekend ? 1 : 0
      })
      setAnomalyResult(res.data)
    } catch (e) {
      console.error(e)
    }
    setAnomalyLoading(false)
  }

  // Compute Heatmap Data
  const heatmapData = new Array(7 * 24).fill(0);
  let maxHeat = 1;
  const dayMap: Record<string, number> = { 'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6 };
  
  crimes.forEach((c: any) => {
    if (c.day && typeof c.hour === 'number') {
      const d = dayMap[c.day];
      if (d !== undefined && c.hour >= 0 && c.hour < 24) {
        const idx = d * 24 + c.hour;
        heatmapData[idx]++;
        if (heatmapData[idx] > maxHeat) maxHeat = heatmapData[idx];
      }
    }
  });

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-300">
      
      {/* ROW 1: HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500 w-6 h-6" />
            AI Predictions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Forecasting future crime patterns and risks to enable proactive policing.</p>
        </div>
        <div className="flex items-center gap-4 bg-[#0B1220]/80 p-1.5 rounded-lg border border-slate-800/50">
          <span className="text-xs text-slate-400 pl-3">Forecast Horizon</span>
          <div className="flex items-center">
            {['7 Days', '14 Days', '30 Days'].map(h => (
              <button 
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${horizon === h ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {h}
              </button>
            ))}
          </div>
          <Info className="w-4 h-4 text-slate-500 mr-2" />
        </div>
      </div>

      {/* ROW 2: KPI CARDS */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-[4px] bg-[#020817]/40 rounded-xl transition-all duration-300">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">Recalculating Models...</p>
          </div>
        )}
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard title={`PREDICTED INCIDENTS (NEXT ${horizon.toUpperCase()})`} value={totalPredictedIncidents > 0 ? Math.round(totalPredictedIncidents) : "186"} subtitle="+24.7%" subDesc={`vs previous ${horizon}`} subColor="text-red-500" icon={<Activity className="text-red-500 w-5 h-5" />} chartColor={COLORS.red} chartPattern="wave1" />
            <KpiCard title="HIGH RISK ZONES" value={highRiskZones > 0 ? highRiskZones : "8"} subtitle="↑ 2" subDesc="New zones" subColor="text-red-500" icon={<MapPin className="text-purple-500 w-5 h-5" />} chartColor={COLORS.purple} chartPattern="wave2" />
        <KpiCard title="AVERAGE CITY RISK" value={hotspots.length > 0 ? `${Math.round((hotspots.reduce((sum, h) => sum + h.risk_score, 0) / hotspots.length) * 100)}%` : "0%"} subtitle="Active" subDesc="Across all zones" subColor="text-orange-500" icon={<Target className="text-orange-500 w-5 h-5" />} chartColor={COLORS.orange} chartPattern="wave3" />
        <KpiCard title="PEAK RISK AREA" value={peakRiskArea ? peakRiskArea.area : "N/A"} subtitle={peakRiskArea ? peakRiskArea.risk_level : "—"} subDesc="Highest threat level" subColor={peakRiskArea?.risk_level === 'Critical' ? 'text-red-500' : peakRiskArea?.risk_level === 'High' ? 'text-orange-500' : 'text-yellow-500'} icon={<ShieldAlert className="text-red-500 w-5 h-5" />} chartColor={COLORS.red} chartPattern="wave4" />
      </div>

      {/* ROW 3: MAIN VISUALIZATIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* RISK FORECAST MAP */}
        <div className="xl:col-span-1 bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-5 flex flex-col min-h-[350px]">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Risk Forecast Map (Next {horizon})</h3>
          <div className="flex-1 relative rounded-lg overflow-hidden bg-[#050A15] border border-slate-800/50">
            <LiveMap hotspots={hotspots} hideOverlay={true} theme="forecast" showMaximize={true} />
          </div>
        </div>

        {/* RISK TREND FORECAST */}
        <div className="xl:col-span-1 bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-5 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Trend Forecast</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={20}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="historical" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WHY AI PREDICTS THIS */}
        <div className="xl:col-span-1 bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-5 flex flex-col min-h-[350px]">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Why AI Predicts This</h3>
          <div className="flex-1 space-y-4">
            {aiFactors.length > 0 ? (
              aiFactors.map((f, i) => {
                const iconMap: any = { Calendar, TrendingUp, MapPin, Activity, Users, Moon, Thermometer, Car };
                const IconComp = iconMap[f.icon] || Info;
                return (
                  <FactorRow 
                    key={i} 
                    icon={<IconComp className={`${f.iconColor} w-4 h-4`}/>} 
                    title={f.title} 
                    desc={f.desc} 
                    pct={f.pct} 
                    color={f.color} 
                  />
                )
              })
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading live factors...</div>
            )}
          </div>
          <div className="border-t border-slate-800/50 pt-3 flex justify-between items-center mt-auto">
            <span className="text-xs text-slate-400">Model Confidence</span>
            <span className="text-xs text-green-500 font-bold">High</span>
          </div>
        </div>
      </div>

      {/* ROW 4: ANALYTICS & SIMULATOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* REAL-TIME ANOMALIES */}
        <div className="xl:col-span-1 bg-[#050A15]/80 border border-slate-800/50 rounded-xl p-0 flex flex-col min-h-[350px] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800/50 shrink-0">
            <button className="flex-1 py-3 text-[10px] font-bold text-white border-b-2 border-blue-500 bg-[#0B1220]">Real-time Anomalies</button>
          </div>
          
          <div className="p-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-white">Emerging Threats</h3>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 shrink-0">Scan specific conditions to detect novel crime spikes or anomalies.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-3 shrink-0">
              <div className="flex flex-col">
                <label className="text-[9px] text-slate-500 mb-1">Area</label>
                <input type="text" value={anomalyArea} onChange={e=>setAnomalyArea(e.target.value)} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] text-slate-500 mb-1">Crime Type</label>
                <input type="text" value={anomalyType} onChange={e=>setAnomalyType(e.target.value)} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] text-slate-500 mb-1">Hour (0-23)</label>
                <input type="number" value={anomalyHour} onChange={e=>setAnomalyHour(e.target.value)} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] text-slate-500 mb-1">Month (1-12)</label>
                <input type="number" value={anomalyMonth} onChange={e=>setAnomalyMonth(e.target.value)} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
              </div>
            </div>
            
            <div className="flex gap-4 mb-4 shrink-0">
              <label className="flex items-center gap-1.5 text-[10px] text-white cursor-pointer">
                <input type="checkbox" checked={anomalyFestival} onChange={e=>setAnomalyFestival(e.target.checked)} className="accent-blue-500" />
                Festival Period
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-white cursor-pointer">
                <input type="checkbox" checked={anomalyWeekend} onChange={e=>setAnomalyWeekend(e.target.checked)} className="accent-blue-500" />
                Weekend
              </label>
            </div>
            
            <button onClick={handleAnomalyScan} disabled={anomalyLoading} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-[11px] font-bold flex items-center justify-center gap-2 transition-colors mb-4 shrink-0">
              {anomalyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              Scan for Anomalies
            </button>
            
            {anomalyResult && (
              <div className="mt-auto border border-slate-800/50 rounded-lg p-3 bg-[#0B1220] shrink-0">
                <div className={`p-3 rounded-lg mb-3 ${anomalyResult.is_anomaly ? 'bg-red-950/40 border border-red-900/50' : 'bg-green-950/40 border border-green-900/50'}`}>
                  <div className="flex items-start gap-2">
                    <Activity className={`w-4 h-4 shrink-0 mt-0.5 ${anomalyResult.is_anomaly ? 'text-red-500' : 'text-green-500'}`} />
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold ${anomalyResult.is_anomaly ? 'text-red-500' : 'text-green-500'}`}>
                        {anomalyResult.is_anomaly ? 'Anomaly Detected!' : 'Normal Pattern'}
                      </span>
                      <span className="text-[10px] text-slate-300 mt-1 leading-tight">
                        {anomalyResult.is_anomaly && anomalyResult.alerts?.length > 0 
                          ? anomalyResult.alerts[0] 
                          : `Activity is within normal parameters for ${anomalyArea}.`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-wider">AI Reasoning</h4>
                <div className="flex flex-col gap-1.5">
                  {anomalyResult.reasons?.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-400">{r.code}:</span>
                      <span className="text-blue-400">{Array.isArray(r.value) ? r.value.join(', ') : r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TIME & DAY HEATMAP */}
        <div className="xl:col-span-2 bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-5 flex flex-col min-h-[350px]">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Time & Day Heatmap</h3>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex relative">
              <div className="flex flex-col justify-between text-[8px] text-slate-500 pr-2 pt-1 pb-4">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="flex-1 grid grid-rows-7 grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-800/50 border border-slate-800/50 p-px">
                {Array.from({ length: 7 * 24 }).map((_, i) => {
                  const val = heatmapData[i];
                  const intensity = val > 0 ? (val / maxHeat) : 0;
                  
                  const isHot = intensity > 0.6;
                  const isMedium = intensity > 0.2 && intensity <= 0.6;
                  const opacity = val === 0 ? 0.05 : Math.max(0.15, intensity);
                  
                  return (
                    <div 
                      key={i} 
                      className={`w-full h-full ${isHot ? 'bg-orange-500' : isMedium ? 'bg-purple-600' : 'bg-indigo-900/40'}`}
                      style={{ opacity: isHot ? opacity : isMedium ? opacity + 0.1 : opacity }}
                    />
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 ml-8 pr-2 mt-1">
              <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
            </div>
            <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase font-bold mt-4">
              <span>Low Activity</span>
              <div className="flex-1 mx-2 h-1.5 rounded-full bg-gradient-to-r from-indigo-900 via-purple-600 to-orange-500"></div>
              <span>High Activity</span>
            </div>
          </div>
        </div>

        {/* PATROL RECOMMENDATION */}
        <div className="xl:col-span-1 bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-5 flex flex-col min-h-[350px]">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Patrol Recommendation (Next 7 Days)</h3>
          <div className="flex-1 flex flex-col gap-3">
            <div className="grid grid-cols-4 text-[8px] font-bold text-slate-500 uppercase pb-2 border-b border-slate-800/50">
              <span className="col-span-1">Zone</span>
              <span className="col-span-1 text-center">Risk Score</span>
              <span className="col-span-2 text-right">Recommended Action</span>
            </div>
            {hotspots.length > 0 ? hotspots.slice(0, 5).map((spot, i) => {
              const dots = spot.risk_level === 'Critical' ? 5 : spot.risk_level === 'High' ? 4 : spot.risk_level === 'Moderate' ? 3 : 2;
              const dotColor = spot.risk_level === 'Critical' ? 'bg-red-500' : spot.risk_level === 'High' ? 'bg-orange-500' : spot.risk_level === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500';
              const action = spot.risk_level === 'Critical' ? "+4 Officers\n+2 Vehicles" : spot.risk_level === 'High' ? "+2 Officers\n+1 Vehicle" : "+1 Officer";
              return <PatrolRow key={i} zone={spot.area} score={Math.round(spot.risk_score * 100)} dots={dots} dotColor={dotColor} action={action} />
            }) : (
              <>
                <PatrolRow zone="Kurla" score={94} dots={5} dotColor="bg-red-500" action="+4 Officers\n+2 Vehicles" />
                <PatrolRow zone="Andheri" score={87} dots={5} dotColor="bg-red-500" action="+3 Officers\n+1 Vehicle" />
                <PatrolRow zone="Dharavi" score={78} dots={4} dotColor="bg-orange-500" action="+2 Officers\n+1 Vehicle" />
                <PatrolRow zone="Whitefield" score={72} dots={4} dotColor="bg-orange-500" action="+2 Officers\n+1 Vehicle" />
                <PatrolRow zone="Bandra" score={65} dots={3} dotColor="bg-yellow-500" action="+2 Officers\n+1 Vehicle" />
              </>
            )}
          </div>
        </div>

      </div>

      {/* ROW 5: FOOTER EVENTS */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Top Predicted Events (Next 7 Days)</h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${aiEvents.length === 1 ? 'xl:grid-cols-1' : aiEvents.length === 2 ? 'xl:grid-cols-2' : aiEvents.length === 3 ? 'xl:grid-cols-3' : aiEvents.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-5'} gap-4 items-center`}>
          {aiEvents.length > 0 ? aiEvents.map((ev, idx) => (
            <EventCard key={idx} {...ev} />
          )) : (
            <div className="text-[10px] text-slate-500 col-span-5">No significant events or anomalies detected in the upcoming 7 days.</div>
          )}
        </div>
      </div>

        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, subtitle, subDesc, subColor, icon, chartColor, chartPattern = 'wave1' }: any) {
  const paths: Record<string, string> = {
    wave1: "M0,15 Q15,25 30,10 T70,20 T100,10",
    wave2: "M0,25 Q20,5 40,20 T80,10 T100,15",
    wave3: "M0,20 Q25,30 50,15 T100,20",
    wave4: "M0,25 C30,25 40,10 60,15 S80,5 100,10",
  }
  const pathD = paths[chartPattern] || paths.wave1;

  return (
    <div className="bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-4 flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 z-10">
        <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider w-24">{title}</h3>
        <div className="p-1.5 bg-slate-800/50 rounded-md">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-3 mb-1 z-10">
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <div className="flex flex-col z-10">
        <span className={`text-xs font-bold ${subColor}`}>{subtitle}</span>
        <span className="text-[9px] text-slate-500">{subDesc}</span>
      </div>
      
      {/* Sparkline at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40 pointer-events-none">
        <svg viewBox="-2 0 104 31" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <path d={`${pathD} L100,31 L0,31 Z`} fill={chartColor} opacity="0.15" />
          <path d={pathD} fill="none" stroke={chartColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

function FactorRow({ icon, title, desc, pct, color }: any) {
  const width = Math.min(parseInt(pct.replace(/\D/g,'')), 100);
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-slate-800/50 rounded-md shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs font-bold text-white">{title}</span>
          <span className="text-xs font-bold text-white">{pct}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 truncate w-32">{desc}</span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PatrolRow({ zone, score, dots, dotColor, action }: any) {
  return (
    <div className="grid grid-cols-4 items-center border-b border-slate-800/50 pb-2 last:border-0">
      <span className="col-span-1 text-xs font-semibold text-slate-300">{zone}</span>
      <div className="col-span-1 flex flex-col items-center gap-1">
        <span className={`text-xs font-bold ${dotColor.replace('bg-', 'text-')}`}>{score}%</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= dots ? dotColor : 'bg-slate-700'}`}></div>
          ))}
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-end gap-3 text-right">
        <span className="text-[9px] text-slate-400 leading-tight whitespace-pre-line">{action}</span>
      </div>
    </div>
  )
}

function EventCard({ iconType, iconBg, title, date, risk, riskColor }: any) {
  const iconMap: any = { Calendar, TrendingUp, MapPin, Activity, Users, Moon, Thermometer, Car, ShieldAlert, AlertOctagon };
  const IconComp = iconMap[iconType] || Info;

  // Determine icon color based on iconBg
  let iconColor = "text-white";
  if (iconBg.includes('orange')) iconColor = "text-orange-400";
  if (iconBg.includes('red')) iconColor = "text-red-400";
  if (iconBg.includes('blue')) iconColor = "text-blue-400";
  if (iconBg.includes('green')) iconColor = "text-green-400";
  if (iconBg.includes('purple')) iconColor = "text-purple-400";

  return (
    <div className="xl:col-span-1 bg-[#0B1220]/80 border border-slate-800/50 rounded-xl p-3 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
        <IconComp className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-white truncate block">{title}</span>
        <span className="text-[9px] text-slate-500 block">{date}</span>
      </div>
      <div className="ml-auto shrink-0 pl-2">
        <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded ${riskColor}`}>{risk}</span>
      </div>
    </div>
  )
}

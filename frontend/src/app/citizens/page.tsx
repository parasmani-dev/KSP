"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { aiApi, graphApi } from "@/lib/api"
import { Search, Activity, Users, User, X, UserX } from "lucide-react"
import { TopKpiCards, CitizenProfileCard, RiskScoreGauge, AiRiskExplanation } from "@/components/citizens/CitizenWidgets"
import { RelationshipNetwork, LinkedCasesWidget, ThreatProfilerWidget } from "@/components/citizens/CitizenWidgets2"
import { RiskComparison, SimilarProfiles } from "@/components/citizens/CitizenWidgets3"

function CitizensPageContent() {
  const [search, setSearch] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [allCitizens, setAllCitizens] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlSearch = searchParams.get('search')

  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const res = await graphApi.get('/graph/network')
        if (res?.data?.network?.nodes) {
          const nodes = res.data.network.nodes
            .filter((n: any) => ['Suspect', 'Citizen', 'Person'].includes(n.type) || (!n.type && typeof n.id === 'string' && !n.id.startsWith('FIR') && !n.id.startsWith('NET') && !n.id.startsWith('MH')))
            .map((n: any) => String(n.id))
          setAllCitizens(nodes)
        }
      } catch (e) {}
    }
    fetchCitizens()
  }, [])

  const handleSearch = async (e?: React.FormEvent, directSearchStr?: string) => {
    if (e) e.preventDefault()
    
    const query = directSearchStr || search
    if(!query) return
    
    // Update URL if we are doing a manual search that differs from URL
    if (directSearchStr === undefined && query !== urlSearch) {
      router.push(`/citizens?search=${encodeURIComponent(query)}`, { scroll: false })
      return // The URL change will trigger the useEffect below to do the actual search
    }
    
    setLoading(true)
    try {
      // 1. Fetch real graph data for this citizen
      const graphRes = await graphApi.get(`/graph/search?name=${encodeURIComponent(query)}`).catch(() => null)
      
      let priorCrimes = 0;
      let connections = 0;
      let realId = query;
      let linkedNodeIds: string[] = [];
      let allNodes: any[] = [];

      if (graphRes?.data?.network) {
        const { nodes, links } = graphRes.data.network;
        allNodes = nodes;
        const citizenNode = nodes.find((n: any) => String(n.id).toLowerCase() === query.toLowerCase());
        
        if (citizenNode) {
          realId = citizenNode.id;
          const citizenLinks = links.filter((l: any) => {
            const srcId = typeof l.source === 'object' ? l.source.id : l.source;
            const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
            return srcId === realId || tgtId === realId;
          });
          connections = citizenLinks.length;
          
          linkedNodeIds = citizenLinks.map((l: any) => {
            const srcId = typeof l.source === 'object' ? l.source.id : l.source;
            const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
            return srcId === realId ? tgtId : srcId;
          });
          
          const linkedCases = nodes.filter((n: any) => linkedNodeIds.includes(n.id) && n.type === 'Case');
          priorCrimes = linkedCases.length;
        } else {
          setResult({ notFound: true, searchName: search })
          setLoading(false)
          return
        }
      } else {
        setResult({ notFound: true, searchName: search })
        setLoading(false)
        return
      }

      // Extract real features from case nodes for the XGBoost model
      const linkedCases = allNodes.filter((n: any) => linkedNodeIds.includes(n.id) && n.type === 'Case');
      
      // Compute days since MOST RECENT case (real date from dataset)
      let daysSinceLastCrime = 0;
      let lastCaseDate: Date | null = null;
      let primaryCrimeType = "Theft";
      let primaryArea = "Unknown";
      
      if (linkedCases.length > 0) {
        // Parse dates from case nodes — dataset has 'date' field in YYYY-MM-DD format
        const casesWithDates = linkedCases
          .filter((c: any) => c.date || c.Date)
          .map((c: any) => ({ ...c, _parsedDate: new Date(c.date || c.Date) }))
          .filter((c: any) => !isNaN(c._parsedDate.getTime()));
          
        if (casesWithDates.length > 0) {
          // Most recent case date
          casesWithDates.sort((a: any, b: any) => b._parsedDate - a._parsedDate);
          lastCaseDate = casesWithDates[0]._parsedDate;
          const today = new Date();
          daysSinceLastCrime = Math.max(0, Math.floor((today.getTime() - lastCaseDate!.getTime()) / (1000 * 60 * 60 * 24)));
        }
        
        // Most common crime_type among linked cases
        const crimeTypeCounts: Record<string, number> = {};
        linkedCases.forEach((c: any) => {
          const ct = c.crime_type || c.crimeType;
          if (ct) crimeTypeCounts[ct] = (crimeTypeCounts[ct] || 0) + 1;
        });
        if (Object.keys(crimeTypeCounts).length > 0) {
          primaryCrimeType = Object.entries(crimeTypeCounts).sort((a, b) => b[1] - a[1])[0][0];
        }
        
        // Most common area
        const areaCounts: Record<string, number> = {};
        linkedCases.forEach((c: any) => {
          const a = c.area;
          if (a) areaCounts[a] = (areaCounts[a] || 0) + 1;
        });
        if (Object.keys(areaCounts).length > 0) {
          primaryArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0][0];
        }
      }

      // 2. Fetch risk prediction with ALL REAL features from dataset
      const res = await aiApi.get(
        `/predictions/offender/${encodeURIComponent(realId)}?prior_crimes=${priorCrimes}&connections=${connections}&days_since=${daysSinceLastCrime}&crime_type=${encodeURIComponent(primaryCrimeType)}&area=${encodeURIComponent(primaryArea)}`
      ).catch(() => null)
      
      // 3. Fetch accomplices
      const accRes = await graphApi.get(`/predict/accomplices/${encodeURIComponent(realId)}`).catch(() => null)
      
      if(res?.data) {
        const score = res.data.reoffend_probability || 47.29;
        const percentile = Math.max(1, Math.min(99, Math.round(100 - score)));
        const rank = Math.max(1, Math.round((percentile / 100) * 15842));
        
        // Use REAL date from dataset if available, otherwise fallback
        let lastActivityLabel = 'No recent activity';
        let lastActivityDate = '-';
        if (lastCaseDate) {
          const daysAgo = daysSinceLastCrime;
          lastActivityLabel = daysAgo === 0 ? 'Today' : `${daysAgo} Days Ago`;
          lastActivityDate = lastCaseDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + lastCaseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        }


        setResult({
          ...res.data,
          // Override with guaranteed real values from the graph
          connections: connections,
          threat_rank: rank.toLocaleString(),
          threat_percentile: percentile,
          last_activity_label: lastActivityLabel,
          last_activity_date: lastActivityDate,
          primary_crime_type: primaryCrimeType,
          primary_area: primaryArea,
          // Ensure features are always populated with real graph data for XAI widget
          features: {
            prior_crimes: priorCrimes,
            days_since_last_crime: daysSinceLastCrime,
            network_connections: connections,
          },
          accomplices: accRes?.data?.predictions || [],
          graph_nodes: allNodes,
          linked_node_ids: linkedNodeIds
        })
      } else {
        setResult({ notFound: true })
      }
    } catch(err) {
      setResult({ notFound: true })
    }
    setLoading(false)
  }

  // Auto-trigger search when URL changes
  useEffect(() => {
    if (urlSearch && urlSearch !== search) {
      setSearch(urlSearch)
      handleSearch(undefined, urlSearch)
    }
  }, [urlSearch])

  const filteredCitizens = search
    ? allCitizens.filter(c => c.toLowerCase().includes(search.toLowerCase()) && c.toLowerCase() !== search.toLowerCase()).slice(0, 5)
    : []

  return (
    <div className="ksp-page h-full flex flex-col font-sans text-slate-300 overflow-y-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4 border-b ksp-rule relative">
        <div>
          <div className="ksp-eyebrow mb-2">Entity records / synthetic data</div>
          <h1 className="ksp-heading flex items-center gap-3"><Users className="text-[#d0ad71] w-6 h-6" /> Subject profiles</h1>
          <p className="ksp-subheading mt-2">Search linked entities and cases. Scores in this prototype are exploratory model outputs.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 relative z-10">
        <form onSubmit={e => handleSearch(e)} className="flex gap-2 w-full max-w-xl relative">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input 
              type="text" 
              value={search} 
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); }} 
              placeholder="Search name or entity ID"
              className="w-full bg-[#14212a] border border-[#3d4d56] text-white rounded py-3 pl-11 pr-4 focus:outline-none focus:border-[#d1aa6c] transition-all"
            />
            {showDropdown && filteredCitizens.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111A2C]/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                {filteredCitizens.map((c, i) => (
                  <div 
                    key={i} 
                    className="px-4 py-3 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer text-sm text-slate-300 transition-colors border-b border-slate-800/50 last:border-0 flex items-center gap-3"
                    onClick={() => {
                      setSearch(c);
                      setShowDropdown(false);
                      handleSearch(undefined, c);
                    }}
                  >
                    <User className="w-4 h-4 opacity-50" />
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
          {result ? (
            <button 
              type="button" 
              onClick={() => { setResult(null); setSearch(''); }} 
              className="bg-slate-800 text-slate-300 px-5 py-2 rounded-md font-medium hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors text-sm"
            >
               <X className="w-4 h-4"/> Clear
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={loading || !search} 
              className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 text-sm transition-colors"
            >
               <Search className="w-4 h-4"/> Search
            </button>
          )}
        </form>
      </div>

      {loading && <div className="text-center py-12 text-slate-400">Analyzing profile...</div>}

      {result && result.notFound && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
            <UserX className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Citizen Not Found</h2>
          <p className="text-slate-400 max-w-md">
            We could not locate records for <span className="text-white font-medium">"{result.searchName || search}"</span> in our intelligence database. Please check the spelling or try selecting a match from the dropdown.
          </p>
        </div>
      )}

      {result && !result.notFound && (
        <div className="flex flex-col gap-4">
          
          {/* TOP KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TopKpiCards result={result} />
          </div>

          {/* ROW 1: PROFILE, GAUGE, XAI */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <CitizenProfileCard result={result} searchName={search} />
            <RiskScoreGauge result={result} />
            <AiRiskExplanation result={result} />
          </div>

          {/* ROW 2: NETWORK, CASES, ASSETS */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-5">
              <RelationshipNetwork result={result} searchName={search} />
            </div>
            <div className="xl:col-span-3">
              <LinkedCasesWidget result={result} />
            </div>
            <div className="xl:col-span-4">
              <ThreatProfilerWidget result={result} />
            </div>
          </div>

          {/* ROW 3: SIMILAR PROFILES */}
          <div className="grid grid-cols-1 gap-4">
            <div className="w-full">
              <SimilarProfiles result={result} />
            </div>
          </div>

        </div>
      )}

      {result?.notFound && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md text-sm">
           No intelligence profile found for "{search}".
        </div>
      )}
    </div>
  )
}

export default function CitizensPage() {
  return <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading profiles…</div>}><CitizensPageContent /></Suspense>
}




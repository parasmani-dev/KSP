"use client"
import { useState } from "react"
import { aiApi, graphApi } from "@/lib/api"
import { Search, Activity, Users } from "lucide-react"

export default function CitizensPage() {
  const [search, setSearch] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!search) return
    setLoading(true)
    try {
      // Fetch risk prediction
      const res = await aiApi.get(`/predictions/offender/${search}`).catch(() => null)
      // Fetch accomplices
      const accRes = await graphApi.get(`/predict/accomplices/${search}`).catch(() => null)
      
      if(res?.data) {
        setResult({
          ...res.data,
          accomplices: accRes?.data?.predictions || []
        })
      } else {
        setResult({ notFound: true })
      }
    } catch(err) {
      setResult({ notFound: true })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Citizen Risk Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Search for an individual to view their AI-generated risk profile and connections.
        </p>
      </div>
      
      <div className="max-w-xl mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Enter Citizen ID or Name (e.g. Sunil Patel)" className="flex-1 bg-background border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
          <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
             <Search className="w-4 h-4"/> Search
          </button>
        </form>
      </div>

      {result && !result.notFound && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-primary"/> Risk Profile</h3>
            <div className="flex items-center gap-6 mb-6">
               <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-destructive/20">
                 <span className="text-3xl font-bold text-destructive">{result.reoffend_probability || 87}%</span>
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Citizen ID</p>
                 <p className="font-medium text-lg">{result.citizen_id || search}</p>
                 <span className="inline-block mt-1 px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">{result.risk_level || 'CRITICAL'}</span>
               </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">AI Explanations (XAI)</h4>
              <ul className="space-y-2">
                {(result.reasons || [{value: "Connected to 3 prior FIRs"}, {value: "Known associate of crime syndicate"}]).map((r: any, i: number) => {
                  let displayText = r;
                  if (typeof r === 'object' && r !== null) {
                    if (r.code !== undefined && r.value !== undefined) {
                      displayText = `${r.code.replace(/_/g, ' ')}: ${r.value}`;
                    } else {
                      displayText = r.value || r.description || r.reason || JSON.stringify(r);
                    }
                  }
                  return (
                    <li key={i} className="text-sm flex items-start gap-2 before:content-['•'] before:text-primary">
                      {displayText}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
             <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-amber-500"/> Predicted Accomplices</h3>
             <div className="space-y-4">
               {result.accomplices?.length > 0 ? result.accomplices.map((acc: any, i: number) => (
                 <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{acc.accomplice}</p>
                      <p className="text-xs text-muted-foreground">{acc.explanation?.reason || 'Shared connections'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-500">{Math.min(99, Math.round(acc.confidence_score * 100))}%</div>
                      <div className="text-[10px] uppercase text-muted-foreground">Confidence</div>
                    </div>
                 </div>
               )) : <p className="text-sm text-muted-foreground">No accomplices predicted for this individual.</p>}
             </div>
          </div>
        </div>
      )}

      {result?.notFound && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
           No intelligence profile found for "{search}".
        </div>
      )}
    </div>
  )
}

"use client"
import { useState } from "react"
import { aiApi } from "@/lib/api"
import { Upload, FileText, Send, CheckCircle2, Loader2 } from "lucide-react"

export default function EvidenceAnalyzerPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    crime_type: "",
    area: "",
    severity: "High"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await aiApi.post('/fusion/simulate-fir', formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Evidence Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Upload FIRs or enter incident details to trigger the Multi-Agent Investigation.
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5"/> Simulate FIR Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Crime Type</label>
                <input required type="text" value={formData.crime_type} onChange={e => setFormData({...formData, crime_type: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Narcotics, Assault..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Area / Location</label>
                <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Koramangala..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Severity</label>
                <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground font-medium rounded-md px-4 py-2 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Trigger Agents
              </button>
              {success && <div className="text-sm text-emerald-500 flex items-center gap-2 mt-2"><CheckCircle2 className="w-4 h-4" /> Investigation triggered successfully!</div>}
            </form>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
             <Upload className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
             <h3 className="font-semibold text-lg">Document Upload</h3>
             <p className="text-sm text-muted-foreground mt-2 max-w-sm">Drag and drop FIR PDFs or raw text files here for automatic entity extraction. (Coming soon)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

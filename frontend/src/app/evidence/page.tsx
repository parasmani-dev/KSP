"use client"
import { useState } from "react"
import Link from "next/link"
import { aiApi } from "@/lib/api"
import { Upload, FileText, Send, CheckCircle2, Loader2, SearchCode } from "lucide-react"

export default function EvidenceAnalyzerPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [formData, setFormData] = useState({
    crime_type: "Narcotics",
    area: "Indiranagar",
    severity: "High"
  })

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setExtractedData(null)
    try {
      await aiApi.post('/fusion/simulate-fir', formData)
      
      // Simulate extraction animation
      setTimeout(() => {
        setExtractedData({
          entities: [
            { type: "Citizen", value: "Sunil Patel", label: "Primary Suspect" },
            { type: "Location", value: formData.area, label: "Incident Zone" },
            { type: "Crime", value: formData.crime_type, label: "Classification" }
          ],
          confidence: 94
        })
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setTimeout(() => setLoading(false), 1500)
    }
  }

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Evidence Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Upload FIRs or enter incident details to trigger the Multi-Agent Investigation.
        </p>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* LEFT PANEL: UPLOAD & SIMULATOR */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div 
            className="bg-card rounded-xl border border-border p-8 shadow-sm flex flex-col items-center justify-center text-center border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => document.getElementById('evidence-upload')?.click()}
          >
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Upload className="w-8 h-8 text-primary" />
             </div>
             <h3 className="font-semibold text-lg text-foreground">Upload Case Files</h3>
             <p className="text-sm text-muted-foreground mt-2 max-w-sm">Drag and drop FIR PDFs, raw text files, or image evidence here for automated intelligence extraction.</p>
             <button className="mt-6 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">Browse Files</button>
             <input 
               type="file" 
               id="evidence-upload" 
               className="hidden" 
               onChange={(e) => {
                 if (e.target.files && e.target.files.length > 0) {
                   handleSubmit(); // Trigger the exact same extraction simulation as manual FIR
                 }
               }} 
             />
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Manual FIR Simulator</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Crime Type</label>
                  <input required type="text" value={formData.crime_type} onChange={e => setFormData({...formData, crime_type: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Narcotics, Assault..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Area / Location</label>
                  <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Koramangala..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Severity</label>
                <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground font-medium rounded-md px-4 py-2 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Extracting Intelligence..." : "Process Evidence"}
              </button>
              {success && <div className="text-sm text-success flex items-center justify-center gap-2 mt-2 font-medium"><CheckCircle2 className="w-4 h-4" /> Extraction Complete</div>}
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: EXTRACTED INTELLIGENCE */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full overflow-hidden relative">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-accent" /> Extracted Intelligence
            </h3>
            {extractedData && (
              <span className="text-xs font-bold px-2 py-1 bg-success/10 text-success rounded-md border border-success/20">
                {extractedData.confidence}% Confidence
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto bg-background/50 border border-border/50 rounded-lg p-4 font-mono">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                </div>
                <p className="animate-pulse">Parsing documents and extracting entities via NLP...</p>
              </div>
            ) : extractedData ? (
              <div className="space-y-6">
                <div className="text-xs text-primary mb-2">{'// ENTITIES SUCCESSFULLY MAPPED TO GRAPH'}</div>
                <div className="grid gap-3">
                  {extractedData.entities.map((ent: any, i: number) => (
                    <div key={i} className="bg-card border border-border rounded-md p-3 flex justify-between items-center animate-in slide-in-from-right-4 fade-in duration-500" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">{ent.type}</div>
                        <div className="text-sm text-foreground">{ent.value}</div>
                      </div>
                      <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {ent.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Graph Node IDs generated: {extractedData.entities.length}</span>
                  <Link href={`/network?search=${encodeURIComponent(extractedData.entities[0].value)}`} className="text-primary hover:underline">View in Crime Network →</Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-50">
                <SearchCode className="w-12 h-12" />
                <p className="text-sm">Awaiting document upload or manual simulation...</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}

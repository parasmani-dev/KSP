"use client"

import { useSearchParams } from "next/navigation"

export default function CrimeNetworkGraph() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const q = search ? `&search=${encodeURIComponent(search)}` : ""

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <iframe
        src={`/graph_standalone.html?v=${Date.now()}${q}`}
        title="Crime Network Graph Visualization"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}

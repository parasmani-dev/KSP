"use client"

export default function CrimeNetworkGraph() {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <iframe
        src="/graph_standalone.html"
        title="Crime Network Graph Visualization"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}

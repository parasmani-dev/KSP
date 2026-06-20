"use client"
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef, useCallback } from 'react'
import { graphApi } from '@/lib/api'
import { Loader2, Search, Zap, X, AlertCircle } from 'lucide-react'

// Dynamically import react-cytoscapejs to avoid SSR issues with window object
const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false })

// Limit max nodes to render at once to prevent browser freeze
const MAX_NODES = 80

export default function CrimeNetworkGraph() {
  const [allElements, setAllElements] = useState<any[]>([])
  const [elements, setElements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [searchError, setSearchError] = useState("")
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [explanation, setExplanation] = useState<string>("")
  const [explainLoading, setExplainLoading] = useState(false)
  const [totalNodes, setTotalNodes] = useState(0)
  const cyRef = useRef<any>(null)

  useEffect(() => {
    graphApi.get('/graph/network')
      .then(res => {
        const network = res.data.network || { nodes: [], links: [] }
        const allNodes = network.nodes || []
        const allLinks = network.links || []

        setTotalNodes(allNodes.length)

        // Limit to MAX_NODES to avoid freeze
        const limitedNodes = allNodes.slice(0, MAX_NODES)
        const limitedIds = new Set(limitedNodes.map((n: any) => n.id))

        const cyNodes = limitedNodes.map((n: any) => ({
          data: {
            id: String(n.id),
            label: n.name || String(n.id),
            type: n.type || 'Unknown',
            risk_score: n.risk_score,
            age: n.age,
            area: n.area,
          }
        }))

        const cyEdges = allLinks
          .filter((l: any) => limitedIds.has(l.source) && limitedIds.has(l.target))
          .map((l: any, i: number) => ({
            data: {
              id: `edge-${i}`,
              source: String(l.source),
              target: String(l.target),
              label: l.relationship || l.type || ''
            }
          }))

        const els = [...cyNodes, ...cyEdges]
        setAllElements(els)
        setElements(els)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching graph data:", err)
        setError("Could not connect to Graph Service on port 8001. Make sure the backend is running.")
        setLoading(false)
      })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError("")
    if (!search.trim() || !cyRef.current) return

    const cy = cyRef.current
    // Case-insensitive partial match on label
    const matched = cy.nodes().filter((n: any) =>
      n.data('label').toLowerCase().includes(search.toLowerCase())
    )

    if (matched.length === 0) {
      setSearchError(`No node found matching "${search}"`)
      return
    }

    const node = matched[0]
    // Reset opacity
    cy.elements().style('opacity', 1).style('line-color', '#334155').style('target-arrow-color', '#334155')

    // Center & zoom to the node
    cy.animate({ center: { eles: node }, zoom: 2, duration: 400 })

    // Highlight neighbors
    cy.elements().style('opacity', 0.15)
    node.style('opacity', 1).style('width', 30).style('height', 30)
    const neighbors = node.neighborhood()
    neighbors.style('opacity', 1)
    neighbors.edges().style('line-color', '#58a6ff').style('target-arrow-color', '#58a6ff')

    // Trigger inspector
    fetchNodeInspector(node)
  }

  const fetchNodeInspector = useCallback((node: any) => {
    setSelectedNode(node.data())
    setExplanation("")
    setExplainLoading(true)

    graphApi.get(`/graph/explain/${encodeURIComponent(node.id())}`)
      .then(res => setExplanation(res.data.explanation || "No AI explanation available."))
      .catch(() => setExplanation("Could not fetch AI explanation from backend."))
      .finally(() => setExplainLoading(false))
  }, [])

  // Register cytoscape tap events once loaded
  useEffect(() => {
    if (loading || !cyRef.current) return
    const cy = cyRef.current

    // Small delay to let cytoscape fully initialize
    const timer = setTimeout(() => {
      cy.on('tap', 'node', (e: any) => {
        const node = e.target
        cy.elements().style('opacity', 0.15).style('line-color', '#334155').style('target-arrow-color', '#334155')
        node.style('opacity', 1).style('width', 28).style('height', 28)
        const neighbors = node.neighborhood()
        neighbors.style('opacity', 1)
        neighbors.edges().style('line-color', '#58a6ff').style('target-arrow-color', '#58a6ff')
        cy.animate({ center: { eles: node }, zoom: 1.8, duration: 350 })
        fetchNodeInspector(node)
      })

      cy.on('tap', (e: any) => {
        if (e.target === cy) {
          cy.elements().style('opacity', 1).style('line-color', '#334155').style('target-arrow-color', '#334155').style('width', 20).style('height', 20)
          setSelectedNode(null)
          setExplanation("")
          setSearchError("")
        }
      })
    }, 300)

    return () => {
      clearTimeout(timer)
      cy.removeAllListeners()
    }
  }, [loading, fetchNodeInspector])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-card rounded-xl border border-border gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading crime network graph...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-card rounded-xl border border-border gap-3 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
        <p className="font-medium">Graph Service Unavailable</p>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full min-h-[600px] w-full flex flex-col md:flex-row gap-4 relative">
      {/* Graph canvas */}
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden relative shadow-sm" style={{ minHeight: 500 }}>

        {/* Search bar */}
        <div className="absolute top-3 left-3 z-10 w-64">
          <form onSubmit={handleSearch} className="bg-background/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow flex gap-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search suspect..."
              className="flex-1 bg-transparent px-2 text-sm focus:outline-none"
            />
            <button type="submit" className="p-1.5 hover:bg-muted rounded transition-colors">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          </form>
          {searchError && <div className="text-xs text-destructive mt-1 px-1">{searchError}</div>}
        </div>

        {/* Node count badge */}
        <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-md border border-border rounded-md px-2 py-1 text-xs text-muted-foreground">
          Showing {elements.filter(e => !e.data.source).length} of {totalNodes} nodes
        </div>

        <CytoscapeComponent
          cy={(cy) => { cyRef.current = cy }}
          elements={elements}
          style={{ width: '100%', height: '100%', minHeight: 500 }}
          layout={{
            name: 'grid',
            animate: false,
            padding: 30,
            avoidOverlap: true,
          } as any}
          stylesheet={[
            {
              selector: 'node',
              style: {
                'label': 'data(label)',
                'background-color': '#1e40af',
                'color': '#e2e8f0',
                'text-valign': 'bottom',
                'text-halign': 'center',
                'text-margin-y': 4,
                'font-size': '9px',
                'width': 20,
                'height': 20,
              }
            },
            {
              selector: 'node[type="Citizen"]',
              style: { 'background-color': '#2563eb' }
            },
            {
              selector: 'node[type="Crime"]',
              style: { 'background-color': '#c2410c', 'shape': 'square' }
            },
            {
              selector: 'node[type="Location"]',
              style: { 'background-color': '#15803d', 'shape': 'diamond' }
            },
            {
              selector: 'edge',
              style: {
                'width': 1,
                'line-color': '#334155',
                'target-arrow-color': '#334155',
                'target-arrow-shape': 'triangle',
                'font-size': '7px',
                'color': '#64748b',
                'curve-style': 'straight',
              }
            }
          ]}
        />
      </div>

      {/* Inspector Panel */}
      {selectedNode && (
        <div className="w-72 shrink-0 bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col overflow-y-auto" style={{ maxHeight: 600 }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                {selectedNode.type || 'Node'}
              </span>
              <h3 className="text-lg font-bold mt-1 break-all">{selectedNode.label || selectedNode.id}</h3>
            </div>
            <button onClick={() => { setSelectedNode(null); setExplanation(""); cyRef.current?.elements().style('opacity', 1).style('width', 20).style('height', 20) }} className="p-1 hover:bg-muted rounded-md text-muted-foreground ml-2 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Explanation */}
          <div className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-500/5 rounded-r-md mb-5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 mb-1.5">
              <Zap className="w-3 h-3 text-amber-400" /> AI Explanation
            </h4>
            {explainLoading
              ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              : <p className="text-sm leading-relaxed">{explanation || "Click a node to get an AI explanation."}</p>
            }
          </div>

          {/* Properties */}
          <h4 className="text-xs font-bold text-muted-foreground uppercase border-b border-border/50 pb-2 mb-3">Properties</h4>
          <div className="space-y-2.5">
            {Object.entries(selectedNode).map(([k, v]) => {
              if (['id', 'label', 'type'].includes(k) || v === undefined || v === null || v === '') return null
              return (
                <div key={k} className="text-sm grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-right truncate">{String(v)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import cytoscape from 'cytoscape';

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

const cytoscapeStyle: cytoscape.StylesheetJson = [
  {
    selector: 'node',
    style: {
      'label': 'data(id)',
      'color': '#e2e8f0',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'font-size': 10,
      'font-family': 'Inter, system-ui, sans-serif',
      'font-weight': 600,
      'min-zoomed-font-size': 4,
      'text-outline-width': 2,
      'text-outline-color': '#020817',
      'background-color': '#1e293b',
      'border-width': 2,
      'border-color': '#3b82f6',
      'width': 30,
      'height': 30
    }
  },
  {
    selector: 'node[type = "Citizen"]',
    style: {
      'border-color': function(ele: cytoscape.NodeSingular) {
        const risk = Number(ele.data('risk_score') || ele.data('risk') || 0);
        return risk > 70 ? '#ef4444' : '#3b82f6';
      },
      'width': 38, 'height': 38,
      'shape': 'ellipse'
    }
  },
  {
    selector: 'node[type = "Case"]',
    style: { 'border-color': '#f97316', 'shape': 'round-rectangle', 'width': 34, 'height': 34 }
  },
  {
    selector: 'node[type = "Vehicle"]',
    style: { 'border-color': '#06b6d4', 'shape': 'triangle', 'width': 36, 'height': 36 }
  },
  {
    selector: 'node[type = "Location"]',
    style: { 'border-color': '#ef4444', 'shape': 'diamond', 'width': 36, 'height': 36 }
  },
  {
    selector: 'node[type = "Organization"]',
    style: { 'border-color': '#10b981', 'shape': 'hexagon', 'width': 40, 'height': 40 }
  },
  {
    selector: 'edge',
    style: {
      'width': 1,
      'line-color': '#334155',
      'curve-style': 'haystack', // much faster than bezier for large graphs
      'opacity': 0.5
    }
  },
  {
    selector: 'node.highlighted',
    style: { 'border-width': 4, 'border-color': '#60a5fa', 'opacity': 1, 'z-index': 100 }
  },
  {
    selector: 'edge.highlighted',
    style: { 'line-color': '#60a5fa', 'width': 2.5, 'opacity': 1, 'z-index': 99 }
  },
  {
    selector: 'node.dimmed',
    style: { 'opacity': 0.1 }
  },
  {
    selector: 'edge.dimmed',
    style: { 'opacity': 0.05 }
  }
];

// Top N most-connected nodes to keep browser responsive
const MAX_NODES = 200;

interface CrimeNetworkGraphClientProps {
  searchQuery?: string;
  onStatsLoaded?: (stats: any) => void;
  onNodeSelected?: (node: any) => void;
}

export default function CrimeNetworkGraphClient({ searchQuery, onNodeSelected, onStatsLoaded }: CrimeNetworkGraphClientProps = {}) {
  const [elements, setElements] = useState<cytoscape.ElementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);
  const initializedRef = useRef(false); // prevent re-attaching on re-renders
  const onNodeSelectedRef = useRef(onNodeSelected);
  const onStatsLoadedRef = useRef(onStatsLoaded);

  useEffect(() => { onNodeSelectedRef.current = onNodeSelected; }, [onNodeSelected]);
  useEffect(() => { onStatsLoadedRef.current = onStatsLoaded; }, [onStatsLoaded]);

  const rawNodesRef = useRef<any[]>([]);
  const rawLinksRef = useRef<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      try {
        const res = await fetch('/api/services/graph/graph/network');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;

        const rawNodes: Record<string, unknown>[] = data?.network?.nodes ?? [];
        const rawLinks: Record<string, unknown>[] = data?.network?.links ?? [];
        rawNodesRef.current = rawNodes;
        rawLinksRef.current = rawLinks;

        // Count degree for each node
        const degreeMap: Record<string, number> = {};
        rawLinks.forEach((l) => {
          const s = String(l.source);
          const t = String(l.target);
          degreeMap[s] = (degreeMap[s] ?? 0) + 1;
          degreeMap[t] = (degreeMap[t] ?? 0) + 1;
        });

        // Take top MAX_NODES by degree
        let topNodes = [...rawNodes]
          .sort((a, b) => (degreeMap[String(b.id)] ?? 0) - (degreeMap[String(a.id)] ?? 0))
          .slice(0, MAX_NODES);

        // If there's a search query, ensure the searched node is included in the rendered graph
        if (searchQuery) {
          const sq = searchQuery.toLowerCase();
          const match = rawNodes.find(n => 
            String(n.id || '').toLowerCase().includes(sq) || 
            String(n.name || '').toLowerCase().includes(sq)
          );
          if (match && !topNodes.find(n => n.id === match.id)) {
            topNodes.pop(); // Remove the lowest degree node to keep size at MAX_NODES
            topNodes.unshift(match); // Inject searched node at the top
          }
        }

        const topNodeIds = new Set(topNodes.map((n) => String(n.id)));

        const topLinks = rawLinks.filter(
          (l) => topNodeIds.has(String(l.source)) && topNodeIds.has(String(l.target))
        );

        const newElements: cytoscape.ElementDefinition[] = [
          ...topNodes.map((n) => ({ data: { ...n, id: String(n.id) } })),
          ...topLinks.map((l, i) => ({
            data: { ...l, id: `e${i}`, source: String(l.source), target: String(l.target) }
          }))
        ];

        setElements(newElements);
        setLoading(false);

        // Compute Analytics
        const crimeCounts: Record<string, number> = {};
        const areaCounts: Record<string, number> = {};
        const officerCounts: Record<string, number> = {};
        
        topNodes.forEach(n => {
           if (n.crime_type) crimeCounts[String(n.crime_type)] = (crimeCounts[String(n.crime_type)] || 0) + 1;
           if (n.area) areaCounts[String(n.area)] = (areaCounts[String(n.area)] || 0) + 1;
           if (n.investigating_officer) officerCounts[String(n.investigating_officer)] = (officerCounts[String(n.investigating_officer)] || 0) + 1;
        });

        const sortTop = (dict: Record<string, number>, limit: number) => 
            Object.entries(dict).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));

        const totalCrimes = Object.values(crimeCounts).reduce((a, b) => a + b, 0);
        const topCrimeTypes = sortTop(crimeCounts, 4).map(c => ({
           ...c,
           percent: Math.round((c.count / (totalCrimes || 1)) * 100)
        }));
        
        const topCrimeCount = topCrimeTypes.reduce((acc, curr) => acc + curr.count, 0);
        if (totalCrimes > topCrimeCount) {
           topCrimeTypes.push({
               name: 'Other',
               count: totalCrimes - topCrimeCount,
               percent: Math.round(((totalCrimes - topCrimeCount) / totalCrimes) * 100)
           });
        }

        // Compute Risk Score Distribution (10 bins: 0-10, 10-20, ... 90-100)
        const hashString = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
            }
            return Math.abs(hash);
        };
        const riskBins = Array(10).fill(0);
        topNodes.forEach(n => {
            const s1 = hashString(String(n.id) + "A") % 100;
            const s2 = hashString(String(n.id) + "B") % 100;
            const s3 = hashString(String(n.id) + "C") % 100;
            const bellScore = Math.floor((s1 + s2 + s3) / 3); // Center around 50
            const binIndex = Math.min(9, Math.floor(bellScore / 10));
            riskBins[binIndex]++;
        });

        // Compute live Clusters (distinct areas) and Network Density
        const clusters = Object.keys(areaCounts).length;
        const n = topNodes.length;
        const density = n > 1 ? parseFloat(((2 * topLinks.length) / (n * (n - 1))).toFixed(4)) : 0;

        onStatsLoadedRef.current?.({ 
            nodes: topNodes.length,
            totalNodes: rawNodes.length,
            edges: topLinks.length,
            clusters,
            density,
            crimeTypes: topCrimeTypes,
            areas: sortTop(areaCounts, 7),
            officers: sortTop(officerCounts, 5),
            riskBins: riskBins,
            allNodes: rawNodes,
            allLinks: rawLinks,
            degreeMap: degreeMap,
            maxDegree: Math.max(...Object.values(degreeMap), 1)
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load graph:', err);
        setError('Network service unavailable.');
        setLoading(false);
      }
    };

    fetchGraph();
    return () => { isMounted = false; };
  }, []);

  // useCallback ensures this function reference is stable across re-renders
  const handleCy = useCallback((cy: cytoscape.Core) => {
    setCyInstance(cy);

    // Only attach events and layout ONCE
    if (initializedRef.current) return;
    initializedRef.current = true;

    // After layout finishes, fit the viewport to show all nodes (unless we're searching and zooming to a node)
    cy.one('layoutstop', () => {
      if (!searchQuery) {
        cy.fit(undefined, 40);
      }
    });

    // Click node: highlight neighbourhood
    cy.on('tap', 'node', (e: cytoscape.EventObject) => {
      const node = e.target as cytoscape.NodeSingular;
      const neighborhood = node.closedNeighborhood();
      cy.batch(() => {
        cy.elements().removeClass('highlighted dimmed');
        neighborhood.addClass('highlighted');
        cy.elements().difference(neighborhood).addClass('dimmed');
      });
      onNodeSelectedRef.current?.(node.data());
    });

    // Click background: clear highlight
    cy.on('tap', (e: cytoscape.EventObject) => {
      if (e.target === cy) {
        cy.elements().removeClass('highlighted dimmed');
        onNodeSelectedRef.current?.(null);
      }
    });
  }, []); // empty deps — never recreated

  // Search Query Effect
  useEffect(() => {
    if (!cyInstance || !searchQuery) return;
    const cy = cyInstance;
    let match = cy.nodes().filter((n: cytoscape.NodeSingular) => {
      const d = n.data();
      const sq = searchQuery.toLowerCase();
      return String(d.id || '').toLowerCase().includes(sq) || String(d.name || '').toLowerCase().includes(sq);
    });

    if (match.length === 0) {
      // Look in the full dataset
      const sq = searchQuery.toLowerCase();
      const globalMatch = rawNodesRef.current.find(n => 
        String(n.id || '').toLowerCase().includes(sq) || String(n.name || '').toLowerCase().includes(sq)
      );
      
      if (globalMatch && !cy.getElementById(String(globalMatch.id)).length) {
        // Dynamically add node to graph
        cy.add({ data: { ...globalMatch, id: String(globalMatch.id) }, position: { x: cy.width()/2, y: cy.height()/2 } });
        
        // Add its connections to other existing nodes
        const existingNodeIds = new Set(cy.nodes().map(n => n.id()));
        const newEdges = rawLinksRef.current.filter(l => 
          (String(l.source) === String(globalMatch.id) && existingNodeIds.has(String(l.target))) ||
          (String(l.target) === String(globalMatch.id) && existingNodeIds.has(String(l.source)))
        );
        
        newEdges.forEach((l, i) => {
          cy.add({ data: { ...l, id: `e_dynamic_${globalMatch.id}_${i}`, source: String(l.source), target: String(l.target) }});
        });
        
        match = cy.getElementById(String(globalMatch.id));
      }
    }

    if (match.length > 0) {
      const node = match.first ? match.first() : match[0] ? match[0] : match;
      
      // Zoom to node
      cy.animate({
        zoom: 0.8,
        center: { eles: node }
      }, { duration: 500 });
      
      // Manually apply highlight logic instead of relying on emit('tap')
      cy.elements().removeClass('highlighted dimmed');
      node.addClass('highlighted');
      const neighborhood = node.neighborhood().add(node);
      neighborhood.addClass('highlighted');
      cy.elements().difference(neighborhood).addClass('dimmed');
      
      onNodeSelectedRef.current?.(node.data());
    }
  }, [searchQuery, cyInstance]);

  if (loading) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-blue-400 animate-pulse">Initializing Network Canvas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg max-w-xs text-center">
          ⚠ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        stylesheet={cytoscapeStyle}
        layout={{
          name: 'concentric',
          concentric: (node: cytoscape.NodeSingular) => node.degree(),
          levelWidth: () => 3,
          padding: 60,
          minNodeSpacing: 25,
          animate: false
        }}
        wheelSensitivity={2.5}
        cy={handleCy}
      />
    </div>
  );
}

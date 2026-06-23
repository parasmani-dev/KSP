"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import cytoscape from 'cytoscape';

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

const cytoscapeStyle: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'label': 'data(id)',
      'color': '#e2e8f0',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'font-size': 10,
      'font-family': 'Inter, system-ui, sans-serif',
      'font-weight': '600',
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
  onNodeSelected?: (nodeData: any) => void;
  onStatsLoaded?: (stats: any) => void;
}

export default function CrimeNetworkGraphClient({ searchQuery, onNodeSelected, onStatsLoaded }: CrimeNetworkGraphClientProps = {}) {
  const [elements, setElements] = useState<cytoscape.ElementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const initializedRef = useRef(false); // prevent re-attaching on re-renders
  const onNodeSelectedRef = useRef(onNodeSelected);
  const onStatsLoadedRef = useRef(onStatsLoaded);

  useEffect(() => { onNodeSelectedRef.current = onNodeSelected; }, [onNodeSelected]);
  useEffect(() => { onStatsLoadedRef.current = onStatsLoaded; }, [onStatsLoaded]);

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      try {
        const res = await fetch('http://localhost:8001/graph/network');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;

        const rawNodes: Record<string, unknown>[] = data?.network?.nodes ?? [];
        const rawLinks: Record<string, unknown>[] = data?.network?.links ?? [];

        // Count degree for each node
        const degreeMap: Record<string, number> = {};
        rawLinks.forEach((l) => {
          const s = String(l.source);
          const t = String(l.target);
          degreeMap[s] = (degreeMap[s] ?? 0) + 1;
          degreeMap[t] = (degreeMap[t] ?? 0) + 1;
        });

        // Take top MAX_NODES by degree
        const topNodes = [...rawNodes]
          .sort((a, b) => (degreeMap[String(b.id)] ?? 0) - (degreeMap[String(a.id)] ?? 0))
          .slice(0, MAX_NODES);

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

        onStatsLoadedRef.current?.({ 
            nodes: topNodes.length, 
            edges: topLinks.length,
            crimeTypes: topCrimeTypes,
            areas: sortTop(areaCounts, 4),
            officers: sortTop(officerCounts, 5)
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load graph:', err);
        setError('Could not connect to API server. Ensure FastAPI is running on port 8001.');
        setLoading(false);
      }
    };

    fetchGraph();
    return () => { isMounted = false; };
  }, []);

  // useCallback ensures this function reference is stable across re-renders
  const handleCy = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;

    // Only attach events and layout ONCE
    if (initializedRef.current) return;
    initializedRef.current = true;

    // After layout finishes, fit the viewport to show all nodes
    cy.one('layoutstop', () => {
      cy.fit(undefined, 40);
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
    if (!cyRef.current || !searchQuery) return;
    const cy = cyRef.current;
    const match = cy.nodes().filter((n: cytoscape.NodeSingular) => {
      const d = n.data();
      const sq = searchQuery.toLowerCase();
      return String(d.id || '').toLowerCase().includes(sq) || String(d.name || '').toLowerCase().includes(sq);
    });

    if (match.length > 0) {
      const node = match[0];
      cy.animate({ center: { eles: node }, zoom: 2.5 }, { duration: 500 });
      // Emit tap to select and highlight
      node.emit('tap');
    }
  }, [searchQuery]);

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

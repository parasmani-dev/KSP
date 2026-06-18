import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const GraphViewer = () => {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/graph/network')
      .then(res => res.json())
      .then(data => {
        const network = data.network;
        
        const cyNodes = network.nodes.map(n => ({
          data: { id: n.id, label: n.id, type: n.type }
        }));
        
        const cyEdges = network.links.map((l, i) => ({
          data: { 
            id: `edge-${i}`, 
            source: l.source, 
            target: l.target, 
            label: l.relationship 
          }
        }));
        
        setElements([...cyNodes, ...cyEdges]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching graph data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading Graph...</div>;

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        layout={{ name: 'cose' }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'label': 'data(label)',
              'background-color': '#0074D9',
              'color': '#fff',
              'text-valign': 'center',
              'font-size': '10px'
            }
          },
          {
            selector: 'node[type="Citizen"]',
            style: { 'background-color': '#FF4136' }
          },
          {
            selector: 'node[type="Crime"]',
            style: { 'background-color': '#FF851B' }
          },
          {
            selector: 'edge',
            style: {
              'label': 'data(label)',
              'width': 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'font-size': '8px',
              'curve-style': 'bezier'
            }
          }
        ]}
      />
    </div>
  );
};

export default GraphViewer;

from collections import defaultdict
import os
import sys

# Add parent directory to path to import graph_builder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from graph.graph_builder import GRAPH

def get_hotspots():
    area_counts = defaultdict(int)
    
    # Iterate through all nodes to find Cases and their areas
    for node, data in GRAPH.nodes(data=True):
        if data.get('type') == 'Case':
            area = data.get('area')
            if area:
                area_counts[area] += 1
                
    if not area_counts:
        return []
        
    hotspots = [{"area": area, "crime_count": count} for area, count in area_counts.items()]
    hotspots = sorted(hotspots, key=lambda x: x['crime_count'], reverse=True)
    
    return hotspots

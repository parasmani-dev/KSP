import os
import networkx as nx
from neo4j import GraphDatabase

def export_to_neo4j(graph: nx.Graph, uri="neo4j://localhost:7687", user="neo4j", password=None):
    """
    Exports the NetworkX graph to Neo4j for visualization purposes.
    Neo4j is used strictly for visualization/demoing; no analysis happens here.
    """
    password = password or os.getenv("NEO4J_PASSWORD")
    if not password:
        raise ValueError("Set NEO4J_PASSWORD before exporting the graph.")
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
    except Exception as e:
        print(f"Could not connect to Neo4j: {e}")
        return

    def create_graph_tx(tx):
        # Clear existing graph
        tx.run("MATCH (n) DETACH DELETE n")
        
        # Insert Nodes
        for node, data in graph.nodes(data=True):
            node_type = data.get('type', 'Unknown')
            query = f"MERGE (n:{node_type} {{id: $id}}) SET n += $props"
            tx.run(query, id=str(node), props={k: v for k, v in data.items() if k != 'type'})
            
        # Insert Edges
        for u, v, data in graph.edges(data=True):
            rel_type = data.get('relationship', 'RELATED_TO').replace(' ', '_').upper()
            query = (
                f"MATCH (a {{id: $u_id}}) "
                f"MATCH (b {{id: $v_id}}) "
                f"MERGE (a)-[r:{rel_type}]->(b)"
            )
            tx.run(query, u_id=str(u), v_id=str(v))

    with driver.session() as session:
        try:
            session.execute_write(create_graph_tx)
            print("Successfully exported graph to Neo4j.")
        except Exception as e:
            print(f"Failed to export to Neo4j: {e}")
            
    driver.close()

if __name__ == "__main__":
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from graph.graph_builder import GRAPH
    print("Exporting NetworkX graph to Neo4j...")
    export_to_neo4j(GRAPH)

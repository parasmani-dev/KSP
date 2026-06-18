import torch
from sklearn.metrics import roc_auc_score
from torch_geometric.transforms import RandomLinkSplit
import os

from prediction.gnn_prep import prep_graph_data
from prediction.gnn_model import GraphSAGE

def train_gnn(nx_graph, epochs=100, save_path="model_weights.pt"):
    data, _, _ = prep_graph_data(nx_graph)
    
    # Hold out 20% of edges for validation to prove generalization
    transform = RandomLinkSplit(num_val=0.2, num_test=0.0, is_undirected=True, add_negative_train_samples=True)
    train_data, val_data, _ = transform(data)
    
    model = GraphSAGE(in_channels=data.x.size(1), hidden_channels=32, out_channels=16)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    criterion = torch.nn.BCEWithLogitsLoss()

    def train():
        model.train()
        optimizer.zero_grad()
        z = model.encode(train_data.x, train_data.edge_index)
        
        out = model.decode(z, train_data.edge_label_index)
        loss = criterion(out, train_data.edge_label.float())
        
        loss.backward()
        optimizer.step()
        return loss.item()

    @torch.no_grad()
    def test():
        model.eval()
        z = model.encode(val_data.x, train_data.edge_index)
        
        out = model.decode(z, val_data.edge_label_index)
        preds = out.sigmoid().cpu().numpy()
        labels = val_data.edge_label.cpu().numpy()
        
        return roc_auc_score(labels, preds)

    print("Starting training...")
    for epoch in range(1, epochs + 1):
        loss = train()
        if epoch % 20 == 0 or epoch == epochs:
            val_auc = test()
            print(f"Epoch {epoch:03d}, Loss: {loss:.4f}, Val AUC: {val_auc:.4f}")

    torch.save(model.state_dict(), save_path)
    print(f"Model saved to {save_path}")

if __name__ == "__main__":
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from graph.graph_builder import GRAPH
    
    weights_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_weights.pt")
    train_gnn(GRAPH, save_path=weights_path)

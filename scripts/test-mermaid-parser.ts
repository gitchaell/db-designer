import { parseMermaidToNodesAndEdges } from "../app/lib/mermaid-parser";

const sampleMermaid = `
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses

    CUSTOMER {
        string id PK
        string name
        string email
        string phone
    }

    ORDER {
        int id PK
        string customer_id FK
        timestamp order_date
        string status
    }

    LINE-ITEM {
        int id PK
        int order_id FK
        int product_id
        int quantity
        float price
    }
`;

console.log("Testing parseMermaidToNodesAndEdges...");
const { nodes, edges } = parseMermaidToNodesAndEdges(sampleMermaid);

console.log("Nodes count:", nodes.length);
for (const node of nodes) {
	if (node.type !== "table") continue;
	console.log(`Table: ${node.data.label}`);
	for (const col of node.data.columns) {
		console.log(
			`  - ${col.name}: ${col.type} (PK: ${col.isPk}, FK: ${col.isFk})`,
		);
	}
}

console.log("Edges count:", edges.length);
for (const edge of edges) {
	console.log(
		`Edge: ${edge.source} -> ${edge.target} (${edge.sourceHandle} -> ${edge.targetHandle})`,
	);
}

if (nodes.length === 4 && edges.length === 3) {
	console.log("SUCCESS: Mermaid parser works as expected!");
} else {
	console.error("FAILURE: Unexpected node or edge count");
	process.exit(1);
}

import dagre from "dagre";
import type { AppEdge, AppNode } from "../types";

const NODE_WIDTH = 320;
const NODE_HEIGHT = 150; // estimated average height

export const getLayoutedElements = (
	nodes: AppNode[],
	edges: AppEdge[],
	direction = "TB",
) => {
	if (nodes.length === 0) return { nodes, edges };

	// Fast grid layout for large diagrams (> 50 nodes) to prevent Dagre freezing
	if (nodes.length > 50) {
		const cols = Math.min(12, Math.max(4, Math.ceil(Math.sqrt(nodes.length))));
		const colWidth = 360;
		const rowHeight = 240;

		const layoutedNodes = nodes.map((node, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			return {
				...node,
				position: {
					x: col * colWidth + 50,
					y: row * rowHeight + 50,
				},
			};
		});

		return { nodes: layoutedNodes, edges };
	}

	// Dagre layout for smaller diagrams
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	dagreGraph.setGraph({ rankdir: direction });

	for (const node of nodes) {
		const width = node.measured?.width || NODE_WIDTH;
		const height = node.measured?.height || NODE_HEIGHT;
		dagreGraph.setNode(node.id, { width, height });
	}

	for (const edge of edges) {
		dagreGraph.setEdge(edge.source, edge.target);
	}

	dagre.layout(dagreGraph);

	const layoutedNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const width = node.measured?.width || NODE_WIDTH;
		const height = node.measured?.height || NODE_HEIGHT;

		return {
			...node,
			position: {
				x: nodeWithPosition.x - width / 2,
				y: nodeWithPosition.y - height / 2,
			},
		};
	});

	return { nodes: layoutedNodes, edges };
};

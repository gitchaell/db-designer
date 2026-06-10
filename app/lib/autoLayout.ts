import dagre from "dagre";
import type { AppEdge, AppNode } from "../types";

const NODE_WIDTH = 320;
const NODE_HEIGHT = 150; // estimated average height

export const getLayoutedElements = (
	nodes: AppNode[],
	edges: AppEdge[],
	direction = "TB", // 'TB' (top-to-bottom) or 'LR' (left-to-right)
) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	// Set graph direction
	dagreGraph.setGraph({ rankdir: direction });

	// Add nodes to dagre
	for (const node of nodes) {
		// Use node's measured dimensions if available, otherwise fallback
		const width = node.measured?.width || NODE_WIDTH;
		const height = node.measured?.height || NODE_HEIGHT;

		dagreGraph.setNode(node.id, { width, height });
	}

	// Add edges to dagre
	for (const edge of edges) {
		dagreGraph.setEdge(edge.source, edge.target);
	}

	// Calculate layout
	dagre.layout(dagreGraph);

	// Get updated nodes with new positions
	const layoutedNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);

		// We are shifting the dagre node position (anchor=center) to the top left
		// so it matches the React Flow node anchor point
		const width = node.measured?.width || NODE_WIDTH;
		const height = node.measured?.height || NODE_HEIGHT;

		const newNode = {
			...node,
			position: {
				x: nodeWithPosition.x - width / 2,
				y: nodeWithPosition.y - height / 2,
			},
		};

		return newNode;
	});

	return { nodes: layoutedNodes, edges };
};

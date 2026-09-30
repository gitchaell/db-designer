import dagre from "dagre";
import type { AppEdge, AppNode } from "../types";

const NODE_WIDTH = 320;
const NODE_HEIGHT = 180; // estimated average height

export const getLayoutedElements = (
	nodes: AppNode[],
	edges: AppEdge[],
	direction = "TB",
) => {
	if (nodes.length === 0) return { nodes, edges };

	const tableNodes = nodes.filter((n) => n.type === "table");
	const containerNodes = nodes.filter((n) => n.type === "container");

	// Fast grid layout for large diagrams (> 50 nodes) to prevent Dagre freezing
	let layoutedTableNodes: AppNode[];

	if (tableNodes.length > 50) {
		const cols = Math.min(
			12,
			Math.max(4, Math.ceil(Math.sqrt(tableNodes.length))),
		);
		const colWidth = 360;
		const rowHeight = 240;

		layoutedTableNodes = tableNodes.map((node, index) => {
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
	} else {
		// Dagre layout for table nodes only
		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 70 });

		for (const node of tableNodes) {
			const width = node.measured?.width || NODE_WIDTH;
			const height = node.measured?.height || NODE_HEIGHT;
			dagreGraph.setNode(node.id, { width, height });
		}

		for (const edge of edges) {
			if (
				tableNodes.some((n) => n.id === edge.source) &&
				tableNodes.some((n) => n.id === edge.target)
			) {
				dagreGraph.setEdge(edge.source, edge.target);
			}
		}

		dagre.layout(dagreGraph);

		layoutedTableNodes = tableNodes.map((node) => {
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
	}

	// Reposition container nodes around their contained tables if any existed near them
	const layoutedContainerNodes = containerNodes.map((container, idx) => {
		// Find table nodes that were original children or nearest
		const originalMinX = container.position.x;
		const originalMinY = container.position.y;
		const originalW =
			(container.style?.width as number) ||
			(container.measured?.width as number) ||
			400;
		const originalH =
			(container.style?.height as number) ||
			(container.measured?.height as number) ||
			300;

		const originalMaxX = originalMinX + originalW;
		const originalMaxY = originalMinY + originalH;

		const insideTables = layoutedTableNodes.filter((t) => {
			const orig = nodes.find((n) => n.id === t.id);
			if (!orig) return false;
			return (
				orig.position.x >= originalMinX &&
				orig.position.x <= originalMaxX &&
				orig.position.y >= originalMinY &&
				orig.position.y <= originalMaxY
			);
		});

		if (insideTables.length > 0) {
			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;

			for (const t of insideTables) {
				const w = t.measured?.width || NODE_WIDTH;
				const h = t.measured?.height || NODE_HEIGHT;
				minX = Math.min(minX, t.position.x);
				minY = Math.min(minY, t.position.y);
				maxX = Math.max(maxX, t.position.x + w);
				maxY = Math.max(maxY, t.position.y + h);
			}

			const padding = 30;
			return {
				...container,
				position: {
					x: minX - padding,
					y: minY - padding - 20, // Extra top space for container title
				},
				style: {
					...container.style,
					width: maxX - minX + padding * 2,
					height: maxY - minY + padding * 2 + 20,
				},
			};
		}

		// Default fallback for empty container
		return {
			...container,
			position: {
				x: 50 + idx * 420,
				y: 50,
			},
		};
	});

	return {
		nodes: [...layoutedContainerNodes, ...layoutedTableNodes],
		edges,
	};
};

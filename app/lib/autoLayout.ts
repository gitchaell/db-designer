import dagre from "dagre";
import type { AppEdge, AppNode } from "../types";

const NODE_WIDTH = 320;
const NODE_HEIGHT = 180;

// Helper to safely extract numeric values
const getNumeric = (val: unknown): number | undefined => {
	if (typeof val === "number" && !Number.isNaN(val)) return val;
	if (typeof val === "string") {
		const parsed = Number.parseFloat(val);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return undefined;
};

export const getLayoutedElements = (
	nodes: AppNode[],
	edges: AppEdge[],
	direction = "TB",
) => {
	if (nodes.length === 0) return { nodes, edges };

	const tableNodes = nodes.filter((n) => n.type === "table");
	const containerNodes = nodes.filter((n) => n.type === "container");

	// If containers exist, group table nodes by their container
	if (containerNodes.length > 0) {
		const containerTablesMap = new Map<string, AppNode[]>();
		const assignedTableIds = new Set<string>();

		// Map tables to containers based on spatial bounding box
		for (const container of containerNodes) {
			const cX = container.position.x;
			const cY = container.position.y;
			const cW =
				getNumeric(container.width) ??
				getNumeric(container.style?.width) ??
				getNumeric(container.measured?.width) ??
				400;
			const cH =
				getNumeric(container.height) ??
				getNumeric(container.style?.height) ??
				getNumeric(container.measured?.height) ??
				300;

			const cMaxX = cX + cW;
			const cMaxY = cY + cH;

			const tablesInContainer = tableNodes.filter((table) => {
				if (assignedTableIds.has(table.id)) return false;
				const tX = table.position.x;
				const tY = table.position.y;
				const tW =
					getNumeric(table.width) ??
					getNumeric(table.style?.width) ??
					getNumeric(table.measured?.width) ??
					NODE_WIDTH;
				const tH =
					getNumeric(table.height) ??
					getNumeric(table.style?.height) ??
					getNumeric(table.measured?.height) ??
					NODE_HEIGHT;

				const centerX = tX + tW / 2;
				const centerY = tY + tH / 2;

				return (
					(tX >= cX && tX <= cMaxX && tY >= cY && tY <= cMaxY) ||
					(centerX >= cX &&
						centerX <= cMaxX &&
						centerY >= cY &&
						centerY <= cMaxY)
				);
			});

			for (const t of tablesInContainer) {
				assignedTableIds.add(t.id);
			}
			containerTablesMap.set(container.id, tablesInContainer);
		}

		const ungroupedTables = tableNodes.filter(
			(t) => !assignedTableIds.has(t.id),
		);

		const layoutedContainerNodes: AppNode[] = [];
		const layoutedTableNodes: AppNode[] = [];

		let currentX = 50;
		let currentY = 50;
		let maxRowHeight = 0;
		const CONTAINER_GAP = 60;
		const MAX_CANVAS_WIDTH = 3200;
		const PADDING_X = 40;
		const PADDING_TOP = 50;
		const PADDING_BOTTOM = 40;
		const TABLE_GAP_X = 40;
		const TABLE_GAP_Y = 40;

		// Layout each container and its contained tables
		for (const container of containerNodes) {
			const tables = containerTablesMap.get(container.id) || [];

			if (tables.length === 0) {
				// Empty container
				const emptyW =
					getNumeric(container.width) ??
					getNumeric(container.style?.width) ??
					360;
				const emptyH =
					getNumeric(container.height) ??
					getNumeric(container.style?.height) ??
					240;

				layoutedContainerNodes.push({
					...container,
					position: { x: currentX, y: currentY },
					style: {
						...container.style,
						width: emptyW,
						height: emptyH,
						zIndex: -1,
					},
				});

				maxRowHeight = Math.max(maxRowHeight, emptyH);
				currentX += emptyW + CONTAINER_GAP;
				if (currentX > MAX_CANVAS_WIDTH) {
					currentX = 50;
					currentY += maxRowHeight + CONTAINER_GAP;
					maxRowHeight = 0;
				}
				continue;
			}

			const cols = Math.min(
				4,
				Math.max(1, Math.ceil(Math.sqrt(tables.length))),
			);

			let localMaxX = 0;
			let localMaxY = 0;

			tables.forEach((table, idx) => {
				const col = idx % cols;
				const row = Math.floor(idx / cols);

				const tW =
					getNumeric(table.width) ??
					getNumeric(table.style?.width) ??
					getNumeric(table.measured?.width) ??
					NODE_WIDTH;
				const tH =
					getNumeric(table.height) ??
					getNumeric(table.style?.height) ??
					getNumeric(table.measured?.height) ??
					NODE_HEIGHT;

				const tableX = currentX + PADDING_X + col * (NODE_WIDTH + TABLE_GAP_X);
				const tableY =
					currentY + PADDING_TOP + row * (NODE_HEIGHT + TABLE_GAP_Y);

				layoutedTableNodes.push({
					...table,
					position: { x: tableX, y: tableY },
				});

				localMaxX = Math.max(localMaxX, tableX + tW);
				localMaxY = Math.max(localMaxY, tableY + tH);
			});

			const containerW = Math.max(360, localMaxX - currentX + PADDING_X);
			const containerH = Math.max(240, localMaxY - currentY + PADDING_BOTTOM);

			layoutedContainerNodes.push({
				...container,
				position: { x: currentX, y: currentY },
				style: {
					...container.style,
					width: containerW,
					height: containerH,
					zIndex: -1,
				},
			});

			maxRowHeight = Math.max(maxRowHeight, containerH);
			currentX += containerW + CONTAINER_GAP;

			if (currentX > MAX_CANVAS_WIDTH) {
				currentX = 50;
				currentY += maxRowHeight + CONTAINER_GAP;
				maxRowHeight = 0;
			}
		}

		// Layout ungrouped tables if any
		if (ungroupedTables.length > 0) {
			if (currentX !== 50) {
				currentX = 50;
				currentY += maxRowHeight + CONTAINER_GAP;
			}

			const cols = Math.min(
				6,
				Math.max(2, Math.ceil(Math.sqrt(ungroupedTables.length))),
			);

			ungroupedTables.forEach((table, idx) => {
				const col = idx % cols;
				const row = Math.floor(idx / cols);

				layoutedTableNodes.push({
					...table,
					position: {
						x: currentX + col * (NODE_WIDTH + TABLE_GAP_X),
						y: currentY + row * (NODE_HEIGHT + TABLE_GAP_Y),
					},
				});
			});
		}

		return {
			nodes: [...layoutedContainerNodes, ...layoutedTableNodes],
			edges,
		};
	}

	// No containers: Fast grid layout for large diagrams (> 50 nodes) to prevent Dagre freezing
	let layoutedTableNodes: AppNode[];

	if (tableNodes.length > 50) {
		const cols = Math.min(
			10,
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
		// Dagre layout for small diagrams without containers
		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 70 });

		for (const node of tableNodes) {
			const width =
				getNumeric(node.width) ??
				getNumeric(node.style?.width) ??
				getNumeric(node.measured?.width) ??
				NODE_WIDTH;
			const height =
				getNumeric(node.height) ??
				getNumeric(node.style?.height) ??
				getNumeric(node.measured?.height) ??
				NODE_HEIGHT;
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
			const width =
				getNumeric(node.width) ??
				getNumeric(node.style?.width) ??
				getNumeric(node.measured?.width) ??
				NODE_WIDTH;
			const height =
				getNumeric(node.height) ??
				getNumeric(node.style?.height) ??
				getNumeric(node.measured?.height) ??
				NODE_HEIGHT;

			return {
				...node,
				position: {
					x: nodeWithPosition.x - width / 2,
					y: nodeWithPosition.y - height / 2,
				},
			};
		});
	}

	return {
		nodes: layoutedTableNodes,
		edges,
	};
};

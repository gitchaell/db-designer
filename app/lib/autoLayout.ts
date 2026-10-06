import dagre from "dagre";
import type { AppEdge, AppNode } from "../types";

const DEFAULT_NODE_WIDTH = 300;

// Helper to safely extract numeric values
const getNumeric = (val: unknown): number | undefined => {
	if (typeof val === "number" && !Number.isNaN(val)) return val;
	if (typeof val === "string") {
		const parsed = Number.parseFloat(val);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return undefined;
};

// Calculate node height based on column count if explicit height is missing
const getNodeHeight = (node: AppNode): number => {
	const explicitH =
		getNumeric(node.height) ??
		getNumeric(node.style?.height) ??
		getNumeric(node.measured?.height);
	if (explicitH) return explicitH;

	if (node.type === "table" && Array.isArray(node.data?.columns)) {
		const cols = node.data.columns.length;
		return Math.max(120, 50 + cols * 28 + 20); // Header + columns + padding
	}

	return 180;
};

// Calculate node width
const getNodeWidth = (node: AppNode): number => {
	return (
		getNumeric(node.width) ??
		getNumeric(node.style?.width) ??
		getNumeric(node.measured?.width) ??
		DEFAULT_NODE_WIDTH
	);
};

export const getLayoutedElements = (
	nodes: AppNode[],
	edges: AppEdge[],
	direction = "TB",
) => {
	if (nodes.length === 0) return { nodes, edges };

	const tableNodes = nodes.filter((n) => n.type === "table");
	const containerNodes = nodes.filter((n) => n.type === "container");

	// If no containers exist, use standard single-pass Dagre layout
	if (containerNodes.length === 0) {
		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({
			rankdir: direction,
			nodesep: 60,
			ranksep: 80,
			marginx: 50,
			marginy: 50,
		});

		for (const node of tableNodes) {
			dagreGraph.setNode(node.id, {
				width: getNodeWidth(node),
				height: getNodeHeight(node),
			});
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

		const layoutedTables = tableNodes.map((node) => {
			const dagreNode = dagreGraph.node(node.id);
			const width = getNodeWidth(node);
			const height = getNodeHeight(node);

			return {
				...node,
				position: {
					x: dagreNode.x - width / 2,
					y: dagreNode.y - height / 2,
				},
			};
		});

		return { nodes: layoutedTables, edges };
	}

	// MULTI-PASS MACRO/MICRO CONTAINER AUTO-LAYOUT ALGORITHM
	const PADDING_LEFT = 35;
	const PADDING_RIGHT = 35;
	const PADDING_TOP = 55; // Account for container title header
	const PADDING_BOTTOM = 35;

	const containerTablesMap = new Map<string, AppNode[]>();
	const tableToContainerMap = new Map<string, string>();
	const assignedTableIds = new Set<string>();

	// 1. Assign tables to containers based on existing spatial overlap
	for (const container of containerNodes) {
		const cX = container.position.x;
		const cY = container.position.y;
		const cW = getNodeWidth(container);
		const cH = getNodeHeight(container);
		const cMaxX = cX + cW;
		const cMaxY = cY + cH;

		const tablesInContainer = tableNodes.filter((table) => {
			if (assignedTableIds.has(table.id)) return false;
			const tX = table.position.x;
			const tY = table.position.y;
			const tW = getNodeWidth(table);
			const tH = getNodeHeight(table);
			const centerX = tX + tW / 2;
			const centerY = tY + tH / 2;

			return (
				(tX >= cX && tX <= cMaxX && tY >= cY && tY <= cMaxY) ||
				(centerX >= cX && centerX <= cMaxX && centerY >= cY && centerY <= cMaxY)
			);
		});

		for (const t of tablesInContainer) {
			assignedTableIds.add(t.id);
			tableToContainerMap.set(t.id, container.id);
		}
		containerTablesMap.set(container.id, tablesInContainer);
	}

	const ungroupedTables = tableNodes.filter((t) => !assignedTableIds.has(t.id));

	// 2. Micro Layout: Layout internal tables within each container using Dagre
	const containerDimensions = new Map<
		string,
		{
			width: number;
			height: number;
			localPositions: Map<string, { x: number; y: number }>;
		}
	>();

	for (const container of containerNodes) {
		const tables = containerTablesMap.get(container.id) || [];

		if (tables.length === 0) {
			containerDimensions.set(container.id, {
				width: 360,
				height: 220,
				localPositions: new Map(),
			});
			continue;
		}

		const microGraph = new dagre.graphlib.Graph();
		microGraph.setDefaultEdgeLabel(() => ({}));
		microGraph.setGraph({
			rankdir: direction,
			nodesep: 40,
			ranksep: 50,
		});

		const containerTableIds = new Set(tables.map((t) => t.id));

		for (const t of tables) {
			microGraph.setNode(t.id, {
				width: getNodeWidth(t),
				height: getNodeHeight(t),
			});
		}

		// Add internal edges
		for (const edge of edges) {
			if (containerTableIds.has(edge.source) && containerTableIds.has(edge.target)) {
				microGraph.setEdge(edge.source, edge.target);
			}
		}

		dagre.layout(microGraph);

		// Calculate bounding box of layouted tables
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		const tempPositions = new Map<string, { x: number; y: number; w: number; h: number }>();

		for (const t of tables) {
			const dagreNode = microGraph.node(t.id);
			const w = getNodeWidth(t);
			const h = getNodeHeight(t);
			const x = dagreNode.x - w / 2;
			const y = dagreNode.y - h / 2;

			tempPositions.set(t.id, { x, y, w, h });

			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + w);
			maxY = Math.max(maxY, y + h);
		}

		// Shift local positions so minX = PADDING_LEFT and minY = PADDING_TOP
		const localPositions = new Map<string, { x: number; y: number }>();
		for (const [tId, pos] of tempPositions.entries()) {
			localPositions.set(tId, {
				x: pos.x - minX + PADDING_LEFT,
				y: pos.y - minY + PADDING_TOP,
			});
		}

		const cW = Math.max(360, maxX - minX + PADDING_LEFT + PADDING_RIGHT);
		const cH = Math.max(220, maxY - minY + PADDING_TOP + PADDING_BOTTOM);

		containerDimensions.set(container.id, {
			width: cW,
			height: cH,
			localPositions,
		});
	}

	// 3. Macro Layout: Treat each Container and Ungrouped Table as macro-nodes
	const macroGraph = new dagre.graphlib.Graph();
	macroGraph.setDefaultEdgeLabel(() => ({}));
	macroGraph.setGraph({
		rankdir: direction,
		nodesep: 70,
		ranksep: 90,
		marginx: 60,
		marginy: 60,
	});

	// Add containers as macro nodes
	for (const container of containerNodes) {
		const dims = containerDimensions.get(container.id)!;
		macroGraph.setNode(container.id, {
			width: dims.width,
			height: dims.height,
		});
	}

	// Add ungrouped tables as macro nodes
	for (const table of ungroupedTables) {
		macroGraph.setNode(table.id, {
			width: getNodeWidth(table),
			height: getNodeHeight(table),
		});
	}

	// Add macro edges derived from cross-container and table relationships
	const addedMacroEdges = new Set<string>();

	for (const edge of edges) {
		const sourceMacro = tableToContainerMap.get(edge.source) || edge.source;
		const targetMacro = tableToContainerMap.get(edge.target) || edge.target;

		if (
			sourceMacro !== targetMacro &&
			macroGraph.hasNode(sourceMacro) &&
			macroGraph.hasNode(targetMacro)
		) {
			const edgeKey = `${sourceMacro}->${targetMacro}`;
			if (!addedMacroEdges.has(edgeKey)) {
				addedMacroEdges.add(edgeKey);
				macroGraph.setEdge(sourceMacro, targetMacro);
			}
		}
	}

	dagre.layout(macroGraph);

	// 4. Assemble final positions
	const finalContainerNodes: AppNode[] = [];
	const finalTableNodes: AppNode[] = [];

	for (const container of containerNodes) {
		const macroNode = macroGraph.node(container.id);
		const dims = containerDimensions.get(container.id)!;

		const containerX = macroNode.x - dims.width / 2;
		const containerY = macroNode.y - dims.height / 2;

		finalContainerNodes.push({
			...container,
			position: { x: containerX, y: containerY },
			style: {
				...container.style,
				width: dims.width,
				height: dims.height,
				zIndex: -1,
			},
		});

		// Position contained tables relative to container
		const containedTables = containerTablesMap.get(container.id) || [];
		for (const table of containedTables) {
			const localPos = dims.localPositions.get(table.id) || {
				x: PADDING_LEFT,
				y: PADDING_TOP,
			};

			finalTableNodes.push({
				...table,
				position: {
					x: containerX + localPos.x,
					y: containerY + localPos.y,
				},
			});
		}
	}

	for (const table of ungroupedTables) {
		const macroNode = macroGraph.node(table.id);
		const w = getNodeWidth(table);
		const h = getNodeHeight(table);

		finalTableNodes.push({
			...table,
			position: {
				x: macroNode.x - w / 2,
				y: macroNode.y - h / 2,
			},
		});
	}

	return {
		nodes: [...finalContainerNodes, ...finalTableNodes],
		edges,
	};
};

import {
	type Edge,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
} from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { create } from "zustand";
import { getProject, saveProject } from "../lib/db";
import { extractColumnId, getSmartHandleIds } from "../lib/smart-edges";
import type {
	AppEdge,
	AppNode,
	Column,
	ColumnStyleSettings,
	EdgeMarkerType,
	EdgeSettings,
	Project,
	RelationEdgeData,
	TableNodeData,
} from "../types";

export type HistoryState = {
	nodes: AppNode[];
	edges: AppEdge[];
};

export const defaultColumnStyleSettings: ColumnStyleSettings = {
	pk: { textColor: "#f59e0b", bold: true, badge: true },
	fk: { textColor: "#3b82f6", bold: false, badge: true },
	audit: { textColor: "#a855f7", italic: false, badge: false },
};

type AppState = {
	project: Project | null;
	nodes: AppNode[];
	edges: AppEdge[];
	isLoading: boolean;
	isReadOnly: boolean;
	isCompactView: boolean;
	snapToGrid: boolean;
	snapGridSize: number;
	edgeSettings: EdgeSettings;
	columnStyleSettings: ColumnStyleSettings;

	// Actions
	toggleReadOnly: () => void;
	toggleCompactView: () => void;
	setCompactView: (compact: boolean) => void;
	toggleSnapToGrid: () => void;
	setSnapGridSize: (size: number) => void;
	loadProject: (id: string) => Promise<void>;
	setProjectName: (name: string) => void;
	// History
	history: HistoryState[];
	historyIndex: number;
	undo: () => void;
	redo: () => void;
	pushHistory: (newNodes: AppNode[], newEdges: AppEdge[]) => void;

	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange<AppEdge>;
	onConnect: OnConnect;

	addNode: (node: AppNode) => void;
	updateNode: (id: string, data: Partial<AppNode>) => void; // New action for root properties
	setNodes: (nodes: AppNode[]) => void;
	updateNodeData: (id: string, data: Partial<TableNodeData>) => void;
	deleteNode: (id: string) => void;

	addColumn: (nodeId: string, column: Column, afterColId?: string) => void;
	reorderColumn: (nodeId: string, oldIndex: number, newIndex: number) => void;
	updateColumn: (
		nodeId: string,
		columnId: string,
		data: Partial<Column>,
	) => void;
	deleteColumn: (nodeId: string, columnId: string) => void;

	updateEdgeData: (edgeId: string, data: Partial<RelationEdgeData>) => void;
	updateEdgeSettings: (settings: Partial<EdgeSettings>) => void;
	updateColumnStyleSettings: (settings: Partial<ColumnStyleSettings>) => void;
};

// Helper to debounce save
let saveTimeout: NodeJS.Timeout;
const debouncedSave = (project: Project) => {
	clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		saveProject({ ...project, updatedAt: Date.now() });
	}, 1000);
};

const getRelationMarkerProps = (
	sourceColId: string,
	targetColId: string,
	nodes: AppNode[],
) => {
	const sourceNode = nodes.find(
		(n) =>
			n.type === "table" && n.data.columns.some((c) => c.id === sourceColId),
	);
	const targetNode = nodes.find(
		(n) =>
			n.type === "table" && n.data.columns.some((c) => c.id === targetColId),
	);

	if (
		!sourceNode ||
		!targetNode ||
		sourceNode.type !== "table" ||
		targetNode.type !== "table"
	)
		return undefined;

	const sourceCol = sourceNode.data.columns.find((c) => c.id === sourceColId);
	const targetCol = targetNode.data.columns.find((c) => c.id === targetColId);

	if (!sourceCol || !targetCol) return undefined;

	if (sourceCol.isPk && targetCol.isFk) {
		return {
			type: MarkerType.ArrowClosed,
			width: 15,
			height: 15,
			color: "#71717a",
		};
	}
	if (sourceCol.isFk && targetCol.isPk) {
		return {
			type: MarkerType.ArrowClosed,
			width: 15,
			height: 15,
			color: "#71717a",
		};
	}
	if (sourceCol.isPk && targetCol.isPk) {
		return { type: MarkerType.Arrow, width: 15, height: 15 };
	}

	return { type: MarkerType.ArrowClosed, width: 15, height: 15 };
};

const getMarkerProps = (markerType?: EdgeMarkerType) => {
	switch (markerType) {
		case "arrow":
			return { type: MarkerType.ArrowClosed, width: 20, height: 20 };
		default:
			return undefined;
	}
};

const resolveEdgeMarker = (
	edgeSettings: EdgeSettings,
	sourceColId: string | undefined | null,
	targetColId: string | undefined | null,
	nodes: AppNode[],
) => {
	if (edgeSettings.showRelationMarkers && sourceColId && targetColId) {
		const relMarker = getRelationMarkerProps(sourceColId, targetColId, nodes);
		if (relMarker) return relMarker;
	}
	if (edgeSettings.markerEnd && edgeSettings.markerEnd !== "none") {
		return getMarkerProps(edgeSettings.markerEnd);
	}
	return undefined;
};

// Recalculate smart handles for a list of edges
const recalculateEdges = (edges: Edge[], nodes: AppNode[]): Edge[] => {
	return edges.map((edge) => {
		const sourceColId = extractColumnId(edge.sourceHandle);
		const targetColId = extractColumnId(edge.targetHandle);

		if (sourceColId && targetColId) {
			const { sourceHandle, targetHandle } = getSmartHandleIds(
				edge.source,
				edge.target,
				sourceColId,
				targetColId,
				nodes,
			);
			if (
				sourceHandle !== edge.sourceHandle ||
				targetHandle !== edge.targetHandle
			) {
				return { ...edge, sourceHandle, targetHandle };
			}
		}
		return edge;
	});
};

export const useStore = create<AppState>((set, get) => ({
	project: null,
	nodes: [],
	edges: [],
	isLoading: false,
	isReadOnly: false,
	isCompactView: false,
	snapToGrid: true,
	snapGridSize: 15,
	edgeSettings: {
		type: "bezier",
		animated: true,
		showRelationMarkers: false,
		defaultColor: "#71717a",
	},
	columnStyleSettings: defaultColumnStyleSettings,
	history: [],
	historyIndex: -1,

	pushHistory: (newNodes: AppNode[], newEdges: Edge[]) => {
		const { history, historyIndex } = get();
		const currentState = { nodes: newNodes, edges: newEdges };
		// truncate history if we are in the middle of it
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push(currentState);
		// keep max 50 states
		if (newHistory.length > 50) {
			newHistory.shift();
		}
		set({ history: newHistory, historyIndex: newHistory.length - 1 });
	},

	undo: () => {
		const { history, historyIndex, project } = get();
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			const previousState = history[newIndex];
			set({
				nodes: previousState.nodes,
				edges: previousState.edges,
				historyIndex: newIndex,
			});
			if (project) {
				debouncedSave({
					...project,
					nodes: previousState.nodes,
					edges: previousState.edges,
				});
			}
		}
	},

	redo: () => {
		const { history, historyIndex, project } = get();
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			const nextState = history[newIndex];
			set({
				nodes: nextState.nodes,
				edges: nextState.edges,
				historyIndex: newIndex,
			});
			if (project) {
				debouncedSave({
					...project,
					nodes: nextState.nodes,
					edges: nextState.edges,
				});
			}
		}
	},
	toggleReadOnly: () => set((state) => ({ isReadOnly: !state.isReadOnly })),
	toggleCompactView: () => {
		const newCompact = !get().isCompactView;
		set({ isCompactView: newCompact });
		const { project } = get();
		if (project) {
			debouncedSave({ ...project, isCompactView: newCompact });
		}
	},
	setCompactView: (compact: boolean) => {
		set({ isCompactView: compact });
		const { project } = get();
		if (project) {
			debouncedSave({ ...project, isCompactView: compact });
		}
	},
	toggleSnapToGrid: () => {
		const newSnap = !get().snapToGrid;
		set({ snapToGrid: newSnap });
		const { project } = get();
		if (project) {
			debouncedSave({ ...project, snapToGrid: newSnap });
		}
	},
	setSnapGridSize: (size: number) => {
		set({ snapGridSize: size });
		const { project } = get();
		if (project) {
			debouncedSave({ ...project, snapGridSize: size });
		}
	},
	loadProject: async (id: string) => {
		set({ isLoading: true });
		try {
			const project = await getProject(id);
			if (project) {
				// Recalculate edges on load to fix legacy or mismatch
				const smartEdges = recalculateEdges(project.edges, project.nodes);
				set({
					project,
					nodes: project.nodes,
					edges: smartEdges,
					isLoading: false,
					isCompactView: project.isCompactView ?? false,
					snapToGrid: project.snapToGrid ?? true,
					snapGridSize: project.snapGridSize ?? 15,
					history: [{ nodes: project.nodes, edges: smartEdges }],
					historyIndex: 0,
					edgeSettings: project.edgeSettings || {
						type: "bezier",
						animated: true,
						showRelationMarkers: false,
						defaultColor: "#71717a",
					},
				});
			} else {
				set({ isLoading: false }); // Handle 404?
			}
		} catch (error) {
			console.error("Failed to load project", error);
			set({ isLoading: false });
		}
	},

	setProjectName: (name: string) => {
		const { project } = get();
		if (!project) return;
		const updatedProject = { ...project, name };
		set({ project: updatedProject });
		debouncedSave(updatedProject);
	},

	onNodesChange: (changes) => {
		const { nodes, edges, project } = get();

		// Helper to safely extract numeric values for width/height
		const getNumeric = (val: unknown): number | undefined => {
			if (typeof val === "number" && !Number.isNaN(val)) return val;
			if (typeof val === "string") {
				const parsed = Number.parseFloat(val);
				if (!Number.isNaN(parsed)) return parsed;
			}
			return undefined;
		};

		// Detect moved container nodes
		const containerPositionChanges = changes.filter(
			(c): c is Extract<typeof c, { type: "position" }> =>
				c.type === "position" &&
				!!c.position &&
				nodes.some((n) => n.id === c.id && n.type === "container"),
		);

		let newNodes = applyNodeChanges(changes, nodes);

		if (containerPositionChanges.length > 0) {
			const directlyMovedNodeIds = new Set(
				changes
					.filter(
						(c): c is Extract<typeof c, { type: "position" }> =>
							c.type === "position",
					)
					.map((c) => c.id),
			);

			for (const change of containerPositionChanges) {
				const oldContainer = nodes.find((n) => n.id === change.id);
				if (!oldContainer || !change.position) continue;

				const dx = change.position.x - oldContainer.position.x;
				const dy = change.position.y - oldContainer.position.y;

				if (dx === 0 && dy === 0) continue;

				const containerWidth =
					getNumeric(oldContainer.width) ??
					getNumeric(oldContainer.style?.width) ??
					getNumeric(oldContainer.measured?.width) ??
					400;
				const containerHeight =
					getNumeric(oldContainer.height) ??
					getNumeric(oldContainer.style?.height) ??
					getNumeric(oldContainer.measured?.height) ??
					300;

				const minX = oldContainer.position.x;
				const maxX = minX + containerWidth;
				const minY = oldContainer.position.y;
				const maxY = minY + containerHeight;

				newNodes = newNodes.map((node) => {
					if (node.type === "table" && !directlyMovedNodeIds.has(node.id)) {
						const tableWidth =
							getNumeric(node.width) ??
							getNumeric(node.style?.width) ??
							getNumeric(node.measured?.width) ??
							320;
						const tableHeight =
							getNumeric(node.height) ??
							getNumeric(node.style?.height) ??
							getNumeric(node.measured?.height) ??
							180;

						const centerX = node.position.x + tableWidth / 2;
						const centerY = node.position.y + tableHeight / 2;

						const isInside =
							(node.position.x >= minX &&
								node.position.x <= maxX &&
								node.position.y >= minY &&
								node.position.y <= maxY) ||
							(centerX >= minX &&
								centerX <= maxX &&
								centerY >= minY &&
								centerY <= maxY);

						if (isInside) {
							return {
								...node,
								position: {
									x: node.position.x + dx,
									y: node.position.y + dy,
								},
							};
						}
					}
					return node;
				});
			}
		}

		// Only recalculate edges if nodes moved (position change)
		const movedNodeIds = new Set(
			changes
				.filter(
					(c): c is Extract<typeof c, { type: "position" }> =>
						c.type === "position" && !!c.dragging,
				)
				.map((c) => c.id),
		);

		// Include tables that moved along with container
		if (containerPositionChanges.length > 0) {
			for (const node of newNodes) {
				const oldNode = nodes.find((n) => n.id === node.id);
				if (
					oldNode &&
					(node.position.x !== oldNode.position.x ||
						node.position.y !== oldNode.position.y)
				) {
					movedNodeIds.add(node.id);
				}
			}
		}

		let newEdges = edges;
		if (movedNodeIds.size > 0) {
			const movedArray = Array.from(movedNodeIds);
			const relevantEdges = edges.filter(
				(e) => movedArray.includes(e.source) || movedArray.includes(e.target),
			);
			const updatedRelevantEdges = recalculateEdges(relevantEdges, newNodes);

			newEdges = edges.map(
				(e) => updatedRelevantEdges.find((ue) => ue.id === e.id) || e,
			);
		}

		set({ nodes: newNodes, edges: newEdges });
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: newEdges });

		// Check if drag ended or node removed/added to push history
		const shouldPushHistory = changes.some(
			(c) =>
				(c.type === "position" && c.dragging === false) ||
				c.type === "remove" ||
				c.type === "add",
		);
		if (shouldPushHistory) {
			get().pushHistory(newNodes, newEdges);
		}
	},

	onEdgesChange: (changes) => {
		const { edges, project } = get();
		const newEdges = applyEdgeChanges(changes, edges);
		set({ edges: newEdges });
		if (project)
			debouncedSave({ ...project, nodes: get().nodes, edges: newEdges });

		const shouldPushHistory = changes.some(
			(c) => c.type === "remove" || c.type === "add",
		);
		if (shouldPushHistory) {
			get().pushHistory(get().nodes, newEdges);
		}
	},

	onConnect: (connection) => {
		const { edges, nodes, project, edgeSettings } = get();

		// Optimize connection handles immediately
		const sourceColId = extractColumnId(connection.sourceHandle);
		const targetColId = extractColumnId(connection.targetHandle);

		let smartConnection: Edge = {
			...connection,
			id: `e-${connection.source}-${connection.target}`,
			type: edgeSettings.type,
			animated: edgeSettings.animated,
			markerEnd: resolveEdgeMarker(
				edgeSettings,
				sourceColId,
				targetColId,
				nodes,
			),
		} as Edge;
		if (sourceColId && targetColId) {
			const { sourceHandle, targetHandle } = getSmartHandleIds(
				connection.source,
				connection.target,
				sourceColId,
				targetColId,
				nodes,
			);
			smartConnection = { ...smartConnection, sourceHandle, targetHandle };
		}

		const newEdges = addEdge(smartConnection, edges);
		set({ edges: newEdges });
		get().pushHistory(nodes, newEdges);
		if (project) debouncedSave({ ...project, nodes: nodes, edges: newEdges });
	},

	addNode: (node) => {
		const { nodes, project, edges } = get();
		const newNodes = [...nodes, node];
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	setNodes: (newNodes) => {
		const { project, edges } = get();
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	updateNode: (id, data) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) =>
			node.id === id ? ({ ...node, ...data } as AppNode) : node,
		);
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	updateNodeData: (id, data) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) =>
			node.id === id
				? ({ ...node, data: { ...node.data, ...data } } as AppNode)
				: node,
		);
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	deleteNode: (id) => {
		const { nodes, edges, project } = get();
		const newNodes = nodes.filter((n) => n.id !== id);
		// Remove connected edges
		const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
		set({ nodes: newNodes, edges: newEdges });
		get().pushHistory(newNodes, newEdges);
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: newEdges });
	},

	addColumn: (nodeId, column, afterColId) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) => {
			if (node.id === nodeId && node.type === "table") {
				const currentColumns = [...node.data.columns];

				if (afterColId) {
					const index = currentColumns.findIndex((c) => c.id === afterColId);
					if (index !== -1) {
						currentColumns.splice(index + 1, 0, column);
					} else {
						currentColumns.push(column);
					}
				} else {
					currentColumns.push(column);
				}

				return {
					...node,
					data: {
						...node.data,
						columns: currentColumns,
					},
				};
			}
			return node;
		});
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	reorderColumn: (nodeId, oldIndex, newIndex) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) => {
			if (node.id === nodeId && node.type === "table") {
				const currentColumns = [...node.data.columns];
				const [movedColumn] = currentColumns.splice(oldIndex, 1);
				currentColumns.splice(newIndex, 0, movedColumn);

				return {
					...node,
					data: {
						...node.data,
						columns: currentColumns,
					},
				};
			}
			return node;
		});
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	updateColumn: (nodeId, columnId, data) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) => {
			if (node.id === nodeId && node.type === "table") {
				return {
					...node,
					data: {
						...node.data,
						columns: node.data.columns.map((col) =>
							col.id === columnId ? { ...col, ...data } : col,
						),
					},
				};
			}
			return node;
		});
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	deleteColumn: (nodeId, columnId) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) => {
			if (node.id === nodeId && node.type === "table") {
				return {
					...node,
					data: {
						...node.data,
						columns: node.data.columns.filter((col) => col.id !== columnId),
					},
				};
			}
			return node;
		});
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	updateEdgeSettings: (settings) => {
		const { edgeSettings, project, edges } = get();
		const newSettings = { ...edgeSettings, ...settings };

		// Update all existing edges with the new settings
		const newEdges = edges.map((edge) => {
			const sourceColId = extractColumnId(edge.sourceHandle);
			const targetColId = extractColumnId(edge.targetHandle);

			const baseEdge = {
				...edge,
				type: newSettings.type,
				animated: newSettings.animated,
			};

			const marker = resolveEdgeMarker(
				newSettings,
				sourceColId,
				targetColId,
				get().nodes,
			);
			if (marker) {
				baseEdge.markerEnd = marker;
			} else {
				baseEdge.markerEnd = undefined;
			}

			return baseEdge;
		});

		set({ edgeSettings: newSettings, edges: newEdges });
		if (project)
			debouncedSave({ ...project, edgeSettings: newSettings, edges: newEdges });
	},

	updateEdgeData: (edgeId, data) => {
		const { edges, project, nodes } = get();
		const newEdges = edges.map((e) =>
			e.id === edgeId ? { ...e, data: { ...e.data, ...data } } : e,
		);
		set({ edges: newEdges });
		get().pushHistory(nodes, newEdges);
		if (project) debouncedSave({ ...project, nodes, edges: newEdges });
	},

	updateColumnStyleSettings: (settings) => {
		const { columnStyleSettings, project } = get();
		const newSettings = {
			pk: { ...columnStyleSettings.pk, ...settings.pk },
			fk: { ...columnStyleSettings.fk, ...settings.fk },
			audit: { ...columnStyleSettings.audit, ...settings.audit },
		};
		set({ columnStyleSettings: newSettings });
		if (project)
			debouncedSave({ ...project, columnStyleSettings: newSettings });
	},
}));

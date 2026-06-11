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
	AppNode,
	Column,
	EdgeMarkerType,
	EdgeSettings,
	Project,
	TableNodeData,
} from "../types";

export type HistoryState = {
	nodes: AppNode[];
	edges: Edge[];
};

type AppState = {
	project: Project | null;
	nodes: AppNode[];
	edges: Edge[];
	isLoading: boolean;
	isReadOnly: boolean;
	edgeSettings: EdgeSettings;

	// Actions
	toggleReadOnly: () => void;
	loadProject: (id: string) => Promise<void>;
	setProjectName: (name: string) => void;
	// History
	history: HistoryState[];
	historyIndex: number;
	undo: () => void;
	redo: () => void;
	pushHistory: (newNodes: AppNode[], newEdges: Edge[]) => void;

	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;

	addNode: (node: AppNode) => void;
	updateNode: (id: string, data: Partial<AppNode>) => void; // New action for root properties
	setNodes: (nodes: AppNode[]) => void;
	updateNodeData: (id: string, data: Partial<TableNodeData>) => void;
	deleteNode: (id: string) => void;

	addColumn: (nodeId: string, column: Column) => void;
	updateColumn: (
		nodeId: string,
		columnId: string,
		data: Partial<Column>,
	) => void;
	deleteColumn: (nodeId: string, columnId: string) => void;

	updateEdgeSettings: (settings: Partial<EdgeSettings>) => void;
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
	const sourceNode = nodes.find((n) =>
		n.data.columns.some((c) => c.id === sourceColId),
	);
	const targetNode = nodes.find((n) =>
		n.data.columns.some((c) => c.id === targetColId),
	);

	if (!sourceNode || !targetNode) return undefined;

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
	edgeSettings: {
		type: "smoothstep",
		animated: true,
		showRelationMarkers: false,
	},
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
					history: [{ nodes: project.nodes, edges: smartEdges }],
					historyIndex: 0,
					edgeSettings: project.edgeSettings || {
						type: "smoothstep",
						animated: true,
						showRelationMarkers: false,
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
		const newNodes = applyNodeChanges(changes, nodes);

		// Only recalculate edges if nodes moved (position change)
		const movedNodeIds = changes
			.filter(
				(c): c is Extract<typeof c, { type: "position" }> =>
					c.type === "position" && !!c.dragging,
			)
			.map((c) => c.id);

		let newEdges = edges;
		if (movedNodeIds.length > 0) {
			const relevantEdges = edges.filter(
				(e) =>
					movedNodeIds.includes(e.source) || movedNodeIds.includes(e.target),
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
			node.id === id ? { ...node, ...data } : node,
		);
		set({ nodes: newNodes });
		get().pushHistory(newNodes, edges);
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: edges });
	},

	updateNodeData: (id, data) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) =>
			node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
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

	addColumn: (nodeId, column) => {
		const { nodes, project, edges } = get();
		const newNodes = nodes.map((node) => {
			if (node.id === nodeId) {
				return {
					...node,
					data: {
						...node.data,
						columns: [...node.data.columns, column],
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
			if (node.id === nodeId) {
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
			if (node.id === nodeId) {
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
}));

import {
	type Edge,
	type Node,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
} from "@xyflow/react";
import { create } from "zustand";
import { getProject, saveProject } from "../lib/db";
import { extractColumnId, getSmartHandleIds } from "../lib/smart-edges";
import type { AppNode, Column, Project, TableNodeData } from "../types";

type AppState = {
	project: Project | null;
	nodes: AppNode[];
	edges: Edge[];
	isLoading: boolean;

	// Actions
	loadProject: (id: string) => Promise<void>;
	setProjectName: (name: string) => void;

	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;

	addNode: (node: AppNode) => void;
	updateNode: (id: string, data: Partial<AppNode>) => void; // New action for root properties
	updateNodeData: (id: string, data: Partial<TableNodeData>) => void;
	deleteNode: (id: string) => void;

	addColumn: (nodeId: string, column: Column) => void;
	updateColumn: (
		nodeId: string,
		columnId: string,
		data: Partial<Column>,
	) => void;
	deleteColumn: (nodeId: string, columnId: string) => void;
};

// Helper to debounce save
let saveTimeout: NodeJS.Timeout;
const debouncedSave = (project: Project) => {
	clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		saveProject({ ...project, updatedAt: Date.now() });
	}, 1000);
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
			.filter((c) => c.type === "position" && c.dragging)
			.map((c) => c.id);

		let newEdges = edges;
		if (movedNodeIds.length > 0) {
			// Find edges connected to moved nodes
			const relevantEdges = edges.filter(
				(e) =>
					movedNodeIds.includes(e.source) || movedNodeIds.includes(e.target),
			);
			// Calculate new handles for them
			// We need to pass ALL nodes to getSmartHandleIds, so use newNodes
			const updatedRelevantEdges = recalculateEdges(relevantEdges, newNodes);

			// Merge back
			newEdges = edges.map(
				(e) => updatedRelevantEdges.find((ue) => ue.id === e.id) || e,
			);
		}

		set({ nodes: newNodes, edges: newEdges });
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: newEdges });
	},

	onEdgesChange: (changes) => {
		const { edges, project } = get();
		const newEdges = applyEdgeChanges(changes, edges);
		set({ edges: newEdges });
		if (project)
			debouncedSave({ ...project, nodes: get().nodes, edges: newEdges });
	},

	onConnect: (connection) => {
		const { edges, nodes, project } = get();

		// Optimize connection handles immediately
		const sourceColId = extractColumnId(connection.sourceHandle);
		const targetColId = extractColumnId(connection.targetHandle);

		let smartConnection = connection;
		if (sourceColId && targetColId) {
			const { sourceHandle, targetHandle } = getSmartHandleIds(
				connection.source,
				connection.target,
				sourceColId,
				targetColId,
				nodes,
			);
			smartConnection = { ...connection, sourceHandle, targetHandle };
		}

		const newEdges = addEdge(smartConnection, edges);
		set({ edges: newEdges });
		if (project) debouncedSave({ ...project, nodes: nodes, edges: newEdges });
	},

	addNode: (node) => {
		const { nodes, project } = get();
		const newNodes = [...nodes, node];
		set({ nodes: newNodes });
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	updateNode: (id, data) => {
		const { nodes, project } = get();
		const newNodes = nodes.map((node) =>
			node.id === id ? { ...node, ...data } : node,
		);
		set({ nodes: newNodes });
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	updateNodeData: (id, data) => {
		const { nodes, project } = get();
		const newNodes = nodes.map((node) =>
			node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
		);
		set({ nodes: newNodes });
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	deleteNode: (id) => {
		const { nodes, edges, project } = get();
		const newNodes = nodes.filter((n) => n.id !== id);
		// Remove connected edges
		const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
		set({ nodes: newNodes, edges: newEdges });
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: newEdges });
	},

	addColumn: (nodeId, column) => {
		const { nodes, project } = get();
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
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	updateColumn: (nodeId, columnId, data) => {
		const { nodes, project } = get();
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
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	deleteColumn: (nodeId, columnId) => {
		const { nodes, project } = get();
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
		if (project)
			debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},
}));

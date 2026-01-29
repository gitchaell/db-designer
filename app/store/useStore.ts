import { create } from 'zustand';
import {
	type Edge,
	type Node,
	type OnNodesChange,
	type OnEdgesChange,
	type OnConnect,
	applyNodeChanges,
	applyEdgeChanges,
	addEdge,
} from '@xyflow/react';
import type { AppNode, Column, Project, TableNodeData } from '../types';
import { getProject, saveProject } from '../lib/db';

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
	updateNodeData: (id: string, data: Partial<TableNodeData>) => void;
	deleteNode: (id: string) => void;

	addColumn: (nodeId: string, column: Column) => void;
	updateColumn: (nodeId: string, columnId: string, data: Partial<Column>) => void;
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
				set({
					project,
					nodes: project.nodes,
					edges: project.edges,
					isLoading: false
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
		const { nodes, project } = get();
		const newNodes = applyNodeChanges(changes, nodes);
		set({ nodes: newNodes });
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	onEdgesChange: (changes) => {
		const { edges, project } = get();
		const newEdges = applyEdgeChanges(changes, edges);
		set({ edges: newEdges });
		if (project) debouncedSave({ ...project, nodes: get().nodes, edges: newEdges });
	},

	onConnect: (connection) => {
		const { edges, project } = get();
		const newEdges = addEdge(connection, edges);
		set({ edges: newEdges });
		if (project) debouncedSave({ ...project, nodes: get().nodes, edges: newEdges });
	},

	addNode: (node) => {
		const { nodes, project } = get();
		const newNodes = [...nodes, node];
		set({ nodes: newNodes });
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	updateNodeData: (id, data) => {
		const { nodes, project } = get();
		const newNodes = nodes.map((node) =>
			node.id === id ? { ...node, data: { ...node.data, ...data } } : node
		);
		set({ nodes: newNodes });
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},

	deleteNode: (id) => {
		const { nodes, edges, project } = get();
		const newNodes = nodes.filter(n => n.id !== id);
		// Remove connected edges
		const newEdges = edges.filter(e => e.source !== id && e.target !== id);
		set({ nodes: newNodes, edges: newEdges });
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: newEdges });
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
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
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
							col.id === columnId ? { ...col, ...data } : col
						),
					},
				};
			}
			return node;
		});
		set({ nodes: newNodes });
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
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
		if (project) debouncedSave({ ...project, nodes: newNodes, edges: get().edges });
	},
}));

import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Edge,
	type Node,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";

export type Column = {
	name: string;
	type: string;
	isPk?: boolean;
	isFk?: boolean;
};

export type TableNodeData = {
	label: string;
	columns: Column[];
};

export type AppNode = Node<TableNodeData, "table">;

type AppState = {
	nodes: AppNode[];
	edges: Edge[];
	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
};

const initialNodes: AppNode[] = [
	{
		id: "1",
		type: "table",
		position: { x: 100, y: 100 },
		data: {
			label: "Users",
			columns: [
				{ name: "id", type: "uuid", isPk: true },
				{ name: "username", type: "varchar" },
				{ name: "email", type: "varchar" },
				{ name: "role_id", type: "uuid", isFk: true },
				{ name: "created_at", type: "timestamp" },
			],
		},
	},
];

export const useStore = create<AppState>((set, get) => ({
	nodes: initialNodes,
	edges: [],
	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},
	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},
	onConnect: (connection) => {
		set({
			edges: addEdge(connection, get().edges),
		});
	},
}));

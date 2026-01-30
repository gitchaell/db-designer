import type { Edge, Node } from "@xyflow/react";

export type ColumnType =
	| "uuid"
	| "varchar"
	| "int"
	| "boolean"
	| "timestamp"
	| "text"
	| "json";

export type Column = {
	id: string;
	name: string;
	type: ColumnType;
	isPk: boolean;
	isFk: boolean;
};

export type TableNodeData = {
	label: string;
	color?: string;
	columns: Column[];
};

export type AppNode = Node<TableNodeData, "table">;

export type Project = {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	nodes: AppNode[];
	edges: Edge[];
};

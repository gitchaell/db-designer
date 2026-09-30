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

export type ContainerNodeData = {
	label: string;
	color?: string;
};

export type AppNode =
	| Node<TableNodeData, "table">
	| Node<ContainerNodeData, "container">;

export type RelationCardinality =
	| "none"
	| "1"
	| "0..1"
	| "1..1"
	| "0..*"
	| "1..*"
	| "N"
	| "*";

export type RelationEdgeData = {
	label?: string;
	startCardinality?: RelationCardinality;
	endCardinality?: RelationCardinality;
};

export type AppEdge = Edge<RelationEdgeData>;

export type EdgeMarkerType = "none" | "arrow";

export type EdgeSettings = {
	type: "smoothstep" | "step" | "straight" | "bezier";
	animated: boolean;
	markerEnd?: EdgeMarkerType;
	showRelationMarkers?: boolean;
};

export type ColumnHighlightStyle = {
	textColor?: string;
	bgColor?: string;
	bold?: boolean;
	italic?: boolean;
	badge?: boolean;
};

export type ColumnStyleSettings = {
	pk: ColumnHighlightStyle;
	fk: ColumnHighlightStyle;
	audit: ColumnHighlightStyle;
};

export type Project = {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	nodes: AppNode[];
	edges: AppEdge[];
	edgeSettings?: EdgeSettings;
	columnStyleSettings?: ColumnStyleSettings;
};

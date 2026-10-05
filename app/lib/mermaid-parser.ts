import { v4 as uuidv4 } from "uuid";
import type { AppEdge, AppNode, Column, ColumnType } from "../types";

function mapMermaidType(typeStr: string): ColumnType {
	const t = typeStr.toLowerCase();
	if (
		t.includes("int") ||
		t.includes("number") ||
		t.includes("bigint") ||
		t.includes("smallint")
	) {
		return "int";
	}
	if (t.includes("bool")) {
		return "boolean";
	}
	if (t.includes("time") || t.includes("date") || t.includes("timestamp")) {
		return "timestamp";
	}
	if (t.includes("json")) {
		return "json";
	}
	if (t.includes("uuid")) {
		return "uuid";
	}
	if (t.includes("text")) {
		return "text";
	}
	if (t.includes("float") || t.includes("double") || t.includes("decimal")) {
		return "int";
	}
	return "varchar";
}

function cleanIdentifier(str: string): string {
	return str.replace(/^["'`]|["'`]$/g, "").trim();
}

const CONTAINER_COLOR_CLASSES = [
	"text-blue-500",
	"text-emerald-500",
	"text-purple-500",
	"text-amber-500",
	"text-rose-500",
	"text-zinc-500",
];

export function parseMermaidToNodesAndEdges(code: string): {
	nodes: AppNode[];
	edges: AppEdge[];
} {
	// Strip comments
	const cleanCode = code.replace(/%%.*$/gm, "");

	const lines = cleanCode
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith("erDiagram"));

	const nodes: AppNode[] = [];
	const edges: AppEdge[] = [];
	const entityMap = new Map<
		string,
		{
			nodeId: string;
			columns: Column[];
			colMap: Map<string, Column>;
			nodeRef: AppNode;
			groupName?: string;
		}
	>();

	const subgraphsMap = new Map<
		string,
		{
			title: string;
			entities: string[]; // key list
		}
	>();

	let currentSubgraphTitle: string | null = null;
	let currentEntityKey: string | null = null;

	const rawRelationships: Array<{
		entity1Name: string;
		entity2Name: string;
		relSymbol: string;
		label?: string;
	}> = [];

	const getOrCreateEntity = (entityName: string) => {
		const cleanName = cleanIdentifier(entityName);
		const key = cleanName.toLowerCase();

		if (!entityMap.has(key)) {
			const nodeId = uuidv4();
			const columns: Column[] = [];
			const colMap = new Map<string, Column>();
			const nodeRef: AppNode = {
				id: nodeId,
				type: "table",
				position: { x: 0, y: 0 },
				data: { label: cleanName, columns },
			};
			entityMap.set(key, {
				nodeId,
				columns,
				colMap,
				nodeRef,
				groupName: currentSubgraphTitle || undefined,
			});

			if (currentSubgraphTitle) {
				const group = subgraphsMap.get(currentSubgraphTitle);
				if (group && !group.entities.includes(key)) {
					group.entities.push(key);
				}
			}
		} else if (currentSubgraphTitle) {
			const existing = entityMap.get(key);
			if (existing && !existing.groupName) {
				existing.groupName = currentSubgraphTitle;
				const group = subgraphsMap.get(currentSubgraphTitle);
				if (group && !group.entities.includes(key)) {
					group.entities.push(key);
				}
			}
		}
		return { key, cleanName, ...entityMap.get(key)! };
	};

	for (const line of lines) {
		// Handle Subgraph Start: subgraph "System" or subgraph System [System Group]
		if (line.toLowerCase().startsWith("subgraph")) {
			const subMatch = /^subgraph\s+["']?([^"'[\]]+)["']?(?:\s*\[.*\])?$/i.exec(
				line,
			);
			const title = subMatch ? cleanIdentifier(subMatch[1]) : "Group";
			currentSubgraphTitle = title;
			if (!subgraphsMap.has(title)) {
				subgraphsMap.set(title, { title, entities: [] });
			}
			continue;
		}

		// Handle Subgraph End or Entity Block End
		if (line.toLowerCase() === "end") {
			currentSubgraphTitle = null;
			continue;
		}

		if (line === "}") {
			currentEntityKey = null;
			continue;
		}

		// Entity block start: CUSTOMER {
		const entityBlockStartMatch = /^([A-Za-z0-9_'"\s-]+)\s*\{$/.exec(line);
		if (entityBlockStartMatch) {
			const entityName = entityBlockStartMatch[1];
			const entityInfo = getOrCreateEntity(entityName);
			currentEntityKey = entityInfo.key;
			continue;
		}

		// Field inside entity block
		if (currentEntityKey) {
			const commentIdx = line.indexOf('"');
			let lineWithoutComment = line;
			if (commentIdx !== -1) {
				lineWithoutComment = line.substring(0, commentIdx).trim();
			}

			const parts = lineWithoutComment.split(/\s+/).filter(Boolean);
			if (parts.length >= 2) {
				const colTypeRaw = parts[0];
				const colName = cleanIdentifier(parts[1]);
				const keysUpper = parts.slice(2).map((k) => k.toUpperCase());

				const isPk = keysUpper.includes("PK");
				const isFk = keysUpper.includes("FK");

				const entityData = entityMap.get(currentEntityKey);
				if (entityData) {
					const colKey = colName.toLowerCase();
					let col = entityData.colMap.get(colKey);
					if (!col) {
						col = {
							id: uuidv4(),
							name: colName,
							type: mapMermaidType(colTypeRaw),
							isPk,
							isFk,
						};
						entityData.columns.push(col);
						entityData.colMap.set(colKey, col);
					} else {
						if (isPk) col.isPk = true;
						if (isFk) col.isFk = true;
					}
				}
			}
			continue;
		}

		// Relationship line
		const relRegex =
			/^([A-Za-z0-9_'"\s-]+?)\s+([|{}o<>.~-]{4,12})\s+([A-Za-z0-9_'"\s-]+?)(?:\s*:\s*(.*))?$/;
		const relMatch = relRegex.exec(line);
		if (relMatch) {
			const entity1Name = relMatch[1].trim();
			const relSymbol = relMatch[2].trim();
			const entity2Name = relMatch[3].trim();
			const label = relMatch[4] ? relMatch[4].trim() : undefined;

			rawRelationships.push({ entity1Name, entity2Name, relSymbol, label });
			continue;
		}

		// Standalone entity declaration
		const standaloneMatch = /^([A-Za-z0-9_'"-]+)$/.exec(line);
		if (standaloneMatch) {
			getOrCreateEntity(standaloneMatch[1]);
		}
	}

	// Layout calculation for Subgraphs & Entities
	const TABLE_WIDTH = 320;
	const TABLE_HEIGHT_EST = 220;
	const PADDING_X = 40;
	const PADDING_Y = 50;

	let currentContainerX = 50;
	let currentContainerY = 50;
	let maxRowHeight = 0;
	const CONTAINER_GAP = 60;
	const MAX_CANVAS_WIDTH = 3200;

	let colorIdx = 0;

	// Process grouped subgraphs first
	for (const [title, group] of subgraphsMap.entries()) {
		if (group.entities.length === 0) continue;

		const groupEntities = group.entities
			.map((k) => entityMap.get(k))
			.filter(Boolean);

		const cols = Math.min(
			4,
			Math.max(1, Math.ceil(Math.sqrt(groupEntities.length))),
		);

		let localMaxX = 0;
		let localMaxY = 0;

		groupEntities.forEach((entity, idx) => {
			if (!entity) return;
			const col = idx % cols;
			const row = Math.floor(idx / cols);

			const tableX = currentContainerX + PADDING_X + col * (TABLE_WIDTH + 30);
			const tableY =
				currentContainerY + PADDING_Y + row * (TABLE_HEIGHT_EST + 30);

			entity.nodeRef.position = { x: tableX, y: tableY };
			nodes.push(entity.nodeRef);

			localMaxX = Math.max(localMaxX, tableX + TABLE_WIDTH);
			localMaxY = Math.max(localMaxY, tableY + TABLE_HEIGHT_EST);
		});

		const containerWidth = Math.max(
			400,
			localMaxX - currentContainerX + PADDING_X,
		);
		const containerHeight = Math.max(
			280,
			localMaxY - currentContainerY + PADDING_Y,
		);

		const containerNode: AppNode = {
			id: uuidv4(),
			type: "container",
			position: { x: currentContainerX, y: currentContainerY },
			style: { width: containerWidth, height: containerHeight, zIndex: -1 },
			zIndex: -1,
			data: {
				label: title,
				color:
					CONTAINER_COLOR_CLASSES[colorIdx % CONTAINER_COLOR_CLASSES.length],
			},
		};
		colorIdx++;
		nodes.push(containerNode);

		maxRowHeight = Math.max(maxRowHeight, containerHeight);
		currentContainerX += containerWidth + CONTAINER_GAP;

		if (currentContainerX > MAX_CANVAS_WIDTH) {
			currentContainerX = 50;
			currentContainerY += maxRowHeight + CONTAINER_GAP;
			maxRowHeight = 0;
		}
	}

	// Process un-grouped entities
	const ungroupedEntities = Array.from(entityMap.values()).filter(
		(e) => !e.groupName,
	);

	if (ungroupedEntities.length > 0) {
		const cols = Math.min(
			6,
			Math.max(2, Math.ceil(Math.sqrt(ungroupedEntities.length))),
		);

		ungroupedEntities.forEach((entity, idx) => {
			const col = idx % cols;
			const row = Math.floor(idx / cols);

			entity.nodeRef.position = {
				x: currentContainerX + col * (TABLE_WIDTH + 40),
				y: currentContainerY + row * (TABLE_HEIGHT_EST + 40),
			};
			nodes.push(entity.nodeRef);
		});
	}

	// Create edges
	for (const rel of rawRelationships) {
		const entity1 = getOrCreateEntity(rel.entity1Name);
		const entity2 = getOrCreateEntity(rel.entity2Name);

		const col1 =
			entity1.columns.find((c) => c.isPk || c.isFk) || entity1.columns[0];
		const col2 =
			entity2.columns.find((c) => c.isFk || c.isPk) || entity2.columns[0];

		const sourceColId = col1?.id || uuidv4();
		const targetColId = col2?.id || uuidv4();

		edges.push({
			id: `e-${entity1.nodeId}-${entity2.nodeId}-${edges.length}`,
			source: entity1.nodeId,
			target: entity2.nodeId,
			sourceHandle: `sr-${sourceColId}`,
			targetHandle: `tl-${targetColId}`,
			type: "bezier",
			animated: true,
			data: {
				label: rel.label,
			},
		});
	}

	return { nodes, edges };
}

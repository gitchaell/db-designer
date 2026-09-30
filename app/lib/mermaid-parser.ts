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
	const entityMap = new Map<string, { nodeId: string; columns: Column[] }>();

	let xPos = 50;
	let yPos = 50;

	const getOrCreateEntity = (entityName: string) => {
		const cleanName = cleanIdentifier(entityName);
		const key = cleanName.toLowerCase();
		if (!entityMap.has(key)) {
			const nodeId = uuidv4();
			entityMap.set(key, { nodeId, columns: [] });
			nodes.push({
				id: nodeId,
				type: "table",
				position: { x: xPos, y: yPos },
				data: { label: cleanName, columns: [] },
			});

			xPos += 300;
			if (xPos > 900) {
				xPos = 50;
				yPos += 300;
			}
		}
		return { key, cleanName, ...entityMap.get(key)! };
	};

	const rawRelationships: Array<{
		entity1Name: string;
		entity2Name: string;
		relSymbol: string;
		label?: string;
	}> = [];

	let currentEntityKey: string | null = null;

	for (const line of lines) {
		if (line === "}") {
			currentEntityKey = null;
			continue;
		}

		// Check for entity block start: `CUSTOMER {` or `"DELIVERY-ADDRESS" {`
		const entityBlockStartMatch = /^([A-Za-z0-9_'"\s-]+)\s*\{$/.exec(line);
		if (entityBlockStartMatch) {
			const entityName = entityBlockStartMatch[1];
			const entityInfo = getOrCreateEntity(entityName);
			currentEntityKey = entityInfo.key;
			continue;
		}

		// Handle field inside entity block ONLY if we are inside a block
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
					const node = nodes.find((n) => n.id === entityData.nodeId);
					if (node) {
						let col = entityData.columns.find(
							(c) => c.name.toLowerCase() === colName.toLowerCase(),
						);
						if (!col) {
							col = {
								id: uuidv4(),
								name: colName,
								type: mapMermaidType(colTypeRaw),
								isPk,
								isFk,
							};
							entityData.columns.push(col);
							node.data.columns.push(col);
						} else {
							if (isPk) col.isPk = true;
							if (isFk) col.isFk = true;
						}
					}
				}
			}
			continue;
		}

		// Check for relationship line outside block: `CUSTOMER ||--o{ ORDER : places`
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

	// Create edges from rawRelationships
	for (const rel of rawRelationships) {
		const entity1 = getOrCreateEntity(rel.entity1Name);
		const entity2 = getOrCreateEntity(rel.entity2Name);

		const node1 = nodes.find((n) => n.id === entity1.nodeId);
		const node2 = nodes.find((n) => n.id === entity2.nodeId);

		const col1 =
			node1?.data.columns.find((c) => c.isPk || c.isFk) ||
			node1?.data.columns[0];
		const col2 =
			node2?.data.columns.find((c) => c.isFk || c.isPk) ||
			node2?.data.columns[0];

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
		});
	}

	return { nodes, edges };
}

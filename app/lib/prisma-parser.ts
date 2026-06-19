import { v4 as uuidv4 } from "uuid";
import type { AppEdge, AppNode, Column, ColumnType } from "../types";

function mapPrismaType(typeStr: string) {
	const t = typeStr.replace("?", "").replace("[]", "");
	switch (t) {
		case "Int":
		case "Float":
		case "Decimal":
			return "int";
		case "Boolean":
			return "boolean";
		case "DateTime":
			return "timestamp";
		case "Json":
			return "json";
		case "String":
			return "varchar";
		default:
			return "varchar";
	}
}

export function parsePrismaSchemaToNodesAndEdges(code: string) {
	const noComments = code.replace(/\/\/.*$/gm, "");
	const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
	let modelMatch;

	const nodes: AppNode[] = [];
	const edges: AppEdge[] = [];
	let xPos = 50;
	let yPos = 50;

	const models = new Map();

	while ((modelMatch = modelRegex.exec(noComments)) !== null) {
		const modelName = modelMatch[1];
		const body = modelMatch[2];

		models.set(modelName, { body, nodeId: uuidv4() });
	}

	for (const [modelName, { body, nodeId }] of models.entries()) {
		const fieldRegex = /^\s*(\w+)\s+([\w\[\]?]+)(?:\s+(.+))?/gm;
		let fieldMatch;

		const columns: Column[] = [];

		while ((fieldMatch = fieldRegex.exec(body)) !== null) {
			const fieldName = fieldMatch[1];
			const fieldTypeRaw = fieldMatch[2];
			const modifiers = fieldMatch[3] || "";

			const isPk = modifiers.includes("@id");

			const baseType = fieldTypeRaw.replace("?", "").replace("[]", "");
			const isRelation = models.has(baseType);

			const colId = uuidv4();

			if (!isRelation) {
				columns.push({
					id: colId,
					name: fieldName,
					type: mapPrismaType(baseType),
					isPk,
					isFk: false,
				});
			} else {
				// We still push it so we can filter it out later, using a dummy type that we cast
				columns.push({
					id: colId,
					name: fieldName,
					type: "relation" as ColumnType,
					isPk: false,
					isFk: false,
				});
			}
		}

		const filteredColumns = columns.filter(
			(c) => (c.type as string) !== "relation",
		);

		nodes.push({
			id: nodeId,
			type: "table",
			position: { x: xPos, y: yPos },
			data: { label: modelName, columns: filteredColumns },
		});

		xPos += 300;
		if (xPos > 900) {
			xPos = 50;
			yPos += 300;
		}
	}

	for (const [, { body, nodeId }] of models.entries()) {
		const fieldRegex = /^\s*(\w+)\s+([\w\[\]?]+)(?:\s+(.+))?/gm;
		let fieldMatch;

		while ((fieldMatch = fieldRegex.exec(body)) !== null) {
			const fieldTypeRaw = fieldMatch[2];
			const modifiers = fieldMatch[3] || "";

			const baseType = fieldTypeRaw.replace("?", "").replace("[]", "");

			if (models.has(baseType) && !fieldTypeRaw.includes("[]")) {
				const relMatch =
					/@relation\(\s*fields:\s*\[([^\]]+)\]\s*,\s*references:\s*\[([^\]]+)\]/.exec(
						modifiers,
					);
				if (relMatch) {
					const fkField = relMatch[1].trim();
					const pkField = relMatch[2].trim();

					const targetNodeId = models.get(baseType).nodeId;

					const sourceNode = nodes.find((n) => n.id === nodeId);
					const fkCol = sourceNode?.data.columns.find(
						(c) => c.name === fkField,
					);
					if (fkCol) fkCol.isFk = true;

					const targetNode = nodes.find((n) => n.id === targetNodeId);
					const targetCol = targetNode?.data.columns.find(
						(c) => c.name === pkField,
					);

					if (fkCol && targetCol) {
						edges.push({
							id: `e-${nodeId}-${targetNodeId}`,
							source: nodeId,
							target: targetNodeId,
							sourceHandle: `sr-${fkCol.id}`,
							targetHandle: `tl-${targetCol.id}`,
							type: "bezier",
							animated: true,
						});
					}
				}
			}
		}
	}

	return { nodes, edges };
}

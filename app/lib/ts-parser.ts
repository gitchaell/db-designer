import type { AppNode, Column, ColumnType } from "../types";
import { v4 as uuidv4 } from "uuid";

// Simple mapping from TS types to our internal column types
function mapTsTypeToColumnType(tsType: string): ColumnType {
	const typeLower = tsType.toLowerCase();

	if (typeLower.includes("number")) return "int";
	if (typeLower.includes("boolean")) return "boolean";
	if (typeLower.includes("date")) return "timestamp";
	if (typeLower.includes("record") || typeLower.includes("any") || typeLower.includes("unknown")) return "json";

	// Default to varchar for string or anything else we don't recognize
	return "varchar";
}

export function parseTypeScriptToNodes(code: string): AppNode[] {
	const nodes: AppNode[] = [];

	// Strip comments
	const noComments = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

	// Regex to find interfaces and types
	// Matches `interface Name { ... }` or `type Name = { ... }` or `export interface Name { ... }`
	const interfaceRegex = /(?:export\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)(?:\s*=\s*)?\s*\{([^}]+)\}/g;

	let match;
	let xPos = 50;
	let yPos = 50;

	while ((match = interfaceRegex.exec(noComments)) !== null) {
		const [, name, body] = match;
		const interfaceName = name.trim();

		// Split body into lines and parse properties
		const propertyLines = body.split(/;|\n/).map(l => l.trim()).filter(l => l.length > 0);

		const columns: Column[] = [];
		let isFirst = true;

		for (const line of propertyLines) {
			// Expected format: `propertyName?: type` or `propertyName: type`
			const propMatch = line.match(/^([A-Za-z0-9_]+)\s*\??\s*:\s*(.+)$/);

			if (propMatch) {
				const [, propName, propType] = propMatch;

				// Make the first property the PK, or if name is 'id'
				const isPk = isFirst || propName.toLowerCase() === 'id';
				if (isPk) isFirst = false;

				columns.push({
					id: uuidv4(),
					name: propName,
					type: mapTsTypeToColumnType(propType),
					isPk,
					isFk: false,
				});
			}
		}

		if (columns.length > 0) {
			nodes.push({
				id: uuidv4(),
				type: "table",
				position: { x: xPos, y: yPos },
				data: {
					label: interfaceName,
					columns,
				},
			});

			// Layout next node
			xPos += 300;
			if (xPos > 900) {
				xPos = 50;
				yPos += 300;
			}
		}
	}

	return nodes;
}

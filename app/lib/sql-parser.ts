import { v4 as uuidv4 } from "uuid";
import type { AppEdge, AppNode, Column, ColumnType } from "../types";

function mapSqlType(typeStr: string): ColumnType {
	const t = typeStr.toUpperCase();
	if (t.includes("INT")) return "int";
	if (t.includes("CHAR") || t.includes("TEXT") || t.includes("STRING"))
		return "varchar";
	if (t.includes("BOOL")) return "boolean";
	if (t.includes("TIME") || t.includes("DATE")) return "timestamp";
	if (t.includes("JSON")) return "json";
	if (t.includes("UUID")) return "uuid";
	return "varchar";
}

export function parseSqlToNodesAndEdges(code: string) {
	// Remove comments
	const noComments = code
		.replace(/--.*$/gm, "")
		.replace(/\/\*[\s\S]*?\*\//g, "");

	// Find CREATE TABLE statements
	const tableRegex =
		/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["'`]?(\w+)["'`]?\.)?["'`]?(\w+)["'`]?\s*\(([\s\S]*?)\);?/gi;
	let tableMatch;

	const nodes: AppNode[] = [];
	const edges: AppEdge[] = [];
	let xPos = 50;
	let yPos = 50;

	// To keep track of tables and their primary keys for foreign key resolution
	const tables = new Map<
		string,
		{
			nodeId: string;
			fks: { localCol: string; refTable: string; refCol: string }[];
			columns: Column[];
			colMap: Map<string, Column>;
		}
	>();

	// First pass: create nodes (tables) and parse columns
	while ((tableMatch = tableRegex.exec(noComments)) !== null) {
		const tableName = tableMatch[2]; // match[1] would be schema, if present
		const body = tableMatch[3];

		const nodeId = uuidv4();
		const columns: Column[] = [];
		const colMap = new Map<string, Column>();
		const tableFks: { localCol: string; refTable: string; refCol: string }[] =
			[];

		const statements = body
			.split(/,\s*(?![^()]*\))/g)
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		for (const statement of statements) {
			const upperStatement = statement.toUpperCase();

			// Constraint: PRIMARY KEY (col1, col2)
			if (upperStatement.startsWith("PRIMARY KEY")) {
				const pkMatch = /PRIMARY\s+KEY\s*\(([^)]+)\)/i.exec(statement);
				if (pkMatch) {
					const pkCols = pkMatch[1]
						.split(",")
						.map((c) => c.trim().replace(/["'`]/g, ""));
					for (const pkCol of pkCols) {
						const col = colMap.get(pkCol.toLowerCase());
						if (col) {
							col.isPk = true;
						}
					}
				}
				continue;
			}

			// Constraint: FOREIGN KEY (col) REFERENCES other_table(other_col)
			if (
				upperStatement.startsWith("FOREIGN KEY") ||
				upperStatement.startsWith("CONSTRAINT")
			) {
				const fkMatch =
					/(?:FOREIGN\s+KEY\s*\(([^)]+)\)\s*)?REFERENCES\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/i.exec(
						statement,
					);
				if (fkMatch) {
					let localCol = fkMatch[1];
					if (!localCol) {
						const constraintFkMatch = /FOREIGN\s+KEY\s*\(([^)]+)\)/i.exec(
							statement,
						);
						if (constraintFkMatch) localCol = constraintFkMatch[1];
					}

					if (localCol) {
						localCol = localCol.replace(/["'`]/g, "").trim();
						const refTable = fkMatch[2];
						const refCol = fkMatch[3].replace(/["'`]/g, "").trim();
						tableFks.push({ localCol, refTable, refCol });
					}
				}
				continue;
			}

			// Column definition
			const colRegex = /^["'`]?(\w+)["'`]?\s+(\w+(?:\([^)]+\))?)(.*)/i;
			const colMatch = colRegex.exec(statement);

			if (colMatch) {
				const colName = colMatch[1];
				const colType = colMatch[2];
				const extras = colMatch[3] || "";

				const isPk = extras.toUpperCase().includes("PRIMARY KEY");

				const colId = uuidv4();
				const colObj: Column = {
					id: colId,
					name: colName,
					type: mapSqlType(colType),
					isPk,
					isFk: false,
				};
				columns.push(colObj);
				colMap.set(colName.toLowerCase(), colObj);

				// Inline foreign key: `author_id INT REFERENCES User(id)`
				const inlineFkMatch =
					/REFERENCES\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/i.exec(extras);
				if (inlineFkMatch) {
					const refTable = inlineFkMatch[1];
					const refCol = inlineFkMatch[2].replace(/["'`]/g, "").trim();
					tableFks.push({ localCol: colName, refTable, refCol });
				}
			}
		}

		nodes.push({
			id: nodeId,
			type: "table",
			position: { x: xPos, y: yPos },
			data: { label: tableName, columns },
		});

		tables.set(tableName.toLowerCase(), {
			nodeId,
			fks: tableFks,
			columns,
			colMap,
		});

		xPos += 300;
		if (xPos > 900) {
			xPos = 50;
			yPos += 300;
		}
	}

	// Second pass: ALTER TABLE statements
	const alterRegex =
		/ALTER\s+TABLE\s+["'`]?(\w+)["'`]?\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/gi;
	let alterMatch;

	while ((alterMatch = alterRegex.exec(noComments)) !== null) {
		const tableName = alterMatch[1].toLowerCase();
		const localCol = alterMatch[2].replace(/["'`]/g, "").trim();
		const refTable = alterMatch[3];
		const refCol = alterMatch[4].replace(/["'`]/g, "").trim();

		const tableInfo = tables.get(tableName);
		if (tableInfo) {
			tableInfo.fks.push({ localCol, refTable, refCol });
		}
	}

	// Third pass: create edges from collected foreign keys
	for (const [, { nodeId, fks, colMap }] of tables.entries()) {
		for (const fk of fks) {
			const { localCol, refTable, refCol } = fk;

			const targetTableInfo = tables.get(refTable.toLowerCase());
			if (targetTableInfo) {
				const sourceCol = colMap.get(localCol.toLowerCase());
				const targetCol = targetTableInfo.colMap.get(refCol.toLowerCase());

				if (sourceCol && targetCol) {
					sourceCol.isFk = true;
					edges.push({
						id: `e-${nodeId}-${targetTableInfo.nodeId}-${sourceCol.id}`,
						source: nodeId,
						target: targetTableInfo.nodeId,
						sourceHandle: `sr-${sourceCol.id}`,
						targetHandle: `tl-${targetCol.id}`,
						type: "bezier",
						animated: true,
					});
				}
			}
		}
	}

	return { nodes, edges };
}

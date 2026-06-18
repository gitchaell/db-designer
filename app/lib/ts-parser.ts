import type { AppNode, Column, ColumnType } from "../types";
import { v4 as uuidv4 } from "uuid";
import * as ts from "typescript";

// Simple mapping from TS types to our internal column types
function mapTsTypeToColumnType(tsType: string): ColumnType {
	const typeLower = tsType.toLowerCase();

	if (typeLower.includes("number")) return "int";
	if (typeLower.includes("boolean")) return "boolean";
	if (typeLower.includes("date")) return "timestamp";
	if (
		typeLower.includes("record") ||
		typeLower.includes("any") ||
		typeLower.includes("unknown") ||
		typeLower.includes("{")
	) {
		return "json";
	}

	// Default to varchar for string or anything else we don't recognize
	return "varchar";
}

export function parseTypeScriptToNodes(code: string): AppNode[] {
	const nodes: AppNode[] = [];
	let xPos = 50;
	let yPos = 50;

	// Parse code into AST
	const sourceFile = ts.createSourceFile(
		"temp.ts",
		code,
		ts.ScriptTarget.Latest,
		true,
	);

	function visit(node: ts.Node) {
		// Look for Interface, Type Alias, or Class declarations
		if (
			ts.isInterfaceDeclaration(node) ||
			ts.isTypeAliasDeclaration(node) ||
			ts.isClassDeclaration(node)
		) {
			const interfaceName = node.name?.text || "Unnamed";
			const columns: Column[] = [];
			let isFirst = true;

			// Handle properties for Interface
			if (ts.isInterfaceDeclaration(node)) {
				for (const member of node.members) {
					if (ts.isPropertySignature(member) && member.name) {
						let propName = "";
						if (
							ts.isIdentifier(member.name) ||
							ts.isStringLiteral(member.name)
						) {
							propName = member.name.text;
						} else {
							continue;
						}

						const propType = member.type
							? member.type.getText(sourceFile)
							: "any";

						const isPk = isFirst || propName.toLowerCase() === "id";
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
			}
			// Handle properties for Class
			else if (ts.isClassDeclaration(node)) {
				for (const member of node.members) {
					if (ts.isPropertyDeclaration(member) && member.name) {
						let propName = "";
						if (
							ts.isIdentifier(member.name) ||
							ts.isStringLiteral(member.name)
						) {
							propName = member.name.text;
						} else {
							continue;
						}

						const propType = member.type
							? member.type.getText(sourceFile)
							: "any";

						const isPk = isFirst || propName.toLowerCase() === "id";
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
			}
			// Handle properties for Type Alias
			else if (
				ts.isTypeAliasDeclaration(node) &&
				ts.isTypeLiteralNode(node.type)
			) {
				for (const member of node.type.members) {
					if (ts.isPropertySignature(member) && member.name) {
						let propName = "";
						if (
							ts.isIdentifier(member.name) ||
							ts.isStringLiteral(member.name)
						) {
							propName = member.name.text;
						} else {
							continue;
						}

						const propType = member.type
							? member.type.getText(sourceFile)
							: "any";

						const isPk = isFirst || propName.toLowerCase() === "id";
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
		// If it's a module/namespace, visit its children
		else if (ts.isModuleDeclaration(node)) {
			if (node.body) {
				ts.forEachChild(node.body, visit);
			} else {
				ts.forEachChild(node, visit);
			}
		}
	}

	// Start traversing from the root
	ts.forEachChild(sourceFile, visit);

	return nodes;
}

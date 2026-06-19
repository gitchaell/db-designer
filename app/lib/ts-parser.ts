import type { AppEdge, AppNode, Column, ColumnType } from "../types";
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

export function parseTypeScriptToNodesAndEdges(code: string): {
	nodes: AppNode[];
	edges: AppEdge[];
} {
	const nodes: AppNode[] = [];
	const edges: AppEdge[] = [];
	let xPos = 50;
	let yPos = 50;

	// Parse code into AST
	const sourceFile = ts.createSourceFile(
		"temp.ts",
		code,
		ts.ScriptTarget.Latest,
		true,
	);

	const typeMap = new Map<string, string>(); // Maps type name to node ID
	const relationCandidates: Array<{
		sourceNodeName: string;
		sourceColumnId: string;
		targetTypeName: string;
	}> = [];

	function processMembers(
		nodeName: string,
		members: ts.NodeArray<ts.TypeElement> | ts.NodeArray<ts.ClassElement>,
	) {
		const columns: Column[] = [];
		let isFirst = true;

		for (const member of members) {
			if (
				(ts.isPropertySignature(member) || ts.isPropertyDeclaration(member)) &&
				member.name
			) {
				let propName = "";
				if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) {
					propName = member.name.text;
				} else {
					continue;
				}

				const propTypeStr = member.type
					? member.type.getText(sourceFile)
					: "any";
				let baseType = propTypeStr;

				if (member.type && ts.isArrayTypeNode(member.type)) {
					baseType = member.type.elementType.getText(sourceFile);
				} else if (propTypeStr.endsWith("[]")) {
					baseType = propTypeStr.slice(0, -2);
				}

				// Check if this looks like a reference to another model
				const isReference =
					baseType !== "string" &&
					baseType !== "number" &&
					baseType !== "boolean" &&
					baseType !== "Date" &&
					baseType !== "any" &&
					baseType !== "unknown";

				const isPk = isFirst || propName.toLowerCase() === "id";
				if (isPk) isFirst = false;

				const colId = uuidv4();

				if (isReference) {
					relationCandidates.push({
						sourceNodeName: nodeName,
						sourceColumnId: colId,
						targetTypeName: baseType,
					});
				}

				columns.push({
					id: colId,
					name: propName,
					type: mapTsTypeToColumnType(propTypeStr),
					isPk,
					isFk: false, // We'll update this below if it maps to a relation
				});
			}
		}
		return columns;
	}

	function visit(node: ts.Node) {
		// Look for Interface, Type Alias, or Class declarations
		if (
			ts.isInterfaceDeclaration(node) ||
			ts.isTypeAliasDeclaration(node) ||
			ts.isClassDeclaration(node)
		) {
			const interfaceName = node.name?.text || "Unnamed";
			let columns: Column[] = [];

			if (ts.isInterfaceDeclaration(node)) {
				columns = processMembers(interfaceName, node.members);
			} else if (ts.isClassDeclaration(node)) {
				columns = processMembers(interfaceName, node.members);
			} else if (
				ts.isTypeAliasDeclaration(node) &&
				ts.isTypeLiteralNode(node.type)
			) {
				columns = processMembers(interfaceName, node.type.members);
			}

			if (columns.length > 0) {
				const nodeId = uuidv4();
				typeMap.set(interfaceName, nodeId);

				nodes.push({
					id: nodeId,
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

	// Process relationships
	for (const candidate of relationCandidates) {
		const sourceNodeId = typeMap.get(candidate.sourceNodeName);
		const targetNodeId = typeMap.get(candidate.targetTypeName);

		if (sourceNodeId && targetNodeId) {
			// Find the target node and its primary key
			const targetNode = nodes.find((n) => n.id === targetNodeId);
			const targetPkCol = targetNode?.data.columns.find((c: Column) => c.isPk);

			if (targetPkCol) {
				// Update the source column to be a foreign key
				const sourceNode = nodes.find((n) => n.id === sourceNodeId);
				const sourceCol = sourceNode?.data.columns.find(
					(c: Column) => c.id === candidate.sourceColumnId,
				);

				if (sourceCol) {
					sourceCol.isFk = true;
				}

				edges.push({
					id: `e-${sourceNodeId}-${targetNodeId}`,
					source: sourceNodeId,
					target: targetNodeId,
					sourceHandle: `sr-${candidate.sourceColumnId}`,
					targetHandle: `tl-${targetPkCol.id}`,
					type: "bezier", // Default type
					animated: true,
				});
			}
		}
	}

	return { nodes, edges };
}

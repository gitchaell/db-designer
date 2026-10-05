import type { AppEdge, AppNode } from "@/app/types";
import { extractColumnId } from "./smart-edges";

export type SuggestedRelation = {
	id: string;
	sourceNodeId: string;
	sourceNodeLabel: string;
	sourceColId: string;
	sourceColName: string;
	targetNodeId: string;
	targetNodeLabel: string;
	targetColId: string;
	targetColName: string;
	confidence: "high" | "medium";
	reason: string;
};

export function findMissingRelations(
	nodes: AppNode[],
	edges: AppEdge[],
): SuggestedRelation[] {
	const tableNodes = nodes.filter((n) => n.type === "table");
	const suggestions: SuggestedRelation[] = [];

	// Map existing connections: set of "col1-col2" or "col2-col1"
	const existingConnections = new Set<string>();
	for (const edge of edges) {
		const sourceColId = extractColumnId(edge.sourceHandle);
		const targetColId = extractColumnId(edge.targetHandle);
		if (sourceColId && targetColId) {
			existingConnections.add(`${sourceColId}:${targetColId}`);
			existingConnections.add(`${targetColId}:${sourceColId}`);
		}
	}

	// Helper to normalize table names (e.g., "user_profiles" -> "user", "users" -> "user")
	const normalizeTableName = (name: string) => {
		let n = name.toLowerCase().trim();
		if (n.endsWith("s")) n = n.slice(0, -1);
		if (n.endsWith("ie")) n = `${n.slice(0, -2)}y`;
		return n;
	};

	for (const sourceNode of tableNodes) {
		const sourceTableLabel = sourceNode.data.label || "Untitled Table";
		const normSourceLabel = normalizeTableName(sourceTableLabel);

		for (const sourceCol of sourceNode.data.columns) {
			const normColName = sourceCol.name.toLowerCase().trim();

			for (const targetNode of tableNodes) {
				if (sourceNode.id === targetNode.id) continue;

				const targetTableLabel = targetNode.data.label || "Untitled Table";
				const normTargetLabel = normalizeTableName(targetTableLabel);

				for (const targetCol of targetNode.data.columns) {
					// Skip if connection already exists
					if (
						existingConnections.has(`${sourceCol.id}:${targetCol.id}`) ||
						existingConnections.has(`${targetCol.id}:${sourceCol.id}`)
					) {
						continue;
					}

					const normTargetColName = targetCol.name.toLowerCase().trim();

					// Matching rule 1: Direct Foreign Key reference (e.g. user_id -> id on users table)
					if (
						targetCol.isPk &&
						(normColName === `${normTargetLabel}_id` ||
							normColName === `${normTargetLabel}id` ||
							normColName === normTargetColName)
					) {
						suggestions.push({
							id: `${sourceNode.id}-${sourceCol.id}_${targetNode.id}-${targetCol.id}`,
							sourceNodeId: sourceNode.id,
							sourceNodeLabel: sourceTableLabel,
							sourceColId: sourceCol.id,
							sourceColName: sourceCol.name,
							targetNodeId: targetNode.id,
							targetNodeLabel: targetTableLabel,
							targetColId: targetCol.id,
							targetColName: targetCol.name,
							confidence: "high",
							reason: `Field '${sourceCol.name}' matches primary key '${targetCol.name}' of table '${targetTableLabel}'`,
						});
						continue;
					}

					// Matching rule 2: Explicit Foreign Key flag set on column matching a PK
					if (
						sourceCol.isFk &&
						targetCol.isPk &&
						sourceCol.type === targetCol.type &&
						(normColName.includes(normTargetLabel) ||
							normTargetColName === normColName)
					) {
						suggestions.push({
							id: `${sourceNode.id}-${sourceCol.id}_${targetNode.id}-${targetCol.id}`,
							sourceNodeId: sourceNode.id,
							sourceNodeLabel: sourceTableLabel,
							sourceColId: sourceCol.id,
							sourceColName: sourceCol.name,
							targetNodeId: targetNode.id,
							targetNodeLabel: targetTableLabel,
							targetColId: targetCol.id,
							targetColName: targetCol.name,
							confidence: "high",
							reason: `Foreign key field '${sourceCol.name}' in '${sourceTableLabel}' matches primary key in '${targetTableLabel}'`,
						});
						continue;
					}

					// Matching rule 3: Conventional _id naming pattern matching target table name
					if (
						normColName.endsWith("_id") ||
						normColName.endsWith("id")
					) {
						const prefix = normColName
							.replace(/_?id$/, "")
							.toLowerCase();
						if (prefix && normTargetLabel.includes(prefix)) {
							suggestions.push({
								id: `${sourceNode.id}-${sourceCol.id}_${targetNode.id}-${targetCol.id}`,
								sourceNodeId: sourceNode.id,
								sourceNodeLabel: sourceTableLabel,
								sourceColId: sourceCol.id,
								sourceColName: sourceCol.name,
								targetNodeId: targetNode.id,
								targetNodeLabel: targetTableLabel,
								targetColId: targetCol.id,
								targetColName: targetCol.name,
								confidence: "medium",
								reason: `Column '${sourceCol.name}' suggests a link to '${targetTableLabel}.${targetCol.name}'`,
							});
						}
					}
				}
			}
		}
	}

	// Deduplicate suggestions
	const uniqueSuggestionsMap = new Map<string, SuggestedRelation>();
	for (const sug of suggestions) {
		const key1 = `${sug.sourceColId}-${sug.targetColId}`;
		const key2 = `${sug.targetColId}-${sug.sourceColId}`;
		if (!uniqueSuggestionsMap.has(key1) && !uniqueSuggestionsMap.has(key2)) {
			uniqueSuggestionsMap.set(key1, sug);
		}
	}

	return Array.from(uniqueSuggestionsMap.values());
}

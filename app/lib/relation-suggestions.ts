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

	// Common generic primary key names to exclude from cross-table id <-> id false positives
	const GENERIC_PK_NAMES = new Set(["id", "pk", "uuid", "key", "_id"]);

	for (const sourceNode of tableNodes) {
		const sourceTableLabel = sourceNode.data.label || "Untitled Table";
		const _normSourceLabel = normalizeTableName(sourceTableLabel);

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

					// CRITICAL SAFETY CHECK: NEVER match generic "id" <-> "id" across independent tables!
					if (
						GENERIC_PK_NAMES.has(normColName) &&
						GENERIC_PK_NAMES.has(normTargetColName)
					) {
						continue;
					}

					// Matching Rule 1: Exact FK pattern match (e.g. user_id or userId referencing target table "users" PK "id")
					if (
						targetCol.isPk &&
						(normColName === `${normTargetLabel}_id` ||
							normColName === `${normTargetLabel}id` ||
							normColName === `${normTargetLabel}_uuid`)
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
							reason: `Foreign key '${sourceTableLabel}.${sourceCol.name}' targets primary key '${targetTableLabel}.${targetCol.name}'`,
						});
						continue;
					}

					// Matching Rule 2: Explicit Foreign Key flag (isFk) on source column targeting a PK
					if (
						sourceCol.isFk &&
						targetCol.isPk &&
						!GENERIC_PK_NAMES.has(normColName) &&
						(normColName.includes(normTargetLabel) ||
							normColName.endsWith("_id") ||
							normColName.endsWith("id"))
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
							reason: `FK field '${sourceTableLabel}.${sourceCol.name}' matches primary key in '${targetTableLabel}'`,
						});
						continue;
					}

					// Matching Rule 3: Conventional prefix match (e.g. author_id or creator_id)
					if (
						targetCol.isPk &&
						(normColName.endsWith("_id") || normColName.endsWith("id")) &&
						!GENERIC_PK_NAMES.has(normColName)
					) {
						const prefix = normColName
							.replace(/_?id$/, "")
							.replace(/_?uuid$/, "")
							.toLowerCase();

						if (
							prefix &&
							(normTargetLabel.includes(prefix) ||
								prefix.includes(normTargetLabel))
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
								confidence: "medium",
								reason: `Column '${sourceCol.name}' suggests a foreign key link to '${targetTableLabel}.${targetCol.name}'`,
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

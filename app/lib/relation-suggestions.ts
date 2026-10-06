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

// Helper to normalize table names (e.g. "user_profiles" -> "userprofile", "users" -> "user", "Posts" -> "post")
const normalizeTableName = (name: string): string => {
	let n = name.toLowerCase().trim().replace(/[-_\s]+/g, "");
	if (n.endsWith("ies")) n = `${n.slice(0, -3)}y`;
	else if (n.endsWith("ses") || n.endsWith("xes") || n.endsWith("ches") || n.endsWith("shes"))
		n = n.slice(0, -2);
	else if (n.endsWith("s") && !n.endsWith("ss")) n = n.slice(0, -1);
	return n;
};

// Helper to extract base entity name from foreign key column name
// e.g. "author_id" -> "author", "postId" -> "post", "creator_uuid" -> "creator", "User_Id" -> "user"
const extractFkEntityBase = (colName: string): string | null => {
	const trimmed = colName.trim();
	// Check snake_case / kebab-case with _id, _uuid, _fk
	const snakeMatch = trimmed.match(/^(.+?)[_-\s](id|uuid|fk|key)$/i);
	if (snakeMatch) return normalizeTableName(snakeMatch[1]);

	// Check camelCase / PascalCase with Id, Uuid, Fk
	const camelMatch = trimmed.match(/^(.+?)(Id|Uuid|Fk|Key)$/);
	if (camelMatch) return normalizeTableName(camelMatch[1]);

	return null;
};

// Common generic primary key / id names to prevent generic false positive cross matches
const GENERIC_PK_NAMES = new Set([
	"id",
	"pk",
	"uuid",
	"key",
	"_id",
	"guid",
	"code",
]);

// Common entity aliases mapping foreign key prefixes to potential target table names
const ENTITY_ALIASES: Record<string, string[]> = {
	author: ["user", "account", "profile", "admin", "member", "person"],
	creator: ["user", "account", "profile", "admin", "member", "person"],
	owner: ["user", "account", "organization", "company", "team"],
	sender: ["user", "account", "profile"],
	recipient: ["user", "account", "profile"],
	assignee: ["user", "account", "member"],
	member: ["user", "account"],
	actor: ["user", "account"],
	parent: ["self"], // Self-referencing table hierarchy
};

// Data type compatibility check helper
const isTypeCompatible = (typeA = "", typeB = ""): boolean => {
	const tA = typeA.toLowerCase().trim();
	const tB = typeB.toLowerCase().trim();
	if (!tA || !tB) return true; // If type omitted, default to true
	if (tA === tB) return true;

	const numTypes = new Set(["int", "integer", "bigint", "smallint", "number", "serial", "bigserial"]);
	if (numTypes.has(tA) && numTypes.has(tB)) return true;

	const uuidTypes = new Set(["uuid", "string", "varchar", "text", "char"]);
	if (uuidTypes.has(tA) && uuidTypes.has(tB)) return true;

	return false;
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

	for (const sourceNode of tableNodes) {
		const sourceTableLabel = sourceNode.data.label || "Untitled Table";
		const normSourceTable = normalizeTableName(sourceTableLabel);

		for (const sourceCol of sourceNode.data.columns) {
			const sourceColName = sourceCol.name.trim();
			const fkEntity = extractFkEntityBase(sourceColName);

			// Must either have a foreign key name pattern (e.g. post_id) or explicit isFk flag
			if (!fkEntity && !sourceCol.isFk) continue;

			for (const targetNode of tableNodes) {
				const targetTableLabel = targetNode.data.label || "Untitled Table";
				const normTargetTable = normalizeTableName(targetTableLabel);

				// Handle Self-Referencing Foreign Keys (e.g. parent_id in category)
				if (sourceNode.id === targetNode.id) {
					if (fkEntity === "parent" || fkEntity === normSourceTable) {
						for (const targetCol of targetNode.data.columns) {
							if (
								targetCol.isPk &&
								!existingConnections.has(`${sourceCol.id}:${targetCol.id}`)
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
									reason: `Relación auto-referenciada (Jerarquía): '${sourceCol.name}' se conecta con '${targetCol.name}' en la misma tabla '${sourceTableLabel}'`,
								});
							}
						}
					}
					continue;
				}

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
						GENERIC_PK_NAMES.has(sourceColName.toLowerCase()) &&
						GENERIC_PK_NAMES.has(normTargetColName)
					) {
						continue;
					}

					// Ensure target column is a Primary Key or uniquely identifiable column
					if (!targetCol.isPk && !GENERIC_PK_NAMES.has(normTargetColName)) {
						continue;
					}

					// Ensure data type compatibility
					if (!isTypeCompatible(sourceCol.type, targetCol.type)) {
						continue;
					}

					// Matching Rule 1: Exact direct foreign key pattern (e.g. post_id -> posts.id, authorId -> author.id)
					if (fkEntity && fkEntity === normTargetTable) {
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
							reason: `Clave foránea '${sourceTableLabel}.${sourceCol.name}' coincide directamente con la tabla '${targetTableLabel}' (${targetCol.name})`,
						});
						continue;
					}

					// Matching Rule 2: Semantic alias matching (e.g. author_id -> users.id, creator_id -> accounts.id)
					if (fkEntity && ENTITY_ALIASES[fkEntity]) {
						const aliases = ENTITY_ALIASES[fkEntity];
						if (aliases.includes(normTargetTable)) {
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
								reason: `Alias semántico: '${sourceCol.name}' (${sourceTableLabel}) sugiere una relación con '${targetTableLabel}.${targetCol.name}'`,
							});
							continue;
						}
					}

					// Matching Rule 3: Explicit isFk flag with partial entity match
					if (sourceCol.isFk && targetCol.isPk) {
						if (
							fkEntity &&
							(normTargetTable.includes(fkEntity) || fkEntity.includes(normTargetTable))
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
								reason: `Campo FK '${sourceTableLabel}.${sourceCol.name}' coincide parcialmente con la clave primaria de '${targetTableLabel}'`,
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
		const key1 = `${sug.sourceColId}:${sug.targetColId}`;
		const key2 = `${sug.targetColId}:${sug.sourceColId}`;
		if (!uniqueSuggestionsMap.has(key1) && !uniqueSuggestionsMap.has(key2)) {
			uniqueSuggestionsMap.set(key1, sug);
		}
	}

	return Array.from(uniqueSuggestionsMap.values());
}

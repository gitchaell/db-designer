export const AUDIT_FIELDS = new Set([
	"created_at",
	"createdat",
	"created_by",
	"createdby",
	"updated_at",
	"updatedat",
	"updated_by",
	"updatedby",
	"deleted_at",
	"deletedat",
	"deleted_by",
	"deletedby",
]);

export function isAuditField(colName: string): boolean {
	if (!colName) return false;
	const lower = colName.toLowerCase();
	const cleaned = lower.replace(/[-_]/g, "");
	return AUDIT_FIELDS.has(lower) || AUDIT_FIELDS.has(cleaned);
}

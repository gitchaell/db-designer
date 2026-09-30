import type { Column } from "../types";

export function isAuditField(col: Column | string | undefined | null): boolean {
	if (typeof col === "object" && col !== null) {
		return Boolean(col.isAudit);
	}
	return false;
}

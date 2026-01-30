import type { AppEdge, AppNode } from "../types";

export const extractColumnId = (
	handleId: string | undefined | null,
): string => {
	if (!handleId) return "";
	// Expected format: "sl-uuid", "tr-uuid", etc.
	// If it doesn't match, return as is (legacy support)
	const parts = handleId.split("-");
	if (
		parts.length >= 2 &&
		(parts[0] === "sl" ||
			parts[0] === "tl" ||
			parts[0] === "sr" ||
			parts[0] === "tr")
	) {
		return parts.slice(1).join("-");
	}
	return handleId;
};

export const getSmartHandleIds = (
	sourceId: string,
	targetId: string,
	sourceColId: string,
	targetColId: string,
	nodes: AppNode[],
): { sourceHandle: string; targetHandle: string } => {
	const sourceNode = nodes.find((n) => n.id === sourceId);
	const targetNode = nodes.find((n) => n.id === targetId);

	if (!sourceNode || !targetNode) {
		// Fallback if nodes not found (shouldn't happen often)
		return {
			sourceHandle: `sr-${sourceColId}`,
			targetHandle: `tl-${targetColId}`,
		};
	}

	const sourceX = sourceNode.position.x + (sourceNode.measured?.width || 0) / 2;
	const targetX = targetNode.position.x + (targetNode.measured?.width || 0) / 2;

	if (sourceX < targetX) {
		// Source is to the Left of Target
		// Connect Source Right to Target Left
		return {
			sourceHandle: `sr-${sourceColId}`,
			targetHandle: `tl-${targetColId}`,
		};
	}

	// Source is to the Right of Target
	// Connect Source Left to Target Right
	return {
		sourceHandle: `sl-${sourceColId}`,
		targetHandle: `tr-${targetColId}`,
	};
};

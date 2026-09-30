"use client";

import { useStore } from "@/app/store/useStore";
import type { AppEdge, RelationCardinality } from "@/app/types";
import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getBezierPath,
	getSmoothStepPath,
	getStraightPath,
} from "@xyflow/react";
import { clsx } from "clsx";
import { Check, Settings2, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { createPortal } from "react-dom";

const CARDINALITY_OPTIONS: { label: string; value: RelationCardinality }[] = [
	{ label: "None", value: "none" },
	{ label: "1 (One)", value: "1" },
	{ label: "0..1 (Zero or One)", value: "0..1" },
	{ label: "1..1 (Exactly One)", value: "1..1" },
	{ label: "0..* (Zero or Many)", value: "0..*" },
	{ label: "1..* (One or Many)", value: "1..*" },
	{ label: "N (Many)", value: "N" },
	{ label: "* (Many)", value: "*" },
];

export default function CustomRelationEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	data,
	selected,
}: EdgeProps<AppEdge>) {
	const { edgeSettings, updateEdgeData, isReadOnly, onEdgesChange } =
		useStore();
	const [isOpen, setIsOpen] = useState(false);
	const [labelInput, setLabelInput] = useState(data?.label || "");
	const [startCard, setStartCard] = useState<RelationCardinality>(
		data?.startCardinality || "1",
	);
	const [endCard, setEndCard] = useState<RelationCardinality>(
		data?.endCardinality || "N",
	);

	// Determine path based on edge settings
	let edgePath = "";
	let labelX = 0;
	let labelY = 0;

	if (edgeSettings.type === "straight") {
		[edgePath, labelX, labelY] = getStraightPath({
			sourceX,
			sourceY,
			targetX,
			targetY,
		});
	} else if (
		edgeSettings.type === "step" ||
		edgeSettings.type === "smoothstep"
	) {
		[edgePath, labelX, labelY] = getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
			borderRadius: 12,
		});
	} else {
		[edgePath, labelX, labelY] = getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
		});
	}

	const handleSave = () => {
		updateEdgeData(id, {
			label: labelInput,
			startCardinality: startCard,
			endCardinality: endCard,
		});
		setIsOpen(false);
	};

	const handleDelete = () => {
		onEdgesChange([{ id, type: "remove" }]);
		setIsOpen(false);
	};

	const displayStartCard =
		data?.startCardinality && data.startCardinality !== "none"
			? data.startCardinality
			: null;
	const displayEndCard =
		data?.endCardinality && data.endCardinality !== "none"
			? data.endCardinality
			: null;

	return (
		<>
			<BaseEdge
				path={edgePath}
				markerEnd={markerEnd}
				style={{
					strokeWidth: selected ? 2.5 : 2,
					stroke: selected
						? "var(--color-primary, #3b82f6)"
						: style.stroke || "#71717a",
					...style,
				}}
			/>

			<EdgeLabelRenderer>
				{/* Start Cardinality Badge near source handle */}
				{displayStartCard && (
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${sourceX + (labelX - sourceX) * 0.2}px, ${sourceY + (labelY - sourceY) * 0.2}px)`,
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-background text-foreground border border-border rounded shadow-xs select-none">
							{displayStartCard}
						</span>
					</div>
				)}

				{/* End Cardinality Badge near target handle */}
				{displayEndCard && (
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${targetX + (labelX - targetX) * 0.2}px, ${targetY + (labelY - targetY) * 0.2}px)`,
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-background text-foreground border border-border rounded shadow-xs select-none">
							{displayEndCard}
						</span>
					</div>
				)}

				{/* Center Edge Label */}
				<div
					style={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						pointerEvents: "all",
					}}
					className="nodrag nopan flex items-center gap-1 group/edge-label"
				>
					<button
						type="button"
						onClick={() => {
							if (!isReadOnly) {
								setLabelInput(data?.label || "");
								setStartCard(data?.startCardinality || "1");
								setEndCard(data?.endCardinality || "N");
								setIsOpen(true);
							}
						}}
						className={clsx(
							"px-2 py-0.5 text-xs font-semibold rounded-md shadow-xs border transition-all flex items-center gap-1",
							data?.label
								? "bg-card text-card-foreground border-border hover:border-primary"
								: "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border-dashed border-border opacity-70 group-hover/edge-label:opacity-100",
						)}
					>
						<span>{data?.label || (isReadOnly ? "" : "+ Edge Label")}</span>
						{!isReadOnly && <Settings2 className="w-3 h-3 opacity-60" />}
					</button>

					{/* Inline Edge Editor Modal / Portal */}
					{isOpen &&
						createPortal(
							<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs">
								<div className="bg-popover border border-border text-popover-foreground rounded-xl p-4 w-80 shadow-2xl flex flex-col gap-3 font-sans animate-in fade-in zoom-in-95 duration-100">
									<div className="flex items-center justify-between border-b border-border pb-2">
										<h3 className="text-sm font-bold flex items-center gap-2">
											<Settings2 className="w-4 h-4 text-primary" />
											Relationship Edge Settings
										</h3>
										<button
											type="button"
											onClick={() => setIsOpen(false)}
											className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
										>
											<X className="w-4 h-4" />
										</button>
									</div>

									{/* Label Input */}
									<div className="flex flex-col gap-1">
										<label className="text-xs font-medium text-muted-foreground">
											Relation Label / Name
										</label>
										<input
											type="text"
											value={labelInput}
											onChange={(e) => setLabelInput(e.target.value)}
											placeholder="e.g. belongs_to, contains"
											className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
										/>
									</div>

									{/* Start Cardinality */}
									<div className="flex flex-col gap-1">
										<label className="text-xs font-medium text-muted-foreground">
											Start Symbol / Cardinality
										</label>
										<select
											value={startCard}
											onChange={(e) =>
												setStartCard(e.target.value as RelationCardinality)
											}
											className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
										>
											{CARDINALITY_OPTIONS.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									</div>

									{/* End Cardinality */}
									<div className="flex flex-col gap-1">
										<label className="text-xs font-medium text-muted-foreground">
											End Symbol / Cardinality
										</label>
										<select
											value={endCard}
											onChange={(e) =>
												setEndCard(e.target.value as RelationCardinality)
											}
											className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
										>
											{CARDINALITY_OPTIONS.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									</div>

									{/* Actions */}
									<div className="flex items-center justify-between border-t border-border pt-3 mt-1">
										<button
											type="button"
											onClick={handleDelete}
											className="px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md flex items-center gap-1 transition-colors"
										>
											<Trash2 className="w-3.5 h-3.5" /> Delete Link
										</button>

										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setIsOpen(false)}
												className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
											>
												Cancel
											</button>
											<button
												type="button"
												onClick={handleSave}
												className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-1 transition-colors"
											>
												<Check className="w-3.5 h-3.5" /> Save
											</button>
										</div>
									</div>
								</div>
							</div>,
							document.body,
						)}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}

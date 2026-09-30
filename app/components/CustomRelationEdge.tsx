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
	{ label: "1 (Exactly One ||)", value: "1" },
	{ label: "0..1 (Zero or One o|)", value: "0..1" },
	{ label: "1..1 (Exactly One ||)", value: "1..1" },
	{ label: "0..* (Zero or Many o<)", value: "0..*" },
	{ label: "1..* (One or Many |>|)", value: "1..*" },
	{ label: "N (Many o<)", value: "N" },
	{ label: "* (Many o<)", value: "*" },
];

function getMarkerUrl(
	card: RelationCardinality | undefined,
	edgeId: string,
	isStart: boolean,
) {
	if (!card || card === "none") return undefined;
	const prefix = isStart ? "start" : "end";
	if (card === "1" || card === "1..1")
		return `url(#card-one-${prefix}-${edgeId})`;
	if (card === "0..1") return `url(#card-zero-one-${prefix}-${edgeId})`;
	if (card === "1..*") return `url(#card-one-many-${prefix}-${edgeId})`;
	if (card === "0..*" || card === "N" || card === "*")
		return `url(#card-zero-many-${prefix}-${edgeId})`;
	return undefined;
}

function CardinalityMarkersDefs({
	id,
	strokeColor,
}: { id: string; strokeColor: string }) {
	return (
		<svg
			style={{
				position: "absolute",
				width: 0,
				height: 0,
				pointerEvents: "none",
			}}
		>
			<defs>
				{/* Start Markers */}
				<marker
					id={`card-one-start-${id}`}
					viewBox="-16 -12 20 24"
					refX="0"
					refY="0"
					markerWidth="16"
					markerHeight="16"
					orient="auto-start-reverse"
				>
					<path
						d="M -4 -8 L -4 8 M -10 -8 L -10 8"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-one-start-${id}`}
					viewBox="-20 -12 24 24"
					refX="0"
					refY="0"
					markerWidth="18"
					markerHeight="18"
					orient="auto-start-reverse"
				>
					<circle
						cx="-12"
						cy="0"
						r="4"
						stroke={strokeColor}
						strokeWidth="2"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -4 -8 L -4 8"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-one-many-start-${id}`}
					viewBox="-18 -12 22 24"
					refX="0"
					refY="0"
					markerWidth="18"
					markerHeight="18"
					orient="auto-start-reverse"
				>
					<path
						d="M -12 -8 L -12 8 M -12 -8 L 0 0 M -12 0 L 0 0 M -12 8 L 0 0"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-many-start-${id}`}
					viewBox="-22 -12 26 24"
					refX="0"
					refY="0"
					markerWidth="20"
					markerHeight="20"
					orient="auto-start-reverse"
				>
					<circle
						cx="-15"
						cy="0"
						r="4"
						stroke={strokeColor}
						strokeWidth="2"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -8 -8 L 0 0 M -8 0 L 0 0 M -8 8 L 0 0"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				{/* End Markers */}
				<marker
					id={`card-one-end-${id}`}
					viewBox="-16 -12 20 24"
					refX="0"
					refY="0"
					markerWidth="16"
					markerHeight="16"
					orient="auto-start-reverse"
				>
					<path
						d="M -4 -8 L -4 8 M -10 -8 L -10 8"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-one-end-${id}`}
					viewBox="-20 -12 24 24"
					refX="0"
					refY="0"
					markerWidth="18"
					markerHeight="18"
					orient="auto-start-reverse"
				>
					<circle
						cx="-12"
						cy="0"
						r="4"
						stroke={strokeColor}
						strokeWidth="2"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -4 -8 L -4 8"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-one-many-end-${id}`}
					viewBox="-18 -12 22 24"
					refX="0"
					refY="0"
					markerWidth="18"
					markerHeight="18"
					orient="auto-start-reverse"
				>
					<path
						d="M -12 -8 L -12 8 M -12 -8 L 0 0 M -12 0 L 0 0 M -12 8 L 0 0"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-many-end-${id}`}
					viewBox="-22 -12 26 24"
					refX="0"
					refY="0"
					markerWidth="20"
					markerHeight="20"
					orient="auto-start-reverse"
				>
					<circle
						cx="-15"
						cy="0"
						r="4"
						stroke={strokeColor}
						strokeWidth="2"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -8 -8 L 0 0 M -8 0 L 0 0 M -8 8 L 0 0"
						stroke={strokeColor}
						strokeWidth="2"
						fill="none"
					/>
				</marker>
			</defs>
		</svg>
	);
}

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
		data?.endCardinality || "0..*",
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

	const strokeColor = selected
		? "var(--color-primary, #3b82f6)"
		: (style.stroke as string) || "#71717a";

	const startMarkerUrl = getMarkerUrl(startCard, id, true);
	const endMarkerUrl = getMarkerUrl(endCard, id, false);

	return (
		<>
			<CardinalityMarkersDefs id={id} strokeColor={strokeColor} />

			<BaseEdge
				path={edgePath}
				markerStart={startMarkerUrl}
				markerEnd={endMarkerUrl || markerEnd}
				style={{
					strokeWidth: selected ? 2.5 : 2,
					stroke: strokeColor,
					...style,
				}}
			/>

			<EdgeLabelRenderer>
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

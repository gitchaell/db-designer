"use client";

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
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/app/components/Button";
import { ColorPicker } from "@/app/components/ColorPicker";
import { Input } from "@/app/components/Input";
import { Select } from "@/app/components/Select";
import { useStore } from "@/app/store/useStore";
import type { AppEdge, RelationCardinality } from "@/app/types";

const CARDINALITY_OPTIONS: { label: string; value: RelationCardinality }[] = [
	{ label: "None", value: "none" },
	{ label: "Exactly One (1)", value: "1" },
	{ label: "Zero or One (0..1)", value: "0..1" },
	{ label: "Exactly One (1..1)", value: "1..1" },
	{ label: "Zero or Many (0..*)", value: "0..*" },
	{ label: "One or Many (1..*)", value: "1..*" },
	{ label: "Many (N)", value: "N" },
	{ label: "Many (*)", value: "*" },
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
}: {
	id: string;
	strokeColor: string;
}) {
	return (
		<svg
			style={{
				position: "absolute",
				width: 0,
				height: 0,
				pointerEvents: "none",
			}}
		>
			<title>Cardinality Markers</title>
			<defs>
				{/* Start Markers */}
				<marker
					id={`card-one-start-${id}`}
					viewBox="-16 -10 20 20"
					refX="0"
					refY="0"
					markerWidth="14"
					markerHeight="14"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<path
						d="M -3 -6 L -3 6 M -8 -6 L -8 6"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-one-start-${id}`}
					viewBox="-18 -10 22 20"
					refX="0"
					refY="0"
					markerWidth="16"
					markerHeight="16"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<circle
						cx="-10"
						cy="0"
						r="3"
						stroke={strokeColor}
						strokeWidth="1.5"
						strokeDasharray="none"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -3 -6 L -3 6"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-one-many-start-${id}`}
					viewBox="-16 -10 20 20"
					refX="0"
					refY="0"
					markerWidth="16"
					markerHeight="16"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<path
						d="M -10 -6 L -10 6 M -10 -6 L 0 0 M -10 0 L 0 0 M -10 6 L 0 0"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-many-start-${id}`}
					viewBox="-20 -10 24 20"
					refX="0"
					refY="0"
					markerWidth="18"
					markerHeight="18"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<circle
						cx="-13"
						cy="0"
						r="3"
						stroke={strokeColor}
						strokeWidth="1.5"
						strokeDasharray="none"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -7 -6 L 0 0 M -7 0 L 0 0 M -7 6 L 0 0"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				{/* End Markers */}
				<marker
					id={`card-one-end-${id}`}
					viewBox="-16 -10 20 20"
					refX="0"
					refY="0"
					markerWidth="14"
					markerHeight="14"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<path
						d="M -3 -6 L -3 6 M -8 -6 L -8 6"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-one-end-${id}`}
					viewBox="-18 -10 22 20"
					refX="0"
					refY="0"
					markerWidth="16"
					markerHeight="16"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<circle
						cx="-10"
						cy="0"
						r="3"
						stroke={strokeColor}
						strokeWidth="1.5"
						strokeDasharray="none"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -3 -6 L -3 6"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-one-many-end-${id}`}
					viewBox="-16 -10 20 20"
					refX="0"
					refY="0"
					markerWidth="16"
					markerHeight="16"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<path
						d="M -10 -6 L -10 6 M -10 -6 L 0 0 M -10 0 L 0 0 M -10 6 L 0 0"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
						fill="none"
					/>
				</marker>

				<marker
					id={`card-zero-many-end-${id}`}
					viewBox="-20 -10 24 20"
					refX="0"
					refY="0"
					markerWidth="18"
					markerHeight="18"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<circle
						cx="-13"
						cy="0"
						r="3"
						stroke={strokeColor}
						strokeWidth="1.5"
						strokeDasharray="none"
						fill="var(--color-bg, #09090b)"
					/>
					<path
						d="M -7 -6 L 0 0 M -7 0 L 0 0 M -7 6 L 0 0"
						stroke={strokeColor}
						strokeWidth="1.75"
						strokeDasharray="none"
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
	const [customColor, setCustomColor] = useState<string>(
		data?.color || edgeSettings.defaultColor || "#71717a",
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
			color: customColor,
		});
		setIsOpen(false);
	};

	const handleDelete = () => {
		onEdgesChange([{ id, type: "remove" }]);
		setIsOpen(false);
	};

	const strokeColor = selected
		? "var(--color-primary, #3b82f6)"
		: data?.color ||
			edgeSettings.defaultColor ||
			(style.stroke as string) ||
			"#71717a";

	const showMarkers = edgeSettings.showRelationMarkers !== false;
	const startMarkerUrl = showMarkers
		? getMarkerUrl(startCard, id, true)
		: undefined;
	const endMarkerUrl = showMarkers
		? getMarkerUrl(endCard, id, false) || markerEnd
		: undefined;

	return (
		<>
			<CardinalityMarkersDefs id={id} strokeColor={strokeColor} />

			<BaseEdge
				path={edgePath}
				markerStart={startMarkerUrl}
				markerEnd={endMarkerUrl}
				style={{
					...style,
					strokeWidth: selected ? 2.5 : 2,
					stroke: strokeColor,
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
								setCustomColor(data?.color || edgeSettings.defaultColor || "#71717a");
								setIsOpen(true);
							}
						}}
						className={clsx(
							"px-2 py-0.5 text-xs font-semibold rounded-md shadow-2xs border transition-all flex items-center gap-1 cursor-pointer",
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
							<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
								<div className="bg-popover border border-border text-popover-foreground rounded-2xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4 font-sans animate-in fade-in zoom-in-95 duration-100">
									<div className="flex items-center justify-between border-b border-border pb-3">
										<h3 className="text-sm font-bold flex items-center gap-2">
											<Settings2 className="w-4 h-4 text-primary" />
											Relationship Edge Settings
										</h3>
										<button
											type="button"
											onClick={() => setIsOpen(false)}
											className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
										>
											<X className="w-4 h-4" />
										</button>
									</div>

									{/* Label Input */}
									<div className="flex flex-col gap-1.5">
										<label
											htmlFor={`edge-label-input-${id}`}
											className="text-xs font-semibold text-muted-foreground"
										>
											Relation Label / Name
										</label>
										<Input
											id={`edge-label-input-${id}`}
											value={labelInput}
											onChange={(e) => setLabelInput(e.target.value)}
											placeholder="e.g. belongs_to, contains"
										/>
									</div>

									{/* Custom Color Selector */}
									<div className="flex flex-col gap-1.5">
										<label
											htmlFor={`edge-color-input-${id}`}
											className="text-xs font-semibold text-muted-foreground"
										>
											Edge Line Color
										</label>
										<div className="pt-0.5">
											<ColorPicker
												value={customColor}
												onChange={(color) => setCustomColor(color)}
												size="md"
											/>
										</div>
									</div>

									{/* Start Cardinality */}
									<div className="flex flex-col gap-1.5">
										<label
											htmlFor={`start-card-select-${id}`}
											className="text-xs font-semibold text-muted-foreground"
										>
											Start Symbol / Cardinality
										</label>
										<Select
											value={startCard}
											onChange={(val) => setStartCard(val as RelationCardinality)}
											options={CARDINALITY_OPTIONS}
											className="w-full h-8 text-xs bg-background border border-border rounded-md"
										/>
									</div>

									{/* End Cardinality */}
									<div className="flex flex-col gap-1.5">
										<label
											htmlFor={`end-card-select-${id}`}
											className="text-xs font-semibold text-muted-foreground"
										>
											End Symbol / Cardinality
										</label>
										<Select
											value={endCard}
											onChange={(val) => setEndCard(val as RelationCardinality)}
											options={CARDINALITY_OPTIONS}
											className="w-full h-8 text-xs bg-background border border-border rounded-md"
										/>
									</div>

									{/* Actions */}
									<div className="flex items-center justify-between border-t border-border pt-4 mt-1">
										<Button
											variant="destructive"
											size="sm"
											onClick={handleDelete}
											className="text-xs"
										>
											<Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
										</Button>

										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setIsOpen(false)}
												className="text-xs"
											>
												Cancel
											</Button>
											<Button
												variant="primary"
												size="sm"
												onClick={handleSave}
												className="text-xs"
											>
												<Check className="w-3.5 h-3.5 mr-1" /> Save
											</Button>
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

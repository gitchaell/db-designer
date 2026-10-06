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
import { Check, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/components/Button";
import { ColorPicker } from "@/app/components/ColorPicker";
import { FloatingWindow } from "@/app/components/FloatingWindow";
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

					{/* Movable Floating Window for Edge Settings */}
					<FloatingWindow
						isOpen={isOpen}
						onClose={() => setIsOpen(false)}
						title="Relationship Edge Settings"
						subtitle="Customize label, cardinality markers, and line colors"
						icon={<Settings2 className="w-4 h-4 text-primary" />}
						defaultPosition={{ x: Math.max(20, labelX - 180), y: Math.max(20, labelY - 120) }}
						className="w-[380px]"
					>
						<div className="flex flex-col gap-3 text-xs font-sans">
							{/* Label Input */}
							<div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-background border border-border/70 shadow-2xs">
								<label
									htmlFor={`edge-label-input-${id}`}
									className="text-xs font-medium text-foreground"
								>
									Relation Label / Name
								</label>
								<Input
									id={`edge-label-input-${id}`}
									value={labelInput}
									onChange={(e) => setLabelInput(e.target.value)}
									placeholder="e.g. belongs_to, contains"
									className="h-8 text-xs"
								/>
							</div>

							{/* Custom Color Selector */}
							<div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-background border border-border/70 shadow-2xs">
								<label
									htmlFor={`edge-color-input-${id}`}
									className="text-xs font-medium text-foreground"
								>
									Edge Line Color
								</label>
								<div className="pt-0.5">
									<ColorPicker
										value={customColor}
										onChange={(color) => setCustomColor(color)}
										size="sm"
									/>
								</div>
							</div>

							{/* Start Cardinality */}
							<div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/70 shadow-2xs">
								<label
									htmlFor={`start-card-select-${id}`}
									className="text-xs font-medium text-foreground"
								>
									Start Symbol
								</label>
								<Select
									value={startCard}
									onChange={(val) => setStartCard(val as RelationCardinality)}
									options={CARDINALITY_OPTIONS}
									className="w-40 h-7 text-xs"
								/>
							</div>

							{/* End Cardinality */}
							<div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/70 shadow-2xs">
								<label
									htmlFor={`end-card-select-${id}`}
									className="text-xs font-medium text-foreground"
								>
									End Symbol
								</label>
								<Select
									value={endCard}
									onChange={(val) => setEndCard(val as RelationCardinality)}
									options={CARDINALITY_OPTIONS}
									className="w-40 h-7 text-xs"
								/>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-between border-t border-border/60 pt-3 mt-1">
								<Button
									variant="destructive"
									size="sm"
									onClick={handleDelete}
									className="text-xs h-8"
								>
									<Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Edge
								</Button>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsOpen(false)}
										className="text-xs h-8"
									>
										Cancel
									</Button>
									<Button
										variant="primary"
										size="sm"
										onClick={handleSave}
										className="text-xs h-8"
									>
										<Check className="w-3.5 h-3.5 mr-1" /> Save
									</Button>
								</div>
							</div>
						</div>
					</FloatingWindow>
				</div>
			</EdgeLabelRenderer>
		</>
	);
}

"use client";

import { type NodeProps, NodeResizer } from "@xyflow/react";
import { clsx } from "clsx";
import { Folder, Palette, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/app/store/useStore";
import type { AppNode } from "@/app/types";

const CONTAINER_COLORS = [
	{
		label: "Zinc",
		border: "border-zinc-500/50",
		bg: "bg-zinc-500/10",
		text: "text-zinc-500",
	},
	{
		label: "Blue",
		border: "border-blue-500/50",
		bg: "bg-blue-500/10",
		text: "text-blue-500",
	},
	{
		label: "Emerald",
		border: "border-emerald-500/50",
		bg: "bg-emerald-500/10",
		text: "text-emerald-500",
	},
	{
		label: "Purple",
		border: "border-purple-500/50",
		bg: "bg-purple-500/10",
		text: "text-purple-500",
	},
	{
		label: "Amber",
		border: "border-amber-500/50",
		bg: "bg-amber-500/10",
		text: "text-amber-500",
	},
	{
		label: "Rose",
		border: "border-rose-500/50",
		bg: "bg-rose-500/10",
		text: "text-rose-500",
	},
	{
		label: "Indigo",
		border: "border-indigo-500/50",
		bg: "bg-indigo-500/10",
		text: "text-indigo-500",
	},
	{
		label: "Cyan",
		border: "border-cyan-500/50",
		bg: "bg-cyan-500/10",
		text: "text-cyan-500",
	},
	{
		label: "Teal",
		border: "border-teal-500/50",
		bg: "bg-teal-500/10",
		text: "text-teal-500",
	},
	{
		label: "Orange",
		border: "border-orange-500/50",
		bg: "bg-orange-500/10",
		text: "text-orange-500",
	},
	{
		label: "Pink",
		border: "border-pink-500/50",
		bg: "bg-pink-500/10",
		text: "text-pink-500",
	},
	{
		label: "Red",
		border: "border-red-500/50",
		bg: "bg-red-500/10",
		text: "text-red-500",
	},
];

export default function ContainerNode({
	id,
	data,
	selected,
}: NodeProps<Extract<AppNode, { type: "container" }>>) {
	const { updateNodeData, deleteNode, isReadOnly } = useStore();
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);

	const currentColor =
		CONTAINER_COLORS.find((c) => c.text === data.color) || CONTAINER_COLORS[0];

	// Color Picker Outside Click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
				setIsColorPickerOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			{!isReadOnly && (
				<NodeResizer
					color="#71717a"
					isVisible={selected}
					minWidth={300}
					minHeight={200}
				/>
			)}

			<div
				ref={nodeRef}
				className={clsx(
					"w-full h-full rounded-2xl border-2 transition-all flex flex-col p-3 relative",
					currentColor.border,
					currentColor.bg,
					selected ? "ring-2 ring-primary/50 shadow-lg" : "shadow-xs",
				)}
				style={{ minWidth: 300, minHeight: 200, zIndex: -1 }}
			>
				{/* Container Header */}
				<div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2 group/header">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<Folder className={clsx("w-4 h-4 flex-none", currentColor.text)} />
						{isReadOnly ? (
							<span
								className={clsx(
									"font-bold text-sm truncate",
									currentColor.text,
								)}
							>
								{data.label || "Module Container"}
							</span>
						) : (
							<input
								type="text"
								value={data.label || ""}
								onChange={(e) => updateNodeData(id, { label: e.target.value })}
								placeholder="Container / Module Name"
								className={clsx(
									"bg-transparent font-bold text-sm focus:outline-none w-full border-b border-transparent focus:border-border transition-colors",
									currentColor.text,
								)}
							/>
						)}
					</div>

					{!isReadOnly && (
						<div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
							{/* Color Picker */}
							<div className="relative">
								<button
									type="button"
									onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
									className="p-1 hover:bg-background/80 rounded text-muted-foreground hover:text-foreground transition-colors"
									title="Change Color"
								>
									<Palette className="w-3.5 h-3.5" />
								</button>

								{isColorPickerOpen && (
									<div className="absolute right-0 top-full mt-1 p-1.5 bg-popover border border-border rounded-lg shadow-xl grid grid-cols-4 gap-1.5 z-[100] w-48">
										{CONTAINER_COLORS.map((c) => (
											<button
												type="button"
												key={c.label}
												title={c.label}
												className={clsx(
													"w-8 h-8 rounded border transition-transform hover:scale-105 cursor-pointer flex items-center justify-center text-xs font-bold",
													c.bg,
													c.border,
													c.text,
												)}
												onClick={() => {
													updateNodeData(id, { color: c.text });
													setIsColorPickerOpen(false);
												}}
											>
												{c.label[0]}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Delete */}
							<button
								type="button"
								onClick={() => deleteNode(id)}
								className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
								title="Delete Container"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

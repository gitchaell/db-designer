import { useStore } from "@/app/store/useStore";
import type { AppNode } from "@/app/types";
import { type NodeProps, NodeResizer } from "@xyflow/react";
import { clsx } from "clsx";
import { GripVertical, Minimize, Palette, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { TableField } from "./TableField";
import { TableRow } from "./TableRow";

// Expanded color palette
const COLORS = [
	"bg-zinc-900", // Default (Reset)
	"bg-blue-600",
	"bg-emerald-600",
	"bg-red-600",
	"bg-amber-600",
	"bg-purple-600",
	"bg-pink-600",
	"bg-indigo-600",
	"bg-cyan-600",
	"bg-teal-600",
	"bg-orange-600",
	"bg-lime-600",
];

export default function TableNode({ id, data, selected }: NodeProps<AppNode>) {
	const {
		updateNodeData,
		updateNode,
		addColumn,
		updateColumn,
		deleteColumn,
		deleteNode,
		isReadOnly,
	} = useStore();

	const handleAddColumnWithFocus = useRef(() => {
		const newColId = uuidv4();
		addColumn(id, {
			id: newColId,
			name: "new_column",
			type: "varchar",
			isPk: false,
			isFk: false,
		});

		// Attempt to focus the new column input after a short delay
		setTimeout(() => {
			const inputs = nodeRef.current?.querySelectorAll(`input`);
			if (inputs && inputs.length > 0) {
				const lastInput = inputs[inputs.length - 1];
				if (lastInput) {
					lastInput.focus();
					lastInput.select();
				}
			}
		}, 50);
	});

	// Update the ref so the event listener doesn't need to depend on the function directly
	useEffect(() => {
		handleAddColumnWithFocus.current = () => {
			const newColId = uuidv4();
			addColumn(id, {
				id: newColId,
				name: "new_column",
				type: "varchar",
				isPk: false,
				isFk: false,
			});

			setTimeout(() => {
				const inputs = nodeRef.current?.querySelectorAll(`input`);
				if (inputs && inputs.length > 0) {
					const lastInput = inputs[inputs.length - 1];
					if (lastInput) {
						lastInput.focus();
						lastInput.select();
					}
				}
			}, 50);
		};
	}, [addColumn, id]);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);

	// Color Picker Outside Click Handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
				setIsColorPickerOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Listen to custom field-enter event
	useEffect(() => {
		const node = nodeRef.current;
		if (!node) return;

		const handleFieldEnter = () => {
			handleAddColumnWithFocus.current();
		};

		node.addEventListener("field-enter", handleFieldEnter as EventListener);
		return () => {
			node.removeEventListener("field-enter", handleFieldEnter as EventListener);
		};
	}, []);

	const handleAutofit = () => {
		// Using 'auto' allows the element to shrink back to its content size
		updateNode(id, { style: { width: "auto", height: "auto" } });
		// Reset to undefined immediately after so it doesn't get stuck at auto if the user tries to resize
		setTimeout(() => {
			updateNode(id, { style: { width: undefined, height: undefined } });
		}, 50);
	};

	// Determine header color. Default is transparent/zinc-900 styled via class.
	const headerColor = data.color || "bg-zinc-900";

	return (
		<>
			<NodeResizer
				color="#71717a"
				isVisible={selected}
				minWidth={320}
				minHeight={100}
			/>
			<div
				ref={nodeRef}
				className={clsx(
					"min-w-[320px] rounded-lg border shadow-xl transition-all bg-card flex flex-col h-full",
					selected ? "border-ring ring-1 ring-ring/50" : "border-border",
				)}
				style={{ width: "100%", height: "100%" }}
			>
				{/* Header - Applies color only here */}
				<div
					className={clsx(
						"px-3 py-2 border-b border-white/10 flex items-center gap-2 group/header transition-colors flex-none rounded-t-lg",
						headerColor,
					)}
				>
					<GripVertical className="w-4 h-4 text-white/50 cursor-grab active:cursor-grabbing flex-none" />

					<TableField
						value={data.label}
						isReadOnly={isReadOnly}
						onChange={(val) => updateNodeData(id, { label: val })}
						className="text-sm font-bold text-white flex-1 font-sans placeholder-white/40"
						readOnlyClassName="bg-transparent text-sm font-bold text-white flex-1 font-sans truncate"
						placeholder="Table Name"
					/>

					<div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity flex-none">
						{/* Autofit Button */}
						<button
							type="button"
							onClick={handleAutofit}
							className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
							title="Autofit Size"
						>
							<Minimize className="w-3.5 h-3.5" />
						</button>

						{!isReadOnly && (
							<>
								<div className="relative">
									<button
										type="button"
										onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
										className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
									>
										<Palette className="w-3.5 h-3.5" />
									</button>
									{isColorPickerOpen && (
										<div className="absolute right-0 top-full mt-2 p-2 bg-popover border border-border rounded-lg shadow-xl grid grid-cols-4 gap-2 z-[100] w-48">
											{COLORS.map((c) => (
												<button
													type="button"
													key={c}
													className={clsx(
														"w-8 h-8 rounded-md border border-white/10 hover:scale-110 transition-transform cursor-pointer",
														c,
													)}
													onClick={() => {
														updateNodeData(id, { color: c });
														setIsColorPickerOpen(false);
													}}
												/>
											))}
										</div>
									)}
								</div>
								<button
									type="button"
									onClick={() => deleteNode(id)}
									className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-red-300 transition-colors"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</button>
							</>
						)}
					</div>
				</div>

				{/* Columns */}
				<div
					className="flex flex-col py-1 gap-0.5 flex-1 overflow-y-auto min-h-0 custom-scrollbar"
				>
					{data.columns.map((col) => (
						<TableRow
							key={col.id}
							nodeId={id}
							col={col}
							isReadOnly={isReadOnly}
							updateColumn={updateColumn}
							deleteColumn={deleteColumn}
						/>
					))}
				</div>

				{/* Footer Action */}
				{!isReadOnly && (
					<button
						type="button"
						onClick={() => handleAddColumnWithFocus.current()}
						className="w-full py-2 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-t border-border rounded-b-lg flex-none"
					>
						<Plus className="w-3 h-3" /> Add Column
					</button>
				)}
			</div>
		</>
	);
}

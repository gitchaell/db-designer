import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Key, Lock, Plus, Trash2, GripVertical, Palette, X } from 'lucide-react';
import type { AppNode, ColumnType } from '@/app/types';
import { useStore } from '@/app/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

const COLUMN_TYPES: ColumnType[] = ['uuid', 'varchar', 'int', 'boolean', 'timestamp', 'text', 'json'];
const COLORS = [
	'bg-zinc-950', // Default
	'bg-blue-950',
	'bg-green-950',
	'bg-red-950',
	'bg-yellow-950',
	'bg-purple-950',
];

export default function TableNode({ id, data, selected }: NodeProps<AppNode>) {
	const { updateNodeData, addColumn, updateColumn, deleteColumn, deleteNode } = useStore();
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);
	const { setNodes } = useReactFlow();

	// Color Picker Outside Click Handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
				setIsColorPickerOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleAddColumn = () => {
		addColumn(id, {
			id: uuidv4(),
			name: 'new_column',
			type: 'varchar',
			isPk: false,
			isFk: false,
		});
	};

	const bgColor = data.color || 'bg-zinc-950';

	return (
		<div
			ref={nodeRef}
			className={clsx(
				'min-w-[300px] overflow-hidden rounded-lg border shadow-xl transition-all',
				selected ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-zinc-800',
				bgColor
			)}
		>
			{/* Header */}
			<div className="bg-black/20 px-3 py-2 border-b border-white/5 flex items-center gap-2 group/header">
				<GripVertical className="w-4 h-4 text-zinc-600 cursor-grab active:cursor-grabbing" />
				<input
					type="text"
					value={data.label}
					onChange={(e) => updateNodeData(id, { label: e.target.value })}
					className="bg-transparent text-sm font-bold text-zinc-100 focus:outline-none flex-1 font-sans placeholder-zinc-600"
					placeholder="Table Name"
				/>

				<div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
					<div className="relative">
						<button
							onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
							className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-purple-400 transition-colors"
						>
							<Palette className="w-3.5 h-3.5" />
						</button>
						{isColorPickerOpen && (
							<div className="absolute right-0 top-full mt-2 p-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl grid grid-cols-3 gap-2 z-50 w-32">
								{COLORS.map((c) => (
									<button
										key={c}
										className={clsx("w-6 h-6 rounded-full border border-white/10", c)}
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
						onClick={() => deleteNode(id)}
						className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-red-400 transition-colors"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Columns */}
			<div className="flex flex-col py-1">
				{data.columns.map((col) => (
					<div
						key={col.id}
						className="relative flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5 transition-colors group/col"
					>
						{/* Handles */}
						<Handle
							type="target"
							position={Position.Left}
							id={`${col.id}-target`}
							className="!bg-purple-500 !w-2 !h-2 !-left-1 !border-none opacity-0 group-hover/col:opacity-100 transition-opacity"
						/>

						{/* PK/FK Toggles */}
						<div className="flex items-center gap-1 min-w-[32px]">
							<button
								onClick={() => updateColumn(id, col.id, { isPk: !col.isPk })}
								className={clsx(
									"transition-colors",
									col.isPk ? "text-purple-400" : "text-zinc-700 hover:text-zinc-500"
								)}
							>
								<Key className="w-3 h-3" />
							</button>
							<button
								onClick={() => updateColumn(id, col.id, { isFk: !col.isFk })}
								className={clsx(
									"transition-colors",
									col.isFk ? "text-blue-400" : "text-zinc-700 hover:text-zinc-500"
								)}
							>
								<Lock className="w-3 h-3" />
							</button>
						</div>

						{/* Column Name */}
						<input
							type="text"
							value={col.name}
							onChange={(e) => updateColumn(id, col.id, { name: e.target.value })}
							className={clsx(
								"bg-transparent focus:outline-none flex-1 font-sans min-w-0",
								col.isPk ? "text-white font-medium" : "text-zinc-300"
							)}
						/>

						{/* Column Type */}
						<select
							value={col.type}
							onChange={(e) => updateColumn(id, col.id, { type: e.target.value as ColumnType })}
							className="bg-transparent text-xs text-zinc-500 font-mono focus:outline-none text-right appearance-none hover:text-zinc-300 cursor-pointer"
						>
							{COLUMN_TYPES.map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
						</select>

						{/* Delete Column */}
						<button
							onClick={() => deleteColumn(id, col.id)}
							className="opacity-0 group-hover/col:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-opacity"
						>
							<X className="w-3 h-3" />
						</button>

						<Handle
							type="source"
							position={Position.Right}
							id={`${col.id}-source`}
							className="!bg-purple-500 !w-2 !h-2 !-right-1 !border-none opacity-0 group-hover/col:opacity-100 transition-opacity"
						/>
					</div>
				))}
			</div>

			{/* Footer Action */}
			<button
				onClick={handleAddColumn}
				className="w-full py-2 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors border-t border-white/5"
			>
				<Plus className="w-3 h-3" /> Add Column
			</button>
		</div>
	);
}

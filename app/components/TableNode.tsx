import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Key, Lock, Plus, Trash2, GripVertical, Palette, X } from 'lucide-react';
import type { AppNode, ColumnType } from '@/app/types';
import { useStore } from '@/app/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

const COLUMN_TYPES: ColumnType[] = ['uuid', 'varchar', 'int', 'boolean', 'timestamp', 'text', 'json'];

// Expanded color palette
const COLORS = [
	'bg-zinc-900', // Default (Reset)
	'bg-blue-600',
	'bg-emerald-600',
	'bg-red-600',
	'bg-amber-600',
	'bg-purple-600',
	'bg-pink-600',
	'bg-indigo-600',
	'bg-cyan-600',
	'bg-teal-600',
	'bg-orange-600',
	'bg-lime-600',
];

export default function TableNode({ id, data, selected }: NodeProps<AppNode>) {
	const { updateNodeData, addColumn, updateColumn, deleteColumn, deleteNode } = useStore();
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);

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

	// Determine header color. Default is transparent/zinc-900 styled via class.
	const headerColor = data.color || 'bg-zinc-900';

	return (
		<div
			ref={nodeRef}
			className={clsx(
				'min-w-[320px] overflow-hidden rounded-lg border shadow-xl transition-all bg-zinc-950',
				selected ? 'border-zinc-400 ring-1 ring-zinc-400/50' : 'border-zinc-800'
			)}
		>
			{/* Header - Applies color only here */}
			<div className={clsx("px-3 py-2 border-b border-white/10 flex items-center gap-2 group/header transition-colors", headerColor)}>
				<GripVertical className="w-4 h-4 text-white/50 cursor-grab active:cursor-grabbing" />
				<input
					type="text"
					value={data.label}
					onChange={(e) => updateNodeData(id, { label: e.target.value })}
					className="bg-transparent text-sm font-bold text-white focus:outline-none flex-1 font-sans placeholder-white/40"
					placeholder="Table Name"
				/>

				<div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
					<div className="relative">
						<button
							onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
							className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
						>
							<Palette className="w-3.5 h-3.5" />
						</button>
						{isColorPickerOpen && (
							<div className="absolute right-0 top-full mt-2 p-2 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl grid grid-cols-4 gap-2 z-50 w-48">
								{COLORS.map((c) => (
									<button
										key={c}
										className={clsx("w-8 h-8 rounded-md border border-white/10 hover:scale-110 transition-transform", c)}
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
						className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-red-300 transition-colors"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Columns */}
			<div className="flex flex-col py-1 gap-0.5">
				{data.columns.map((col) => (
					<div
						key={col.id}
						className="relative flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-zinc-900/50 transition-colors group/col"
					>
						{/* Handles */}
						<Handle
							type="target"
							position={Position.Left}
							id={`${col.id}-target`}
							className="!bg-zinc-400 !w-2 !h-2 !-left-1 !border-zinc-950 opacity-0 group-hover/col:opacity-100 transition-opacity"
						/>

						{/* PK/FK Toggles */}
						<div className="flex items-center gap-0.5 min-w-[36px]">
							<button
								onClick={() => updateColumn(id, col.id, { isPk: !col.isPk })}
								className={clsx(
									"p-0.5 rounded transition-colors",
									col.isPk ? "text-amber-400 bg-amber-400/10" : "text-zinc-700 hover:text-zinc-500"
								)}
								title="Primary Key"
							>
								<Key className="w-3 h-3" />
							</button>
							<button
								onClick={() => updateColumn(id, col.id, { isFk: !col.isFk })}
								className={clsx(
									"p-0.5 rounded transition-colors",
									col.isFk ? "text-blue-400 bg-blue-400/10" : "text-zinc-700 hover:text-zinc-500"
								)}
								title="Foreign Key"
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
								"bg-transparent focus:outline-none flex-1 font-sans min-w-0 h-6 px-1 rounded hover:bg-zinc-900 focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-700 transition-all",
								col.isPk ? "text-white font-medium" : "text-zinc-300"
							)}
						/>

						{/* Column Type */}
						<select
							value={col.type}
							onChange={(e) => updateColumn(id, col.id, { type: e.target.value as ColumnType })}
							className="bg-transparent text-xs text-zinc-500 font-mono focus:outline-none text-right appearance-none hover:text-zinc-300 cursor-pointer py-0.5"
						>
							{COLUMN_TYPES.map(t => <option key={t} value={t} className="bg-zinc-950 text-zinc-300">{t}</option>)}
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
							className="!bg-zinc-400 !w-2 !h-2 !-right-1 !border-zinc-950 opacity-0 group-hover/col:opacity-100 transition-opacity"
						/>
					</div>
				))}
			</div>

			{/* Footer Action */}
			<button
				onClick={handleAddColumn}
				className="w-full py-2 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors border-t border-zinc-800/50"
			>
				<Plus className="w-3 h-3" /> Add Column
			</button>
		</div>
	);
}

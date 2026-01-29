import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Key, Lock } from "lucide-react";
import type { AppNode } from "@/app/store/useStore";

export default function TableNode({ data }: NodeProps<AppNode>) {
	return (
		<div className="min-w-[250px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 shadow-xl">
			{/* Header */}
			<div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800">
				<h3 className="text-sm font-semibold text-zinc-100">{data.label}</h3>
			</div>

			{/* Columns */}
			<div className="flex flex-col">
				{data.columns.map((col) => (
					<div
						key={col.name}
						className="relative flex items-center justify-between px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900/50 transition-colors group"
					>
						{/* Target Handle (Left) */}
						<Handle
							type="target"
							position={Position.Left}
							id={`${col.name}-target`}
							className="!bg-purple-500 !w-2 !h-2 !-left-1 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
						/>

						<div className="flex items-center gap-2">
							{col.isPk && <Key className="w-3 h-3 text-purple-400" />}
							{col.isFk && <Lock className="w-3 h-3 text-zinc-500" />}
							{!col.isPk && !col.isFk && <div className="w-3" />}
							<span className={col.isPk ? "font-medium text-zinc-100" : ""}>
								{col.name}
							</span>
						</div>
						<span className="text-xs text-zinc-500 ml-4">{col.type}</span>

						{/* Source Handle (Right) */}
						<Handle
							type="source"
							position={Position.Right}
							id={`${col.name}-source`}
							className="!bg-purple-500 !w-2 !h-2 !-right-1 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
						/>
					</div>
				))}
			</div>
		</div>
	);
}

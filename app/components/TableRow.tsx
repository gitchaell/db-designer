import type { ColumnType } from "@/app/types";
import { Handle, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { Key, Link, Trash2 } from "lucide-react";
import { TableField } from "./TableField";

interface TableRowProps {
	nodeId: string;
	col: {
		id: string;
		name: string;
		type: ColumnType;
		isPk: boolean;
		isFk: boolean;
	};
	isReadOnly: boolean;
	updateColumn: (
		nodeId: string,
		colId: string,
		data: Partial<TableRowProps["col"]>,
	) => void;
	deleteColumn: (nodeId: string, colId: string) => void;
}

const COLUMN_TYPES: ColumnType[] = [
	"uuid",
	"varchar",
	"int",
	"boolean",
	"timestamp",
	"text",
	"json",
];

export function TableRow({
	nodeId,
	col,
	isReadOnly,
	updateColumn,
	deleteColumn,
}: TableRowProps) {
	return (
		<div className="relative flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors group/col">
			{/* Handles Left */}
			<Handle
				type="source"
				position={Position.Left}
				id={`sl-${col.id}`}
				className="!bg-muted-foreground !w-2.5 !h-2.5 !left-0 !border-2 !border-background opacity-0 group-hover/col:opacity-100 transition-opacity"
				isConnectable={true}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id={`tl-${col.id}`}
				className="!bg-muted-foreground !w-2.5 !h-2.5 !left-0 !border-2 !border-background opacity-0 group-hover/col:opacity-100 transition-opacity"
				isConnectable={true}
			/>

			{/* PK/FK Indicators */}
			<div className="flex items-center gap-1 min-w-[36px] flex-none">
				{(!isReadOnly || col.isPk) && (
					<button
						type="button"
						disabled={isReadOnly}
						onClick={() => updateColumn(nodeId, col.id, { isPk: !col.isPk })}
						className={clsx(
							"p-0.5 rounded transition-colors",
							col.isPk
								? "text-amber-500 bg-amber-500/10"
								: "text-muted-foreground hover:text-foreground",
							isReadOnly && "cursor-not-allowed opacity-80",
						)}
						title="Primary Key"
					>
						<Key className="w-3 h-3" />
					</button>
				)}
				{(!isReadOnly || col.isFk) && (
					<button
						type="button"
						disabled={isReadOnly}
						onClick={() => updateColumn(nodeId, col.id, { isFk: !col.isFk })}
						className={clsx(
							"p-0.5 rounded transition-colors",
							col.isFk
								? "text-blue-500 bg-blue-500/10"
								: "text-muted-foreground hover:text-foreground",
							isReadOnly && "cursor-not-allowed opacity-80",
						)}
						title="Foreign Key"
					>
						<Link className="w-3 h-3" />
					</button>
				)}
			</div>

			{/* Column Name */}
			<TableField
				value={col.name}
				isReadOnly={isReadOnly}
				onChange={(val) => updateColumn(nodeId, col.id, { name: val })}
				className={clsx(
					"flex-1 font-sans min-w-0 h-6 px-1 rounded transition-all",
					col.isPk ? "text-foreground font-medium" : "text-muted-foreground",
					!isReadOnly &&
						"hover:bg-muted focus:bg-muted focus:ring-1 focus:ring-ring",
				)}
				readOnlyClassName="flex items-center"
			/>

			{/* Column Type */}
			<TableField
				type="select"
				value={col.type}
				isReadOnly={isReadOnly}
				onChange={(val) =>
					updateColumn(nodeId, col.id, { type: val as ColumnType })
				}
				options={COLUMN_TYPES.map((t) => ({ label: t, value: t }))}
				className="select-sm w-28 flex-none text-right font-mono text-muted-foreground hover:text-foreground !border-none !shadow-none !ring-0 !bg-transparent"
				readOnlyClassName="w-28 flex-none text-right font-mono text-muted-foreground px-1"
			/>

			{/* Delete Column */}
			{!isReadOnly && (
				<button
					type="button"
					onClick={() => deleteColumn(nodeId, col.id)}
					className="opacity-0 group-hover/col:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity flex-none"
				>
					<Trash2 className="w-3.5 h-3.5" />
				</button>
			)}

			{/* Handles Right */}
			<Handle
				type="source"
				position={Position.Right}
				id={`sr-${col.id}`}
				className="!bg-muted-foreground !w-2.5 !h-2.5 !right-0 !border-2 !border-background opacity-0 group-hover/col:opacity-100 transition-opacity"
				isConnectable={true}
			/>
			<Handle
				type="target"
				position={Position.Right}
				id={`tr-${col.id}`}
				className="!bg-muted-foreground !w-2.5 !h-2.5 !right-0 !border-2 !border-background opacity-0 group-hover/col:opacity-100 transition-opacity"
				isConnectable={true}
			/>
		</div>
	);
}

import { isAuditField } from "@/app/lib/column-utils";
import { useStore } from "@/app/store/useStore";
import type { ColumnType } from "@/app/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Handle, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { Clock, GripVertical, Key, Link, Trash2 } from "lucide-react";
import { TableField } from "./TableField";

import type { Column } from "@/app/types";

interface TableRowProps {
	nodeId: string;
	col: Column;
	isReadOnly: boolean;
	updateColumn: (nodeId: string, colId: string, data: Partial<Column>) => void;
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
	const { columnStyleSettings } = useStore();
	const isAudit = isAuditField(col);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: col.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : 1,
		opacity: isDragging ? 0.5 : 1,
	};

	// Determine active column style based on classification
	const activeStyle = col.isPk
		? columnStyleSettings.pk
		: col.isFk
			? columnStyleSettings.fk
			: isAudit
				? columnStyleSettings.audit
				: null;

	const nameStyleInline: React.CSSProperties = {};
	if (activeStyle?.textColor) {
		nameStyleInline.color = activeStyle.textColor;
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			data-colid={col.id}
			className={clsx(
				"relative flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors group/col bg-background",
				isDragging && "shadow-lg border border-primary/50 rounded-md",
			)}
		>
			{!isReadOnly && (
				<button
					type="button"
					className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground/80 opacity-0 group-hover/col:opacity-100 transition-opacity nodrag"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="w-3.5 h-3.5" />
				</button>
			)}
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

			{/* PK/FK/Audit Indicators */}
			<div className="flex items-center gap-1 min-w-[54px] flex-none">
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
				{(!isReadOnly || col.isAudit) && (
					<button
						type="button"
						disabled={isReadOnly}
						onClick={() =>
							updateColumn(nodeId, col.id, { isAudit: !col.isAudit })
						}
						className={clsx(
							"p-0.5 rounded transition-colors",
							col.isAudit
								? "text-purple-500 bg-purple-500/10"
								: "text-muted-foreground hover:text-foreground",
							isReadOnly && "cursor-not-allowed opacity-80",
						)}
						title="Audit Field"
					>
						<Clock className="w-3 h-3" />
					</button>
				)}
			</div>

			{/* Column Name */}
			<TableField
				value={col.name}
				isReadOnly={isReadOnly}
				onChange={(val) => updateColumn(nodeId, col.id, { name: val })}
				style={nameStyleInline}
				className={clsx(
					"flex-1 font-sans min-w-0 h-6 px-1 rounded transition-all",
					activeStyle?.bold && "font-bold",
					activeStyle?.italic && "italic",
					!activeStyle?.bold &&
						!col.isPk &&
						"text-muted-foreground font-normal",
					!isReadOnly &&
						"hover:bg-muted focus:bg-muted focus:ring-1 focus:ring-ring",
				)}
				readOnlyClassName="flex items-center"
			/>

			{/* Column Type */}
			{isReadOnly ? (
				<span className="w-28 flex-none text-right font-mono text-muted-foreground px-0 h-6 flex items-center justify-end">
					{col.type}
				</span>
			) : (
				<Select
					value={col.type}
					onChange={(val) =>
						updateColumn(nodeId, col.id, { type: val as ColumnType })
					}
					options={COLUMN_TYPES.map((t) => ({ label: t, value: t }))}
					className="w-28 flex-none text-right font-mono text-muted-foreground hover:text-foreground !border-none !shadow-none !ring-0 !bg-transparent !p-0 h-6"
				/>
			)}

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

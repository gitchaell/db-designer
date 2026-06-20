import { useStore } from "@/app/store/useStore";
import Editor from "@monaco-editor/react";
import { Download, Loader2, X } from "lucide-react";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface PrismaExportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function PrismaExportModal({
	isOpen,
	onClose,
}: PrismaExportModalProps) {
	const { nodes, edges } = useStore();

	const generatePrisma = useCallback(() => {
		let generated =
			'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n';

		for (const node of nodes) {
			const tableName = node.data.label || "UntitledModel";

			const modelName = tableName
				.split(/[_-\s]+/)
				.map(
					(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
				)
				.join("");

			generated += `model ${modelName} {\n`;

			const cols: string[] = [];

			// Track used relation names to avoid duplicates if multiple FKs point to the same model
			const usedRelationNames = new Set<string>();

			for (const col of node.data.columns) {
				let typeStr = "String";

				if (
					col.type === "uuid" ||
					col.type === "varchar" ||
					col.type === "text"
				) {
					typeStr = "String";
				} else if (col.type === "int") {
					typeStr = "Int";
				} else if (col.type === "boolean") {
					typeStr = "Boolean";
				} else if (col.type === "timestamp") {
					typeStr = "DateTime";
				} else if (col.type === "json") {
					typeStr = "Json";
				}

				let extras = "";
				if (col.isPk) {
					if (col.type === "uuid") {
						extras = " @id @default(uuid())";
					} else if (col.type === "int") {
						extras = " @id @default(autoincrement())";
					} else {
						extras = " @id";
					}
				}

				cols.push(`  ${col.name} ${typeStr}${extras}`);
			}

			// Add foreign key relations
			const outgoingEdges = edges.filter((e) => e.source === node.id);
			for (const edge of outgoingEdges) {
				const sourceHandleParts = edge.sourceHandle?.split("-");
				const fkColId = sourceHandleParts?.[1];
				const fkCol = node.data.columns.find((c) => c.id === fkColId);

				const targetNode = nodes.find((n) => n.id === edge.target);
				if (targetNode && fkCol) {
					const targetModelNameRaw = targetNode.data.label || "UntitledModel";
					const targetModelName = targetModelNameRaw
						.split(/[_-\s]+/)
						.map(
							(word) =>
								word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
						)
						.join("");

					const targetHandleParts = edge.targetHandle?.split("-");
					const pkColId = targetHandleParts?.[1];
					const pkCol = targetNode.data.columns.find((c) => c.id === pkColId);

					if (pkCol) {
						let relationName =
							targetModelName.charAt(0).toLowerCase() +
							targetModelName.slice(1);

						if (usedRelationNames.has(relationName)) {
							relationName = `${relationName}_${fkCol.name}`;
						}
						usedRelationNames.add(relationName);

						cols.push(
							`  ${relationName} ${targetModelName} @relation(fields: [${fkCol.name}], references: [${pkCol.name}])`,
						);
					}
				}
			}

			// Add inverse relations
			const incomingEdges = edges.filter((e) => e.target === node.id);
			for (const edge of incomingEdges) {
				const sourceNode = nodes.find((n) => n.id === edge.source);
				if (sourceNode) {
					const sourceModelNameRaw = sourceNode.data.label || "UntitledModel";
					const sourceModelName = sourceModelNameRaw
						.split(/[_-\s]+/)
						.map(
							(word) =>
								word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
						)
						.join("");

					const sourceHandleParts = edge.sourceHandle?.split("-");
					const fkColId = sourceHandleParts?.[1];
					const fkCol = sourceNode.data.columns.find((c) => c.id === fkColId);

					let relationArrayName =
						sourceModelName.charAt(0).toLowerCase() +
						sourceModelName.slice(1) +
						"s";

					// If the source model has multiple foreign keys to this model, we need to distinguish them
					const multipleFksFromSource = edges.filter(
						(e) => e.source === sourceNode.id && e.target === node.id,
					);
					if (multipleFksFromSource.length > 1 && fkCol) {
						relationArrayName = `${relationArrayName}_${fkCol.name}`;
					}

					cols.push(`  ${relationArrayName} ${sourceModelName}[]`);
				}
			}

			generated += cols.join("\n");
			generated += "\n}\n\n";
		}

		return generated;
	}, [nodes, edges]);

	const prismaCode = isOpen ? generatePrisma() : "";

	const downloadPrisma = () => {
		const blob = new Blob([prismaCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "schema.prisma";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (!isOpen || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
			<div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden">
				<div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
					<div className="flex items-center gap-4">
						<h2 className="text-lg font-bold font-space text-foreground">
							Prisma Schema Preview
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<Button size="sm" onClick={downloadPrisma}>
							<Download className="w-3.5 h-3.5 mr-1.5" />
							Download
						</Button>
						<button
							type="button"
							onClick={onClose}
							className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				<div className="flex-1 w-full bg-[#1e1e1e]">
					<Editor
						height="100%"
						language="prisma"
						theme="vs-dark"
						value={prismaCode}
						loading={
							<div className="flex justify-center items-center h-full text-muted-foreground">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading editor...
							</div>
						}
						options={{
							readOnly: true,
							minimap: { enabled: true },
							renderWhitespace: "all",
							stickyScroll: { enabled: false },
							lineNumbers: "on",
							fontSize: 14,
							fontFamily: "var(--font-jetbrains-mono), monospace",
							padding: { top: 16 },
						}}
					/>
				</div>
			</div>
		</div>,
		document.body,
	);
}

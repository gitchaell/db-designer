import { useStore } from "@/app/store/useStore";
import Editor from "@monaco-editor/react";
import { Download, Loader2, X } from "lucide-react";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface TsExportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function TsExportModal({ isOpen, onClose }: TsExportModalProps) {
	const { nodes } = useStore();

	const generateTs = useCallback(() => {
		let generated = "";

		for (const node of nodes) {
			const tableName = node.data.label || "UntitledTable";

			// Convert table name to PascalCase for interface name
			const interfaceName = tableName
				.split(/[_-\s]+/)
				.map(
					(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
				)
				.join("");

			generated += `export interface ${interfaceName} {\n`;

			const cols = node.data.columns.map((col) => {
				let typeStr = "any";

				// Map internal types to TypeScript types
				if (
					col.type === "uuid" ||
					col.type === "varchar" ||
					col.type === "text"
				) {
					typeStr = "string";
				} else if (col.type === "int") {
					typeStr = "number";
				} else if (col.type === "boolean") {
					typeStr = "boolean";
				} else if (col.type === "timestamp") {
					typeStr = "Date";
				} else if (col.type === "json") {
					typeStr = "Record<string, any>";
				}

				return `  ${col.name}: ${typeStr};`;
			});

			generated += cols.join("\n");
			generated += "\n}\n\n";
		}

		return generated;
	}, [nodes]);

	const tsCode = isOpen ? generateTs() : "";

	const downloadTs = () => {
		const blob = new Blob([tsCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `types.ts`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (!isOpen || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
			<div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
					<div className="flex items-center gap-4">
						<h2 className="text-lg font-bold font-space text-foreground">
							TypeScript Preview
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<Button size="sm" onClick={downloadTs}>
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

				{/* Editor container */}
				<div className="flex-1 w-full bg-[#1e1e1e]">
					<Editor
						height="100%"
						language="typescript"
						theme="vs-dark"
						value={tsCode}
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

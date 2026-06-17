import { useStore } from "@/app/store/useStore";
import Editor from "@monaco-editor/react";
import { Download, FileCode2, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export default function TsExportModal() {
	const { nodes } = useStore();
	const [isOpen, setIsOpen] = useState(false);

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

	return (
		<>
			<Button
				variant="ghost"
				onClick={() => setIsOpen(true)}
				className="w-full justify-start h-8 px-2 text-sm font-medium text-foreground"
			>
				<FileCode2 className="w-4 h-4 mr-2 text-muted-foreground" />
				Export TS
			</Button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
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
										onClick={() => setIsOpen(false)}
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
										fontFamily: '"JetBrains Mono", var(--font-mono), monospace',
										padding: { top: 16 },
									}}
								/>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

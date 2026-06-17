import { useStore } from "@/app/store/useStore";
import Editor from "@monaco-editor/react";
import { Download, FileCode2, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { Select } from "./Select";

type Dialect = "postgresql" | "mysql" | "sqlite";

export default function SqlPreviewModal() {
	const { nodes } = useStore();
	const [isOpen, setIsOpen] = useState(false);
	const [dialect, setDialect] = useState<Dialect>("postgresql");

	const generateSql = useCallback(() => {
		let generated = "";

		for (const node of nodes) {
			const tableName = node.data.label || "untitled_table";
			generated += `CREATE TABLE ${tableName} (\n`;

			const cols = node.data.columns.map((col) => {
				let typeStr = col.type.toUpperCase();
				let extras = "";

				// Basic Dialect differences
				if (dialect === "postgresql") {
					if (col.type === "uuid") typeStr = "UUID";
					if (col.type === "int") typeStr = "INTEGER";
					if (col.type === "varchar") typeStr = "VARCHAR(255)";
				} else if (dialect === "mysql") {
					if (col.type === "uuid") typeStr = "CHAR(36)";
					if (col.type === "int") typeStr = "INT";
					if (col.type === "varchar") typeStr = "VARCHAR(255)";
				} else if (dialect === "sqlite") {
					if (col.type === "uuid") typeStr = "TEXT"; // SQLite doesn't have native UUID
					if (col.type === "int") typeStr = "INTEGER";
					if (col.type === "varchar") typeStr = "TEXT"; // SQLite typically uses TEXT
				}

				if (col.isPk) {
					extras += " PRIMARY KEY";
				}

				return `  ${col.name} ${typeStr}${extras}`;
			});

			generated += cols.join(",\n");

			// Foreign keys (simple implementation, assuming naming convention or we can trace edges)
			// For a complete implementation, tracing edges in useStore is better, but this handles PKs well.

			generated += "\n);\n\n";
		}

		return generated;
	}, [nodes, dialect]);

	const sql = isOpen ? generateSql() : "";

	const downloadSql = () => {
		const blob = new Blob([sql], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `schema_${dialect}.sql`;
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
				Export SQL
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
										SQL Preview
									</h2>
									<Select
										value={dialect}
										onChange={(val) => setDialect(val as Dialect)}
										className="w-40"
										options={[
											{ label: "PostgreSQL", value: "postgresql" },
											{ label: "MySQL", value: "mysql" },
											{ label: "SQLite", value: "sqlite" },
										]}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Button size="sm" onClick={downloadSql}>
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
									language="sql"
									theme="vs-dark"
									value={sql}
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
										fontFamily: "var(--font-mono), monospace",
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

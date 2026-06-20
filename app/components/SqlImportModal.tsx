import { useState } from "react";
import { createPortal } from "react-dom";
import { Database, Loader2, X, Import } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "./Button";
import { parseSqlToNodesAndEdges } from "../lib/sql-parser";
import type { Project } from "../types";
import { v4 as uuidv4 } from "uuid";
import { saveProject } from "../lib/db";
import { useRouter } from "next/navigation";

interface SqlImportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function SqlImportModal({
	isOpen,
	onClose,
}: SqlImportModalProps) {
	const [code, setCode] =
		useState(`-- Paste your SQL CREATE TABLE statements here
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);
	const [isProcessing, setIsProcessing] = useState(false);
	const router = useRouter();

	const handleImport = async () => {
		try {
			setIsProcessing(true);
			const { nodes, edges } = parseSqlToNodesAndEdges(code);

			if (nodes.length === 0) {
				alert("No valid CREATE TABLE statements found in the code.");
				setIsProcessing(false);
				return;
			}

			const now = Date.now();
			const newProject: Project = {
				id: uuidv4(),
				name: "Imported SQL Project",
				createdAt: now,
				updatedAt: now,
				nodes,
				edges,
			};

			await saveProject(newProject);

			if (document.startViewTransition) {
				document.startViewTransition(() => {
					router.push(`/project/${newProject.id}`);
				});
			} else {
				router.push(`/project/${newProject.id}`);
			}

			onClose();
		} catch (error) {
			console.error("Error importing SQL:", error);
			alert("Failed to parse SQL code.");
		} finally {
			setIsProcessing(false);
		}
	};

	if (!isOpen || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
			<div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
					<h2 className="text-lg font-bold font-space text-foreground flex items-center">
						<Database className="w-5 h-5 mr-2" />
						Import SQL Schema
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Editor container */}
				<div className="flex-1 w-full bg-[#1e1e1e]">
					<Editor
						height="100%"
						language="sql"
						theme="vs-dark"
						value={code}
						onChange={(val) => setCode(val || "")}
						loading={
							<div className="flex justify-center items-center h-full text-muted-foreground">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading editor...
							</div>
						}
						options={{
							minimap: { enabled: false },
							renderWhitespace: "selection",
							stickyScroll: { enabled: false },
							lineNumbers: "on",
							fontSize: 14,
							fontFamily: "var(--font-jetbrains-mono), monospace",
							padding: { top: 16 },
						}}
					/>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={isProcessing}>
						{isProcessing ? (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<Import className="w-4 h-4 mr-2" />
						)}
						Generate Diagram
					</Button>
				</div>
			</div>
		</div>,
		document.body,
	);
}

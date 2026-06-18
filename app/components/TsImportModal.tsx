import { useState } from "react";
import { createPortal } from "react-dom";
import { FileCode2, Loader2, X, Import } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "./Button";
import { parseTypeScriptToNodes } from "../lib/ts-parser";
import type { Project } from "../types";
import { v4 as uuidv4 } from "uuid";
import { saveProject } from "../lib/db";
import { useRouter } from "next/navigation";

export default function TsImportModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [code, setCode] = useState(`// Paste your TypeScript interfaces here
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
}
`);
	const [isProcessing, setIsProcessing] = useState(false);
	const router = useRouter();

	const handleImport = async () => {
		try {
			setIsProcessing(true);
			const nodes = parseTypeScriptToNodes(code);

			if (nodes.length === 0) {
				alert("No valid interfaces or types found in the code.");
				setIsProcessing(false);
				return;
			}

			const now = Date.now();
			const newProject: Project = {
				id: uuidv4(),
				name: "Imported TS Project",
				createdAt: now,
				updatedAt: now,
				nodes,
				edges: [],
			};

			await saveProject(newProject);

			if (document.startViewTransition) {
				document.startViewTransition(() => {
					router.push(`/project/${newProject.id}`);
				});
			} else {
				router.push(`/project/${newProject.id}`);
			}

			setIsOpen(false);
		} catch (error) {
			console.error("Error importing TS:", error);
			alert("Failed to parse TypeScript code.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<>
			<Button onClick={() => setIsOpen(true)} variant="secondary">
				<FileCode2 className="w-4 h-4 mr-2" />
				Import TS
			</Button>

			{isOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
						<div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden">
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
								<h2 className="text-lg font-bold font-space text-foreground flex items-center">
									<FileCode2 className="w-5 h-5 mr-2" />
									Import TypeScript Interfaces
								</h2>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Editor container */}
							<div className="flex-1 w-full bg-[#1e1e1e]">
								<Editor
									height="100%"
									language="typescript"
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
								<Button variant="secondary" onClick={() => setIsOpen(false)}>
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
				)}
		</>
	);
}

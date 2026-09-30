import Editor from "@monaco-editor/react";
import { Import, Loader2, Workflow, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { saveProject } from "../lib/db";
import { parseMermaidToNodesAndEdges } from "../lib/mermaid-parser";
import type { Project } from "../types";
import { Button } from "./Button";

interface MermaidImportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function MermaidImportModal({
	isOpen,
	onClose,
}: MermaidImportModalProps) {
	const [code, setCode] = useState(`erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses

    CUSTOMER {
        string id PK
        string name
        string email
        string phone
    }

    ORDER {
        int id PK
        string customer_id FK
        timestamp order_date
        string status
    }

    LINE-ITEM {
        int id PK
        int order_id FK
        int product_id
        int quantity
        float price
    }
`);
	const [isProcessing, setIsProcessing] = useState(false);
	const router = useRouter();

	const handleImport = async () => {
		try {
			setIsProcessing(true);
			const { nodes, edges } = parseMermaidToNodesAndEdges(code);

			if (nodes.length === 0) {
				alert("No valid entities found in the Mermaid erDiagram code.");
				setIsProcessing(false);
				return;
			}

			const now = Date.now();
			const newProject: Project = {
				id: uuidv4(),
				name: "Imported Mermaid Project",
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
			console.error("Error importing Mermaid ER diagram:", error);
			alert("Failed to parse Mermaid code.");
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
					<h2 className="text-lg font-bold font-display text-foreground flex items-center">
						<Workflow className="w-5 h-5 mr-2" />
						Import Mermaid ER Diagram
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
						language="plaintext"
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

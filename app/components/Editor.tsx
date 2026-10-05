"use client";
import { useRouter } from "next/navigation";

import {
	Background,
	BackgroundVariant,
	ConnectionLineType,
	Controls,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/app/store/useStore";
import { toPng } from "html-to-image";
import { ArrowLeft, Plus, Waypoints, Maximize2, Minimize2 } from "lucide-react";
import { Download, Eye, LayoutGrid, Loader2, Printer } from "lucide-react";
import { Folder } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { getLayoutedElements } from "../lib/autoLayout";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import ContainerNode from "./ContainerNode";
import CustomRelationEdge from "./CustomRelationEdge";
import ExportDropdown from "./ExportDropdown";
import { Select } from "./Select";
import SettingsModal from "./SettingsModal";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import TableNode from "./TableNode";
import { ThemeToggle } from "./ThemeToggle";

const SqlPreviewModal = dynamic(() => import("./SqlPreviewModal"));
const TsExportModal = dynamic(() => import("./TsExportModal"));
const PrismaExportModal = dynamic(() => import("./PrismaExportModal"));
const PrintExportModal = dynamic(() => import("./PrintExportModal"));
const RelationSuggestionsModal = dynamic(() => import("./RelationSuggestionsModal"));

const nodeTypes = {
	table: TableNode,
	container: ContainerNode,
};

const edgeTypes = {
	relation: CustomRelationEdge,
	default: CustomRelationEdge,
	bezier: CustomRelationEdge,
	smoothstep: CustomRelationEdge,
	step: CustomRelationEdge,
	straight: CustomRelationEdge,
};

// Default connection styling
const connectionLineStyle = { stroke: "#71717a", strokeWidth: 2 }; // Zinc-500

function Flow({ projectId }: { projectId: string }) {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		loadProject,
		addNode,
		project,
		setProjectName,
		isLoading,
		edgeSettings,
		snapToGrid,
		snapGridSize,
		setNodes: setStoreNodes,
		isReadOnly,
		toggleReadOnly,
		undo,
		redo,
	} = useStore();
	const { fitView } = useReactFlow();
	const [isDownloading, setIsDownloading] = useState(false);

	const { resolvedTheme } = useTheme();
	const router = useRouter();
	const [exportType, setExportType] = useState<"sql" | "ts" | "prisma" | null>(
		null,
	);
	const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
	const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
	const navigateTo = (url: string) => {
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				router.push(url);
			});
		} else {
			router.push(url);
		}
	};

	useEffect(() => {
		loadProject(projectId);
	}, [projectId, loadProject]);

	const handleAddTable = useCallback(() => {
		const id = uuidv4();
		addNode({
			id,
			type: "table",
			position: { x: Math.random() * 400, y: Math.random() * 400 },
			data: {
				label: "New Table",
				columns: [
					{ id: uuidv4(), name: "id", type: "uuid", isPk: true, isFk: false },
				],
			},
		});
	}, [addNode]);

	const handleAddContainer = useCallback(() => {
		const id = uuidv4();
		addNode({
			id,
			type: "container",
			position: { x: Math.random() * 300, y: Math.random() * 300 },
			style: { width: 400, height: 300, zIndex: -1 },
			zIndex: -1,
			data: {
				label: "New Module",
				color: "text-blue-500",
			},
		});
	}, [addNode]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isReadOnly) return;

			// Don't trigger board undo/redo if user is typing in an input
			const activeTag = document.activeElement?.tagName.toLowerCase();
			if (
				activeTag === "input" ||
				activeTag === "textarea" ||
				activeTag === "select"
			) {
				return;
			}

			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
				if (e.shiftKey) {
					redo();
				} else {
					undo();
				}
			} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
				redo();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isReadOnly, undo, redo]);

	const onLayout = useCallback(() => {
		const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, "LR");

		// Update store nodes so changes are persisted
		setStoreNodes([...layoutedNodes]);

		window.requestAnimationFrame(() => {
			fitView({ duration: 800, padding: 0.2 });
		});
	}, [nodes, edges, setStoreNodes, fitView]);

	const downloadImage = useCallback(async () => {
		setIsDownloading(true);
		const wasEditing = !isReadOnly;
		if (wasEditing) toggleReadOnly();
		setTimeout(async () => {
			const element = (document.querySelector(".react-flow__renderer") ||
				document.querySelector(".react-flow")) as HTMLElement;
			if (element) {
				try {
					const dataUrl = await toPng(element, {
						backgroundColor: resolvedTheme === "dark" ? "#09090b" : "#f9fafb",
						pixelRatio: 2,
						filter: (node) => {
							const el = node as HTMLElement;
							if (
								el.classList?.contains("react-flow__controls") ||
								el.classList?.contains("react-flow__panel")
							) {
								return false;
							}
							return true;
						},
					});
					const a = document.createElement("a");
					a.setAttribute("download", `${project?.name || "diagram"}.png`);
					a.setAttribute("href", dataUrl);
					a.click();
				} catch (err) {
					console.error("Failed to export image", err);
				}
			}
			if (wasEditing) toggleReadOnly();
			setIsDownloading(false);
		}, 200);
	}, [project, resolvedTheme, isReadOnly, toggleReadOnly]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground">
				Loading project...
			</div>
		);
	}

	return (
		<div className="h-full w-full bg-background text-foreground font-sans relative transition-colors">
			{/* Toolbar Panel */}
			<Panel
				position="top-left"
				className="m-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border shadow-xl"
			>
				{/* Group 1: Back Button, Project Name */}
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						size="icon"
						onClick={() => navigateTo("/")}
						title="Back to Dashboard"
					>
						<ArrowLeft className="w-4 h-4" />
					</Button>

					<input
						value={project?.name || ""}
						onChange={(e) => setProjectName(e.target.value)}
						className="bg-transparent text-sm font-semibold text-foreground focus:outline-none w-48 px-2 placeholder:text-muted-foreground"
						placeholder="Untitled Project"
					/>
				</div>

				<div className="h-6 w-px bg-border mx-2" />

				{/* Group 2: Add Dropdown & Settings Modal Trigger */}
				<div className="flex items-center gap-2 relative">
					{/* Add Dropdown */}
					<div className="relative">
						<Button
							size="sm"
							onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
							title="Add Node"
						>
							<Plus className="w-3.5 h-3.5 mr-1" />
							Add
							<ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
						</Button>

						{isAddMenuOpen && (
							<div
								className="absolute left-0 top-full mt-1.5 w-40 bg-popover border border-border text-popover-foreground rounded-lg shadow-xl p-1 z-[9999] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
								onMouseLeave={() => setIsAddMenuOpen(false)}
							>
								<button
									type="button"
									onClick={() => {
										handleAddTable();
										setIsAddMenuOpen(false);
									}}
									className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-md hover:bg-muted transition-colors"
								>
									<Plus className="w-3.5 h-3.5 text-primary" />
									Add Table
								</button>
								<button
									type="button"
									onClick={() => {
										handleAddContainer();
										setIsAddMenuOpen(false);
									}}
									className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-md hover:bg-muted transition-colors"
								>
									<Folder className="w-3.5 h-3.5 text-blue-500" />
									Add Container
								</button>
							</div>
						)}
					</div>

					{/* Settings Button */}
					<Button
						size="sm"
						variant="secondary"
						onClick={() => setIsSettingsOpen(true)}
						title="Open Settings"
					>
						Settings
					</Button>
				</div>
			</Panel>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				snapToGrid={snapToGrid}
				snapGrid={[snapGridSize, snapGridSize]}
				colorMode={resolvedTheme === "dark" ? "dark" : "light"}
				connectionLineType={
					edgeSettings.type === "step"
						? ConnectionLineType.Step
						: edgeSettings.type === "straight"
							? ConnectionLineType.Straight
							: edgeSettings.type === "bezier"
								? ConnectionLineType.Bezier
								: ConnectionLineType.SmoothStep
				}
				connectionLineStyle={connectionLineStyle}
				defaultEdgeOptions={{
					type: edgeSettings.type,
					style: connectionLineStyle,
					animated: edgeSettings.animated,
				}}
				fitView
				proOptions={{ hideAttribution: true }}
				minZoom={0.1}
				nodesDraggable={!isReadOnly}
				nodesConnectable={!isReadOnly}
				elementsSelectable={!isReadOnly}
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={24}
					size={2}
					color={resolvedTheme === "dark" ? "#71717a" : "#a1a1aa"} // zinc-500 / zinc-400 for better contrast
					className="opacity-80"
				/>
				<Controls className="!bg-background !border-border !fill-foreground [&>button]:!border-border [&>button]:!hover:bg-muted" />
			</ReactFlow>

			<SqlPreviewModal
				isOpen={exportType === "sql"}
				onClose={() => setExportType(null)}
			/>
			<TsExportModal
				isOpen={exportType === "ts"}
				onClose={() => setExportType(null)}
			/>
			<PrismaExportModal
				isOpen={exportType === "prisma"}
				onClose={() => setExportType(null)}
			/>
			<PrintExportModal
				isOpen={isPrintModalOpen}
				onClose={() => setIsPrintModalOpen(false)}
			/>
			<RelationSuggestionsModal
				isOpen={isSuggestionsOpen}
				onClose={() => setIsSuggestionsOpen(false)}
			/>
			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				onAutoLayout={onLayout}
				onOpenPrintModal={() => setIsPrintModalOpen(true)}
				onOpenSuggestionsModal={() => setIsSuggestionsOpen(true)}
				onDownloadImage={downloadImage}
				isDownloadingImage={isDownloading}
				onExportType={setExportType}
			/>
		</div>
	);
}

export default function Editor({ projectId }: { projectId: string }) {
	return (
		<ReactFlowProvider>
			<Flow projectId={projectId} />
		</ReactFlowProvider>
	);
}

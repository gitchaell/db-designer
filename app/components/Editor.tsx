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
import { ArrowLeft, Plus, Waypoints } from "lucide-react";
import { Download, Eye, LayoutGrid, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { v4 as uuidv4 } from "uuid";
import { getLayoutedElements } from "../lib/autoLayout";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Select } from "./Select";
import SettingsPopover from "./SettingsPopover";
import SqlPreviewModal from "./SqlPreviewModal";
import TableNode from "./TableNode";
import { ThemeToggle } from "./ThemeToggle";

const nodeTypes = {
	table: TableNode,
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
		updateEdgeSettings,
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
			const viewport = document.querySelector(
				".react-flow__viewport",
			) as HTMLElement;
			if (viewport) {
				try {
					const dataUrl = await toPng(viewport, {
						backgroundColor: resolvedTheme === "dark" ? "#09090b" : "#f9fafb",
						pixelRatio: 2,
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

				{/* Group 2: Add Table and Settings */}
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={handleAddTable}>
						<Plus className="w-3.5 h-3.5 mr-1.5" />
						Add Table
					</Button>

					<SettingsPopover>
						<div className="flex flex-col gap-3 w-full">
							{/* Layout Group */}
							<div className="flex flex-col gap-1 w-full">
								<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
									Layout & Canvas
								</h4>
								<Button
									variant="ghost"
									onClick={onLayout}
									className="w-full justify-start h-8 px-2 text-sm font-medium text-foreground"
									title="Auto Layout"
								>
									<LayoutGrid className="w-4 h-4 mr-2 text-muted-foreground" />
									Auto Layout
								</Button>
							</div>

							<div className="h-px bg-border w-full" />

							{/* Edges Group */}
							<div className="flex flex-col gap-1 w-full">
								<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
									Edges
								</h4>
								<div className="flex items-center gap-2 px-2 py-1.5">
									<Waypoints className="w-4 h-4 text-muted-foreground" />
									<Select
										value={edgeSettings.type}
										onChange={(val) =>
											updateEdgeSettings({
												type: val as
													| "step"
													| "smoothstep"
													| "straight"
													| "bezier",
											})
										}
										className="w-full flex-1"
										options={[
											{ label: "Smooth Step", value: "smoothstep" },
											{ label: "Step", value: "step" },
											{ label: "Straight", value: "straight" },
											{ label: "Bezier", value: "bezier" },
										]}
									/>
								</div>

								<label
									htmlFor="show-relation-markers"
									className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-sm cursor-pointer transition-colors group"
								>
									<span className="text-sm text-foreground font-medium select-none">
										Show Relation Markers
									</span>
									<Checkbox
										id="show-relation-markers"
										checked={edgeSettings.showRelationMarkers || false}
										onChange={(e) =>
											updateEdgeSettings({
												showRelationMarkers: e.target.checked,
											})
										}
									/>
								</label>

								<label
									htmlFor="animated-edges"
									className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-sm cursor-pointer transition-colors group"
								>
									<span className="text-sm text-foreground font-medium select-none">
										Animated Edges
									</span>
									<Checkbox
										id="animated-edges"
										checked={edgeSettings.animated}
										onChange={(e) =>
											updateEdgeSettings({ animated: e.target.checked })
										}
									/>
								</label>
							</div>

							<div className="h-px bg-border w-full" />

							{/* Actions Group */}
							<div className="flex flex-col gap-1 w-full">
								<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
									Actions
								</h4>
								<SqlPreviewModal />

								<Button
									variant="ghost"
									onClick={downloadImage}
									className="w-full justify-start h-8 px-2 text-sm font-medium text-foreground"
									title="Download Diagram as Image"
									disabled={isDownloading}
								>
									{isDownloading ? (
										<Loader2 className="w-4 h-4 mr-2 text-muted-foreground animate-spin" />
									) : (
										<Download className="w-4 h-4 mr-2 text-muted-foreground" />
									)}
									Download PNG
								</Button>
							</div>

							<div className="h-px bg-border w-full" />

							{/* Preferences Group */}
							<div className="flex flex-col gap-1 w-full">
								<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
									Preferences
								</h4>
								<Button
									variant="ghost"
									onClick={toggleReadOnly}
									className="w-full justify-start h-8 px-2 text-sm font-medium text-foreground"
									title={
										isReadOnly
											? "Switch to Edit Mode"
											: "Switch to Read Only Mode"
									}
								>
									<Eye className="w-4 h-4 mr-2 text-muted-foreground" />
									{isReadOnly ? "Disable Read Only" : "Read Only"}
								</Button>

								<ThemeToggle className="w-full justify-start h-8 px-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground flex rounded-md [&>svg]:mr-2 [&>svg]:w-4 [&>svg]:h-4 !p-2 !h-8 bg-transparent border-none [&>span.sr-only]:not-sr-only [&>span.sr-only]:ml-0 [&>span]:ml-0" />
							</div>
						</div>
					</SettingsPopover>
				</div>
			</Panel>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
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

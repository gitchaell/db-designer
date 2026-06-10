"use client";

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
import { useCallback, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/app/store/useStore";
import { ArrowLeft, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import TableNode from "./TableNode";
import { ThemeToggle } from "./ThemeToggle";
import EdgeSettings from "./EdgeSettings";
import SqlPreviewModal from "./SqlPreviewModal";
import { getLayoutedElements } from "../lib/autoLayout";
import { LayoutGrid, Download } from "lucide-react";
import { toPng } from "html-to-image";

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
		setNodes: setStoreNodes,
	} = useStore();
	const { fitView } = useReactFlow();

	const router = useRouter();
	const { resolvedTheme } = useTheme();

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

	const onLayout = useCallback(() => {
		const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, "LR");

		// Update store nodes so changes are persisted
		setStoreNodes([...layoutedNodes]);

		window.requestAnimationFrame(() => {
			fitView({ duration: 800, padding: 0.2 });
		});
	}, [nodes, edges, setStoreNodes, fitView]);

	const downloadImage = useCallback(() => {
		// Use a slight timeout to ensure UI is ready
		setTimeout(() => {
			const viewport = document.querySelector(
				".react-flow__viewport",
			) as HTMLElement;
			if (viewport) {
				toPng(viewport, {
					backgroundColor:
						resolvedTheme === "dark" ? "#09090b" : "#f9fafb",
					pixelRatio: 2,
				})
					.then((dataUrl) => {
						const a = document.createElement("a");
						a.setAttribute("download", `${project?.name || "diagram"}.png`);
						a.setAttribute("href", dataUrl);
						a.click();
					})
					.catch((err) => {
						console.error("Failed to export image", err);
					});
			}
		}, 100);
	}, [project?.name, resolvedTheme]);

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
				<button
					type="button"
					onClick={() => router.push("/")}
					className="btn btn-secondary w-9 px-0"
					title="Back to Dashboard"
				>
					<ArrowLeft className="w-4 h-4" />
				</button>

				<div className="h-6 w-px bg-border mx-2" />

				<input
					value={project?.name || ""}
					onChange={(e) => setProjectName(e.target.value)}
					className="bg-transparent text-sm font-semibold text-foreground focus:outline-none w-48 px-2 placeholder:text-muted-foreground"
					placeholder="Untitled Project"
				/>

				<div className="h-6 w-px bg-border mx-2" />

				<button
					type="button"
					onClick={handleAddTable}
					className="btn btn-primary h-8 text-xs"
				>
					<Plus className="w-3.5 h-3.5 mr-1.5" />
					Add Table
				</button>

				<div className="h-6 w-px bg-border mx-2" />

				<button
					type="button"
					onClick={onLayout}
					className="btn btn-secondary h-8 text-xs font-space"
					title="Auto Layout"
				>
					<LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
					Auto Layout
				</button>

				<div className="h-6 w-px bg-border mx-2" />
				<EdgeSettings />

				<div className="h-6 w-px bg-border mx-2" />
				<SqlPreviewModal />

				<div className="h-6 w-px bg-border mx-2" />
				<button
					type="button"
					onClick={downloadImage}
					className="btn btn-secondary h-8 text-xs font-space"
					title="Download Diagram as Image"
				>
					<Download className="w-3.5 h-3.5 mr-1.5" />
					Download PNG
				</button>

				<ThemeToggle />
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
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={24}
					size={1.5}
					color={resolvedTheme === "dark" ? "#3f3f46" : "#d4d4d8"} // zinc-700 / zinc-300
					className="opacity-50"
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

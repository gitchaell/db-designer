"use client";

import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useStore } from "@/app/store/useStore";
import TableNode from "./TableNode";

const nodeTypes = {
	table: TableNode,
};

function Flow() {
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();

	return (
		<div className="h-screen w-screen bg-zinc-950 text-white">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				colorMode="dark"
				fitView
				proOptions={{ hideAttribution: true }}
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={20}
					size={1}
					color="#27272a" // zinc-800, subtle dots
				/>
				<Controls className="bg-zinc-900 border-zinc-800 fill-zinc-200 [&>button]:border-zinc-800 [&>button]:hover:bg-zinc-800" />
			</ReactFlow>
		</div>
	);
}

export default function Editor() {
	return (
		<ReactFlowProvider>
			<Flow />
		</ReactFlowProvider>
	);
}

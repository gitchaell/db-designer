'use client';

import { useEffect, useCallback } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	ReactFlowProvider,
	BackgroundVariant,
	Panel,
	useReactFlow,
	ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/app/store/useStore';
import TableNode from './TableNode';

const nodeTypes = {
	table: TableNode,
};

// Default connection styling
const connectionLineStyle = { stroke: '#52525b', strokeWidth: 2 }; // Zinc-600
const defaultEdgeOptions = {
	type: 'smoothstep',
	style: { stroke: '#52525b', strokeWidth: 2 },
	animated: true,
};

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
		isLoading
	} = useStore();

	const router = useRouter();

	useEffect(() => {
		loadProject(projectId);
	}, [projectId, loadProject]);

	const handleAddTable = useCallback(() => {
		const id = uuidv4();
		addNode({
			id,
			type: 'table',
			position: { x: Math.random() * 400, y: Math.random() * 400 },
			data: {
				label: 'New Table',
				columns: [
					{ id: uuidv4(), name: 'id', type: 'uuid', isPk: true, isFk: false },
				],
			},
		});
	}, [addNode]);

	if (isLoading) {
		return <div className="flex items-center justify-center h-full text-zinc-500">Loading project...</div>;
	}

	return (
		<div className="h-full w-full bg-zinc-950 text-white font-sans relative">
			{/* Toolbar Panel */}
			<Panel position="top-left" className="m-4 flex items-center gap-4 bg-zinc-950/80 backdrop-blur-sm p-2 rounded-lg border border-zinc-800 shadow-xl">
				<button
					onClick={() => router.push('/')}
					className="btn btn-secondary w-9 px-0"
					title="Back to Dashboard"
				>
					<ArrowLeft className="w-4 h-4" />
				</button>

				<div className="h-6 w-px bg-zinc-800 mx-2"></div>

				<input
					value={project?.name || ''}
					onChange={(e) => setProjectName(e.target.value)}
					className="bg-transparent text-sm font-semibold text-zinc-200 focus:outline-none w-48 px-2 placeholder:text-zinc-600"
					placeholder="Untitled Project"
				/>

				<div className="h-6 w-px bg-zinc-800 mx-2"></div>

				<button
					onClick={handleAddTable}
					className="btn btn-primary h-8 text-xs"
				>
					<Plus className="w-3.5 h-3.5 mr-1.5" />
					Add Table
				</button>
			</Panel>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				colorMode="dark"
				connectionLineType={ConnectionLineType.SmoothStep}
				connectionLineStyle={connectionLineStyle}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				proOptions={{ hideAttribution: true }}
				minZoom={0.1}
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={24}
					size={1.5}
					color="#3f3f46" // zinc-700
					className="opacity-30"
				/>
				<Controls className="bg-zinc-900 border-zinc-800 fill-zinc-200 [&>button]:border-zinc-800 [&>button]:hover:bg-zinc-800" />
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

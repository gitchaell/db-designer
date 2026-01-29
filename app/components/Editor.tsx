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
import { Plus, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/app/store/useStore';
import TableNode from './TableNode';

const nodeTypes = {
	table: TableNode,
};

// Default connection styling
const connectionLineStyle = { stroke: '#a855f7', strokeWidth: 2 }; // Purple-500
const defaultEdgeOptions = {
	type: 'smoothstep',
	style: { stroke: '#a855f7', strokeWidth: 2 },
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
	const { setCenter } = useReactFlow();

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
			<Panel position="top-left" className="m-4 flex items-center gap-4">
				<button
					onClick={() => router.push('/')}
					className="p-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 hover:text-white hover:border-purple-500 transition-colors shadow-lg"
					title="Back to Dashboard"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>

				<div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 shadow-lg">
					<input
						value={project?.name || ''}
						onChange={(e) => setProjectName(e.target.value)}
						className="bg-transparent text-sm font-semibold text-zinc-200 focus:outline-none w-48"
						placeholder="Untitled Project"
					/>
				</div>

				<button
					onClick={handleAddTable}
					className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium shadow-lg transition-colors shadow-purple-900/20"
				>
					<Plus className="w-4 h-4" />
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
					className="opacity-50"
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

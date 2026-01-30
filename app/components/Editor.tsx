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
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';

const nodeTypes = {
	table: TableNode,
};

// Default connection styling
const connectionLineStyle = { stroke: '#71717a', strokeWidth: 2 }; // Zinc-500
const defaultEdgeOptions = {
	type: 'smoothstep',
	style: { stroke: '#71717a', strokeWidth: 2 },
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
	const { resolvedTheme } = useTheme();

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
		return <div className="flex items-center justify-center h-full text-muted-foreground">Loading project...</div>;
	}

	return (
		<div className="h-full w-full bg-background text-foreground font-sans relative transition-colors">
			{/* Toolbar Panel */}
			<Panel position="top-left" className="m-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border shadow-xl">
				<button
					onClick={() => router.push('/')}
					className="btn btn-secondary w-9 px-0"
					title="Back to Dashboard"
				>
					<ArrowLeft className="w-4 h-4" />
				</button>

				<div className="h-6 w-px bg-border mx-2"></div>

				<input
					value={project?.name || ''}
					onChange={(e) => setProjectName(e.target.value)}
					className="bg-transparent text-sm font-semibold text-foreground focus:outline-none w-48 px-2 placeholder:text-muted-foreground"
					placeholder="Untitled Project"
				/>

				<div className="h-6 w-px bg-border mx-2"></div>

				<button
					onClick={handleAddTable}
					className="btn btn-primary h-8 text-xs"
				>
					<Plus className="w-3.5 h-3.5 mr-1.5" />
					Add Table
				</button>

        <div className="h-6 w-px bg-border mx-2"></div>
        <ThemeToggle />
			</Panel>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
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
					color={resolvedTheme === 'dark' ? '#3f3f46' : '#d4d4d8'} // zinc-700 / zinc-300
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

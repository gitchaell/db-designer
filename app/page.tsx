'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit2, Database } from 'lucide-react';
import { getAllProjects, saveProject, deleteProject } from './lib/db';
import type { Project } from './types';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
	const [projects, setProjects] = useState<Project[]>([]);
	const router = useRouter();

	useEffect(() => {
		loadProjects();
	}, []);

	const loadProjects = async () => {
		const data = await getAllProjects();
		setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt));
	};

	const createProject = async () => {
		const newProject: Project = {
			id: uuidv4(),
			name: 'Untitled Project',
			createdAt: Date.now(),
			updatedAt: Date.now(),
			nodes: [],
			edges: [],
		};
		await saveProject(newProject);
		router.push(`/project/${newProject.id}`);
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		if (confirm('Are you sure you want to delete this project?')) {
			await deleteProject(id);
			loadProjects();
		}
	};

	return (
		<main className="min-h-screen p-8 max-w-6xl mx-auto">
			<div className="flex items-center justify-between mb-12">
				<div className="flex items-center gap-3">
					<Database className="w-8 h-8 text-purple-500" />
					<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
						My Projects
					</h1>
				</div>
				<button
					onClick={createProject}
					className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors"
				>
					<Plus className="w-4 h-4" />
					New Project
				</button>
			</div>

			{projects.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
					<p className="text-zinc-500 mb-4">No projects found</p>
					<button
						onClick={createProject}
						className="text-purple-400 hover:text-purple-300 font-medium"
					>
						Create your first diagram
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<Link
							key={project.id}
							href={`/project/${project.id}`}
							className="group relative block p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-900/10"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-purple-900/30 transition-colors">
									<Database className="w-5 h-5 text-zinc-400 group-hover:text-purple-400" />
								</div>
								<button
									onClick={(e) => handleDelete(e, project.id)}
									className="p-2 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-zinc-100 group-hover:text-white">
								{project.name}
							</h3>
							<div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
								<span>{project.nodes.length} tables</span>
								<span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</main>
	);
}

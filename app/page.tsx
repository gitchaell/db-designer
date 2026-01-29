'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Database } from 'lucide-react';
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
					<div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
						<Database className="w-6 h-6 text-zinc-100" />
					</div>
					<h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
						My Projects
					</h1>
				</div>
				<button
					onClick={createProject}
					className="btn btn-primary"
				>
					<Plus className="w-4 h-4 mr-2" />
					New Project
				</button>
			</div>

			{projects.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
					<Database className="w-12 h-12 text-zinc-700 mb-4" />
					<p className="text-zinc-500 mb-6 text-lg">No projects found</p>
					<button
						onClick={createProject}
						className="btn btn-secondary"
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
							className="group relative block p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all hover:shadow-lg"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
									<Database className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
								</div>
								<button
									onClick={(e) => handleDelete(e, project.id)}
									className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-md transition-all opacity-0 group-hover:opacity-100"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
							<h3 className="text-lg font-semibold mb-2 text-zinc-100 group-hover:text-white tracking-tight">
								{project.name}
							</h3>
							<div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
								<span>{project.nodes.length} tables</span>
								<span className="w-1 h-1 rounded-full bg-zinc-700"></span>
								<span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</main>
	);
}

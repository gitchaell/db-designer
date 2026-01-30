'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Database } from 'lucide-react';
import { getAllProjects, saveProject, deleteProject } from './lib/db';
import type { Project } from './types';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './components/ThemeToggle';

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
		<main className="min-h-screen p-8 max-w-6xl mx-auto bg-background text-foreground transition-colors">
			<div className="flex items-center justify-between mb-12">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-secondary rounded-lg border border-border">
						<Database className="w-6 h-6 text-foreground" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						My Projects
					</h1>
				</div>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<button
						onClick={createProject}
						className="btn btn-primary"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Project
					</button>
				</div>
			</div>

			{projects.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-muted/20">
					<Database className="w-12 h-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground mb-6 text-lg">No projects found</p>
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
							className="group relative block p-6 rounded-xl bg-card border border-border hover:border-ring/50 transition-all hover:shadow-lg"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:bg-accent transition-colors">
									<Database className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
								</div>
								<button
									onClick={(e) => handleDelete(e, project.id)}
									className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-all opacity-0 group-hover:opacity-100"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
							<h3 className="text-lg font-semibold mb-2 group-hover:text-primary tracking-tight">
								{project.name}
							</h3>
							<div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
								<span>{project.nodes.length} tables</span>
								<span className="w-1 h-1 rounded-full bg-border"></span>
								<span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</main>
	);
}

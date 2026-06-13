"use client";
import { useRouter } from "next/navigation";

import { Database, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./components/Button";
import { ThemeToggle } from "./components/ThemeToggle";
import { deleteProject, getAllProjects, saveProject } from "./lib/db";
import { templates } from "./lib/templates";
import type { Project } from "./types";

const getTimestamp = () => Date.now();

export default function Dashboard() {
	const [projects, setProjects] = useState<Project[]>([]);

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

	const loadProjects = async () => {
		const data = await getAllProjects();
		setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt));
	};

	useEffect(() => {
		let isMounted = true;
		getAllProjects().then((data) => {
			if (isMounted) {
				setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt));
			}
		});
		return () => {
			isMounted = false;
		};
	}, []);

	const createProject = async () => {
		const newProject: Project = {
			id: uuidv4(),
			name: "Untitled Project",
			createdAt: getTimestamp(),
			updatedAt: getTimestamp(),
			nodes: [],
			edges: [],
		};
		await saveProject(newProject);
		navigateTo(`/project/${newProject.id}`);
	};

	const createProjectFromTemplate = async (templateId: string) => {
		const template = templates.find((t) => t.id === templateId);
		if (!template) return;
		const { nodes, edges } = template.create();
		const now = getTimestamp();
		const newProject: Project = {
			id: uuidv4(),
			name: template.name,
			createdAt: now,
			updatedAt: now,
			nodes,
			edges,
		};
		await saveProject(newProject);
		navigateTo(`/project/${newProject.id}`);
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		if (confirm("Are you sure you want to delete this project?")) {
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
					<h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
				</div>
				<div className="flex items-center gap-4">
					<ThemeToggle />

					<Button onClick={createProject}>
						<Plus className="w-4 h-4 mr-2" />
						New Project
					</Button>
				</div>
			</div>

			{projects.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-muted/20">
					<Database className="w-12 h-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground mb-6 text-lg">
						No projects found
					</p>
					<div className="flex gap-4">
						<Button onClick={createProject}>
							<Plus className="w-4 h-4 mr-2" />
							Create Empty Diagram
						</Button>
					</div>
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
									type="button"
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
								<span className="w-1 h-1 rounded-full bg-border" />
								<span>
									Updated {new Date(project.updatedAt).toLocaleDateString()}
								</span>
							</div>
						</Link>
					))}
				</div>
			)}

			<div className="mt-24">
				<div className="flex items-center gap-3 mb-8">
					<div className="p-2 bg-secondary rounded-lg border border-border">
						<FileText className="w-6 h-6 text-foreground" />
					</div>
					<h2 className="text-2xl font-bold tracking-tight">Templates</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{templates.map((template) => (
						<div
							key={template.id}
							className="group relative flex flex-col p-6 rounded-xl bg-card border border-border hover:border-ring/50 transition-all hover:shadow-lg"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
									<FileText className="w-5 h-5 text-primary" />
								</div>
							</div>
							<h3 className="text-lg font-semibold mb-2 group-hover:text-primary tracking-tight">
								{template.name}
							</h3>
							<p className="text-sm text-muted-foreground flex-grow mb-6">
								{template.description}
							</p>
							<Button
								variant="secondary"
								onClick={() => createProjectFromTemplate(template.id)}
								className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
							>
								Use Template
							</Button>
						</div>
					))}
				</div>
			</div>

			<footer className="mt-24 pb-8 text-center text-sm text-muted-foreground border-t border-border pt-8">
				<p>
					Built by{" "}
					<a
						href="https://michaellalavedra.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline font-medium"
					>
						Michaell Alavedra
					</a>
				</p>
			</footer>
		</main>
	);
}

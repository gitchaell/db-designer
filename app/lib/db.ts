import { openDB, type DBSchema } from 'idb';
import type { Project } from '../types';

interface DBDesignerDB extends DBSchema {
	projects: {
		key: string;
		value: Project;
	};
}

const DB_NAME = 'db-designer-db';
const DB_VERSION = 1;

export async function initDB() {
	return openDB<DBDesignerDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains('projects')) {
				db.createObjectStore('projects', { keyPath: 'id' });
			}
		},
	});
}

export async function getAllProjects(): Promise<Project[]> {
	const db = await initDB();
	return db.getAll('projects');
}

export async function getProject(id: string): Promise<Project | undefined> {
	const db = await initDB();
	return db.get('projects', id);
}

export async function saveProject(project: Project): Promise<void> {
	const db = await initDB();
	await db.put('projects', project);
}

export async function deleteProject(id: string): Promise<void> {
	const db = await initDB();
	await db.delete('projects', id);
}

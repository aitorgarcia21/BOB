import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectFile } from '../types';

// In-memory storage (replace with database in production)
const projects: Map<string, Project> = new Map();

class ProjectService {
  async createProject(data: {
    name: string;
    description: string;
    language: string;
    framework?: string;
  }): Promise<Project> {
    const project: Project = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      language: data.language,
      framework: data.framework,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: []
    };

    projects.set(project.id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    return projects.get(id) || null;
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(projects.values());
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
    const project = projects.get(id);
    if (!project) return null;

    const updatedProject: Project = {
      ...project,
      ...data,
      id: project.id,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString()
    };

    projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return projects.delete(id);
  }

  async addFile(projectId: string, data: {
    name: string;
    path: string;
    content: string;
    language: string;
  }): Promise<ProjectFile | null> {
    const project = projects.get(projectId);
    if (!project) return null;

    const file: ProjectFile = {
      id: uuidv4(),
      name: data.name,
      path: data.path,
      content: data.content,
      language: data.language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    project.files.push(file);
    project.updatedAt = new Date().toISOString();
    projects.set(projectId, project);

    return file;
  }

  async updateFile(projectId: string, fileId: string, data: Partial<ProjectFile>): Promise<ProjectFile | null> {
    const project = projects.get(projectId);
    if (!project) return null;

    const fileIndex = project.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return null;

    const updatedFile: ProjectFile = {
      ...project.files[fileIndex],
      ...data,
      id: project.files[fileIndex].id,
      createdAt: project.files[fileIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    project.files[fileIndex] = updatedFile;
    project.updatedAt = new Date().toISOString();
    projects.set(projectId, project);

    return updatedFile;
  }

  async deleteFile(projectId: string, fileId: string): Promise<boolean> {
    const project = projects.get(projectId);
    if (!project) return false;

    const initialLength = project.files.length;
    project.files = project.files.filter(f => f.id !== fileId);

    if (project.files.length < initialLength) {
      project.updatedAt = new Date().toISOString();
      projects.set(projectId, project);
      return true;
    }

    return false;
  }

  async getFile(projectId: string, fileId: string): Promise<ProjectFile | null> {
    const project = projects.get(projectId);
    if (!project) return null;

    return project.files.find(f => f.id === fileId) || null;
  }
}

export const projectService = new ProjectService();

import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { ApiError } from '../middleware/errorHandler';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  language: z.string().min(1, 'Le langage est requis'),
  framework: z.string().optional()
});

const addFileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  path: z.string().min(1, 'Le chemin est requis'),
  content: z.string(),
  language: z.string().min(1, 'Le langage est requis')
});

const updateFileSchema = z.object({
  name: z.string().optional(),
  path: z.string().optional(),
  content: z.string().optional(),
  language: z.string().optional()
});

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(validatedData);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.errors
      });
    }
    next(error);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getProject(req.params.id);
    if (!project) {
      throw new ApiError('Projet non trouvé', 404);
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    if (!project) {
      throw new ApiError('Projet non trouvé', 404);
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await projectService.deleteProject(req.params.id);
    if (!deleted) {
      throw new ApiError('Projet non trouvé', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = addFileSchema.parse(req.body);
    const file = await projectService.addFile(req.params.id, validatedData);
    if (!file) {
      throw new ApiError('Projet non trouvé', 404);
    }
    res.status(201).json(file);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.errors
      });
    }
    next(error);
  }
};

export const updateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateFileSchema.parse(req.body);
    const file = await projectService.updateFile(req.params.id, req.params.fileId, validatedData);
    if (!file) {
      throw new ApiError('Fichier ou projet non trouvé', 404);
    }
    res.json(file);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.errors
      });
    }
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await projectService.deleteFile(req.params.id, req.params.fileId);
    if (!deleted) {
      throw new ApiError('Fichier ou projet non trouvé', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await projectService.getFile(req.params.id, req.params.fileId);
    if (!file) {
      throw new ApiError('Fichier ou projet non trouvé', 404);
    }
    res.json(file);
  } catch (error) {
    next(error);
  }
};

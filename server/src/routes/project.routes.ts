import { Router } from 'express';
import {
  createProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  addFile,
  updateFile,
  deleteFile,
  getFile
} from '../controllers/project.controller';

const router = Router();

// Project CRUD
router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// File operations
router.post('/:id/files', addFile);
router.get('/:id/files/:fileId', getFile);
router.put('/:id/files/:fileId', updateFile);
router.delete('/:id/files/:fileId', deleteFile);

export { router as projectRoutes };

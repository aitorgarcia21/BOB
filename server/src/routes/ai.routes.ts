import { Router } from 'express';
import {
  generateCode,
  reviewCode,
  debugCode,
  documentCode,
  generateTests,
  chat,
  refactorCode,
  explainCode
} from '../controllers/ai.controller';

const router = Router();

// Code generation
router.post('/generate', generateCode);

// Code review
router.post('/review', reviewCode);

// Debugging
router.post('/debug', debugCode);

// Documentation
router.post('/document', documentCode);

// Test generation
router.post('/test', generateTests);

// Chat
router.post('/chat', chat);

// Refactoring
router.post('/refactor', refactorCode);

// Code explanation
router.post('/explain', explainCode);

export { router as aiRoutes };

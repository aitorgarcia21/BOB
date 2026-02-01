import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { ApiError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const generateCodeSchema = z.object({
  prompt: z.string().min(1, 'Le prompt est requis'),
  language: z.string().min(1, 'Le langage est requis'),
  context: z.string().optional(),
  framework: z.string().optional()
});

const reviewCodeSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  language: z.string().min(1, 'Le langage est requis'),
  focusAreas: z.array(z.enum(['security', 'performance', 'style', 'bugs', 'all'])).optional()
});

const debugCodeSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  language: z.string().min(1, 'Le langage est requis'),
  error: z.string().optional(),
  context: z.string().optional()
});

const documentCodeSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  language: z.string().min(1, 'Le langage est requis'),
  style: z.enum(['jsdoc', 'docstring', 'markdown', 'inline']).optional()
});

const generateTestsSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  language: z.string().min(1, 'Le langage est requis'),
  framework: z.string().optional(),
  coverageTarget: z.number().min(0).max(100).optional()
});

const chatSchema = z.object({
  message: z.string().min(1, 'Le message est requis'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  context: z.object({
    code: z.string().optional(),
    language: z.string().optional(),
    projectInfo: z.string().optional()
  }).optional()
});

const refactorSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  language: z.string().min(1, 'Le langage est requis'),
  goal: z.enum(['performance', 'readability', 'modularity', 'dry']).optional()
});

const explainCodeSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  language: z.string().min(1, 'Le langage est requis')
});

export const generateCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = generateCodeSchema.parse(req.body);
    const result = await aiService.generateCode(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors de la génération', 500);
    }

    res.json(result);
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

export const reviewCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = reviewCodeSchema.parse(req.body);
    const result = await aiService.reviewCode(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors de la revue', 500);
    }

    res.json(result);
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

export const debugCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = debugCodeSchema.parse(req.body);
    const result = await aiService.debugCode(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors du débogage', 500);
    }

    res.json(result);
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

export const documentCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = documentCodeSchema.parse(req.body);
    const result = await aiService.documentCode(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors de la documentation', 500);
    }

    res.json(result);
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

export const generateTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = generateTestsSchema.parse(req.body);
    const result = await aiService.generateTests(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors de la génération des tests', 500);
    }

    res.json(result);
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

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = chatSchema.parse(req.body);
    const result = await aiService.chat(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors du chat', 500);
    }

    res.json(result);
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

export const refactorCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = refactorSchema.parse(req.body);
    const result = await aiService.refactorCode(validatedData);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors du refactoring', 500);
    }

    res.json(result);
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

export const explainCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = explainCodeSchema.parse(req.body);
    const result = await aiService.explainCode(validatedData.code, validatedData.language);

    if (!result.success) {
      throw new ApiError(result.error || 'Erreur lors de l\'explication', 500);
    }

    res.json(result);
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

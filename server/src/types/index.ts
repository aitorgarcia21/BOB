export interface GenerateCodeRequest {
  prompt: string;
  language: string;
  context?: string;
  framework?: string;
}

export interface ReviewCodeRequest {
  code: string;
  language: string;
  focusAreas?: ('security' | 'performance' | 'style' | 'bugs' | 'all')[];
}

export interface DebugCodeRequest {
  code: string;
  language: string;
  error?: string;
  context?: string;
}

export interface DocumentCodeRequest {
  code: string;
  language: string;
  style?: 'jsdoc' | 'docstring' | 'markdown' | 'inline';
}

export interface GenerateTestsRequest {
  code: string;
  language: string;
  framework?: string;
  coverageTarget?: number;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: {
    code?: string;
    language?: string;
    projectInfo?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface RefactorRequest {
  code: string;
  language: string;
  goal?: 'performance' | 'readability' | 'modularity' | 'dry';
}

export interface AIResponse {
  success: boolean;
  result?: string;
  metadata?: Record<string, unknown>;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export type AIProvider = 'openai' | 'anthropic';

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// AI endpoints
export const aiApi = {
  generateCode: (data: {
    prompt: string;
    language: string;
    context?: string;
    framework?: string;
  }) => api.post('/ai/generate', data),

  reviewCode: (data: {
    code: string;
    language: string;
    focusAreas?: string[];
  }) => api.post('/ai/review', data),

  debugCode: (data: {
    code: string;
    language: string;
    error?: string;
    context?: string;
  }) => api.post('/ai/debug', data),

  documentCode: (data: {
    code: string;
    language: string;
    style?: string;
  }) => api.post('/ai/document', data),

  generateTests: (data: {
    code: string;
    language: string;
    framework?: string;
    coverageTarget?: number;
  }) => api.post('/ai/test', data),

  chat: (data: {
    message: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    context?: {
      code?: string;
      language?: string;
      projectInfo?: string;
    };
  }) => api.post('/ai/chat', data),

  refactorCode: (data: {
    code: string;
    language: string;
    goal?: string;
  }) => api.post('/ai/refactor', data),

  explainCode: (data: {
    code: string;
    language: string;
  }) => api.post('/ai/explain', data)
};

// Project endpoints
export const projectApi = {
  getAll: () => api.get('/projects'),

  get: (id: string) => api.get(`/projects/${id}`),

  create: (data: {
    name: string;
    description: string;
    language: string;
    framework?: string;
  }) => api.post('/projects', data),

  update: (id: string, data: Partial<{
    name: string;
    description: string;
    language: string;
    framework?: string;
  }>) => api.put(`/projects/${id}`, data),

  delete: (id: string) => api.delete(`/projects/${id}`),

  addFile: (projectId: string, data: {
    name: string;
    path: string;
    content: string;
    language: string;
  }) => api.post(`/projects/${projectId}/files`, data),

  updateFile: (projectId: string, fileId: string, data: Partial<{
    name: string;
    path: string;
    content: string;
    language: string;
  }>) => api.put(`/projects/${projectId}/files/${fileId}`, data),

  deleteFile: (projectId: string, fileId: string) =>
    api.delete(`/projects/${projectId}/files/${fileId}`)
};

export default api;

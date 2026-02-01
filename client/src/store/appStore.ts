import { create } from 'zustand';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  createdAt: string;
  updatedAt: string;
  files: Array<{
    id: string;
    name: string;
    path: string;
    content: string;
    language: string;
  }>;
}

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Projects list
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;

  // Chat history
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Selected language
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;

  // Code in editor
  editorCode: string;
  setEditorCode: (code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Theme
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // Current project
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  // Projects list
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  // Chat history
  chatHistory: [],
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message]
  })),
  clearChatHistory: () => set({ chatHistory: [] }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Selected language
  selectedLanguage: 'typescript',
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),

  // Code in editor
  editorCode: '',
  setEditorCode: (code) => set({ editorCode: code })
}));

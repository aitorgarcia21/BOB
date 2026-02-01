import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  FileCode,
  Loader2,
  X
} from 'lucide-react';
import { projectApi } from '../services/api';
import { useAppStore } from '../store/appStore';
import LanguageSelector from '../components/LanguageSelector';

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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    language: 'typescript',
    framework: ''
  });
  const { setCurrentProject } = useAppStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;

    try {
      const response = await projectApi.create({
        name: newProject.name,
        description: newProject.description,
        language: newProject.language,
        framework: newProject.framework || undefined
      });
      setProjects([...projects, response.data]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', language: 'typescript', framework: '' });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) return;

    try {
      await projectApi.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentProject(project);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6 animate-fade-in">
      {/* Projects List */}
      <div className="w-80 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Projets</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </button>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {projects.length === 0 ? (
            <div className="card text-center text-gray-500 py-8">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun projet</p>
              <p className="text-sm mt-2">Créez votre premier projet</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`card cursor-pointer transition-all hover:border-primary-500 ${
                  selectedProject?.id === project.id ? 'border-primary-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.description || 'Pas de description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-dark-200 px-2 py-1 rounded">
                        {project.language}
                      </span>
                      {project.framework && (
                        <span className="text-xs bg-dark-200 px-2 py-1 rounded">
                          {project.framework}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="flex-1">
        {selectedProject ? (
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                <p className="text-gray-400">{selectedProject.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-lg text-sm">
                  {selectedProject.language}
                </span>
                {selectedProject.framework && (
                  <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-sm">
                    {selectedProject.framework}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Fichiers ({selectedProject.files.length})
              </h3>

              {selectedProject.files.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun fichier dans ce projet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProject.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-dark-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileCode className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.path}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-dark-100 px-2 py-1 rounded">
                        {file.language}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 pt-6 mt-6">
              <p className="text-sm text-gray-500">
                Créé le {new Date(selectedProject.createdAt).toLocaleDateString()}
                {' • '}
                Modifié le {new Date(selectedProject.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Sélectionnez un projet</p>
              <p className="text-sm mt-2">
                Ou créez-en un nouveau pour commencer
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nouveau projet</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nom</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Mon super projet"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  placeholder="Description du projet..."
                  className="input resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Langage principal
                </label>
                <LanguageSelector
                  value={newProject.language}
                  onChange={(lang) =>
                    setNewProject({ ...newProject, language: lang })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Framework (optionnel)
                </label>
                <input
                  type="text"
                  value={newProject.framework}
                  onChange={(e) =>
                    setNewProject({ ...newProject, framework: e.target.value })
                  }
                  placeholder="React, Express, Django..."
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!newProject.name.trim()}
                className="btn btn-primary flex-1"
              >
                <Plus className="w-4 h-4" />
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

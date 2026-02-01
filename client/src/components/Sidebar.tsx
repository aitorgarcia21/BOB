import { NavLink } from 'react-router-dom';
import {
  Home,
  Code,
  Search,
  Bug,
  FileText,
  TestTube,
  MessageSquare,
  FolderOpen,
  Settings,
  Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/generate', icon: Sparkles, label: 'Générer Code' },
  { to: '/review', icon: Search, label: 'Revue de Code' },
  { to: '/debug', icon: Bug, label: 'Débogage' },
  { to: '/docs', icon: FileText, label: 'Documentation' },
  { to: '/tests', icon: TestTube, label: 'Tests' },
  { to: '/chat', icon: MessageSquare, label: 'Chat IA' },
  { to: '/projects', icon: FolderOpen, label: 'Projets' }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-dark-200 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI Dev Studio</h1>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-dark-100 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-100 hover:text-white w-full transition-all">
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </button>
      </div>
    </aside>
  );
}

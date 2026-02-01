import { Bell, Moon, Sun, User } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function Header() {
  const { darkMode, toggleDarkMode } = useAppStore();

  return (
    <header className="h-16 bg-dark-200 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Bienvenue dans AI Dev Studio</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-dark-100 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}

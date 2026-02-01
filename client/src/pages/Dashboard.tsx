import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bug,
  FileText,
  TestTube,
  MessageSquare,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const features = [
  {
    to: '/generate',
    icon: Sparkles,
    title: 'Génération de Code',
    description: 'Créez du code à partir de descriptions en langage naturel',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    to: '/review',
    icon: Search,
    title: 'Revue de Code',
    description: 'Analyse automatique avec suggestions d\'amélioration',
    color: 'from-green-500 to-emerald-500'
  },
  {
    to: '/debug',
    icon: Bug,
    title: 'Débogage Intelligent',
    description: 'Détection et correction automatique des bugs',
    color: 'from-red-500 to-orange-500'
  },
  {
    to: '/docs',
    icon: FileText,
    title: 'Documentation Auto',
    description: 'Génération automatique de documentation',
    color: 'from-purple-500 to-pink-500'
  },
  {
    to: '/tests',
    icon: TestTube,
    title: 'Tests Automatisés',
    description: 'Création de tests unitaires et d\'intégration',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    to: '/chat',
    icon: MessageSquare,
    title: 'Chat IA',
    description: 'Assistant de développement interactif',
    color: 'from-indigo-500 to-violet-500'
  }
];

const stats = [
  { icon: Zap, label: 'Temps gagné', value: '80%' },
  { icon: Shield, label: 'Qualité du code', value: '+45%' },
  { icon: Clock, label: 'Productivité', value: '3x' }
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
          Développement assisté par IA
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Boostez votre productivité avec notre suite d'outils de développement
          alimentés par l'intelligence artificielle.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ to, icon: Icon, title, description, color }) => (
          <Link
            key={to}
            to={to}
            className="card group hover:border-primary-500 transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{description}</p>
            <div className="flex items-center gap-2 text-primary-400 text-sm">
              <span>Commencer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Start */}
      <div className="card bg-gradient-to-r from-primary-600/20 to-purple-600/20 border-primary-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-2">Prêt à commencer?</h3>
            <p className="text-gray-400">
              Lancez le Chat IA pour une assistance interactive ou générez directement du code.
            </p>
          </div>
          <Link to="/chat" className="btn btn-primary">
            <MessageSquare className="w-5 h-5" />
            Ouvrir le Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

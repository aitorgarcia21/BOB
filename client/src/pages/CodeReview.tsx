import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ResultPanel from '../components/ResultPanel';
import { aiApi } from '../services/api';

const focusAreaOptions = [
  { value: 'all', label: 'Tous les aspects' },
  { value: 'security', label: 'Sécurité' },
  { value: 'performance', label: 'Performance' },
  { value: 'style', label: 'Style & conventions' },
  { value: 'bugs', label: 'Bugs potentiels' }
];

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [focusAreas, setFocusAreas] = useState<string[]>(['all']);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleFocusArea = (area: string) => {
    if (area === 'all') {
      setFocusAreas(['all']);
    } else {
      const newAreas = focusAreas.includes(area)
        ? focusAreas.filter((a) => a !== area)
        : [...focusAreas.filter((a) => a !== 'all'), area];
      setFocusAreas(newAreas.length ? newAreas : ['all']);
    }
  };

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer du code à analyser');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await aiApi.reviewCode({
        code,
        language,
        focusAreas: focusAreas.includes('all') ? undefined : focusAreas
      });

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'Erreur lors de l\'analyse');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Revue de Code</h1>
          <p className="text-gray-400">Analysez votre code avec l'IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Code à analyser</h3>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height="350px"
            />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Aspects à analyser</h3>
            <div className="flex flex-wrap gap-2">
              {focusAreaOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleFocusArea(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    focusAreas.includes(option.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-200 text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleReview}
            disabled={isLoading || !code.trim()}
            className="btn btn-primary w-full justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyser le code
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Result Section */}
        <div>
          {result ? (
            <ResultPanel result={result} title="Résultat de l'analyse" />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Les résultats de l'analyse apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

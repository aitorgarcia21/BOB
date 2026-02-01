import { useState } from 'react';
import { TestTube, Loader2 } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ResultPanel from '../components/ResultPanel';
import { aiApi } from '../services/api';

const frameworkOptions: Record<string, string[]> = {
  typescript: ['Jest', 'Vitest', 'Mocha'],
  javascript: ['Jest', 'Vitest', 'Mocha'],
  python: ['pytest', 'unittest', 'nose'],
  java: ['JUnit', 'TestNG'],
  csharp: ['xUnit', 'NUnit', 'MSTest'],
  go: ['testing', 'testify'],
  rust: ['built-in', 'mockall'],
  php: ['PHPUnit', 'Pest'],
  ruby: ['RSpec', 'Minitest']
};

export default function TestGenerator() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [framework, setFramework] = useState('Jest');
  const [coverageTarget, setCoverageTarget] = useState(80);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const frameworks = frameworkOptions[newLang] || [];
    setFramework(frameworks[0] || '');
  };

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer du code pour générer les tests');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await aiApi.generateTests({
        code,
        language,
        framework: framework || undefined,
        coverageTarget
      });

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const frameworks = frameworkOptions[language] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
          <TestTube className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Génération de Tests</h1>
          <p className="text-gray-400">Créez des tests automatiquement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Code à tester</h3>
              <LanguageSelector value={language} onChange={handleLanguageChange} />
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height="300px"
            />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Configuration des tests</h3>
            <div className="space-y-4">
              {frameworks.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Framework de test
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {frameworks.map((fw) => (
                      <button
                        key={fw}
                        onClick={() => setFramework(fw)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          framework === fw
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-200 text-gray-400 hover:text-white'
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Objectif de couverture: {coverageTarget}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={coverageTarget}
                  onChange={(e) => setCoverageTarget(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !code.trim()}
            className="btn btn-primary w-full justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <TestTube className="w-5 h-5" />
                Générer les tests
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
            <ResultPanel result={result} title="Tests générés" />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Les tests générés apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ResultPanel from '../components/ResultPanel';
import { aiApi } from '../services/api';

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [framework, setFramework] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await aiApi.generateCode({
        prompt,
        language,
        framework: framework || undefined,
        context: context || undefined
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Génération de Code</h1>
          <p className="text-gray-400">Décrivez ce que vous voulez créer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-4">Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Langage</label>
                <LanguageSelector value={language} onChange={setLanguage} />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Framework (optionnel)
                </label>
                <input
                  type="text"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  placeholder="React, Express, Django..."
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez le code que vous voulez générer..."
                  className="input min-h-[150px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Contexte additionnel (optionnel)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Code existant, contraintes, spécifications..."
                  className="input min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="btn btn-primary w-full justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer le code
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
            <ResultPanel result={result} title="Code généré" />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Le code généré apparaîtra ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

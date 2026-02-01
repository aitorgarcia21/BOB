import { useState } from 'react';
import { Bug, Loader2 } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ResultPanel from '../components/ResultPanel';
import { aiApi } from '../services/api';

export default function Debugger() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [errorMessage, setErrorMessage] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDebug = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer du code à déboguer');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await aiApi.debugCode({
        code,
        language,
        error: errorMessage || undefined,
        context: context || undefined
      });

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'Erreur lors du débogage');
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Bug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Débogage Intelligent</h1>
          <p className="text-gray-400">Trouvez et corrigez les bugs automatiquement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Code à déboguer</h3>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height="300px"
            />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Informations additionnelles</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Message d'erreur (optionnel)
                </label>
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Collez le message d'erreur ici..."
                  className="input min-h-[80px] resize-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Contexte (optionnel)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Décrivez le comportement attendu, les conditions..."
                  className="input min-h-[60px] resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDebug}
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
                <Bug className="w-5 h-5" />
                Déboguer le code
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
            <ResultPanel result={result} title="Analyse et corrections" />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Les corrections proposées apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

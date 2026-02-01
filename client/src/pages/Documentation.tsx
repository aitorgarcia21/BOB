import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ResultPanel from '../components/ResultPanel';
import { aiApi } from '../services/api';

const styleOptions = [
  { value: 'jsdoc', label: 'JSDoc' },
  { value: 'docstring', label: 'Docstring (Python)' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'inline', label: 'Commentaires inline' }
];

export default function Documentation() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [style, setStyle] = useState('jsdoc');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDocument = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer du code à documenter');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await aiApi.documentCode({
        code,
        language,
        style
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Documentation Automatique</h1>
          <p className="text-gray-400">Générez la documentation de votre code</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Code à documenter</h3>
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
            <h3 className="font-semibold mb-4">Style de documentation</h3>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStyle(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    style === option.value
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
            onClick={handleDocument}
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
                <FileText className="w-5 h-5" />
                Générer la documentation
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
            <ResultPanel result={result} title="Documentation générée" />
          ) : (
            <div className="card h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>La documentation générée apparaîtra ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

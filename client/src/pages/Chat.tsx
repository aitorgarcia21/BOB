import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Trash2, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { aiApi } from '../services/api';
import { useAppStore } from '../store/appStore';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeContext, setCodeContext] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatHistory, addChatMessage, clearChatHistory } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiApi.chat({
        message: input,
        conversationHistory: chatHistory.map(m => ({
          role: m.role,
          content: m.content
        })),
        context: codeContext ? { code: codeContext } : undefined
      });

      if (response.data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.result,
          timestamp: new Date().toISOString()
        };
        addChatMessage(assistantMessage);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date().toISOString()
      };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chat IA</h1>
            <p className="text-gray-400">Assistant de développement interactif</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`btn ${showCodeInput ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Code className="w-4 h-4" />
            Contexte code
          </button>
          <button onClick={clearChatHistory} className="btn btn-secondary">
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>
        </div>
      </div>

      {/* Code context input */}
      {showCodeInput && (
        <div className="card mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Code de contexte (optionnel)
          </label>
          <textarea
            value={codeContext}
            onChange={(e) => setCodeContext(e.target.value)}
            placeholder="Collez du code ici pour donner du contexte à l'IA..."
            className="input min-h-[100px] font-mono text-sm resize-none"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto card mb-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Commencez une conversation</p>
              <p className="text-sm">
                Posez des questions sur le code, demandez de l'aide ou explorez des concepts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-200 text-gray-100'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none prose-sm">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const inline = !match;
                            return inline ? (
                              <code
                                className="bg-dark-300 px-1 py-0.5 rounded text-primary-400"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs opacity-50 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-400">Réflexion en cours...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Posez votre question..."
          className="input flex-1 resize-none"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="btn btn-primary px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

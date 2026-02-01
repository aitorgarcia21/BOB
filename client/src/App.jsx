import { useEffect, useMemo, useState } from 'react';
import { Code2, Sparkles, MessageSquare, Wrench, BookOpen, Database, RefreshCcw } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [code, setCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [useMemory, setUseMemory] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const defaultStripeMcpUrl = import.meta.env.VITE_MCP_STRIPE_URL || '';
  const defaultSupabaseMcpUrl = import.meta.env.VITE_MCP_SUPABASE_URL || '';
  const defaultGithubMcpUrl = import.meta.env.VITE_MCP_GITHUB_URL || '';

  const [mcpConfig, setMcpConfig] = useState({
    stripe_mcp_url: defaultStripeMcpUrl,
    stripe_mcp_key: '',
    supabase_mcp_url: defaultSupabaseMcpUrl,
    supabase_mcp_key: '',
    github_mcp_url: defaultGithubMcpUrl,
    github_mcp_key: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const defaultSession = useMemo(() => `session-${crypto.randomUUID()}`, []);

  useEffect(() => {
    setSessionId(defaultSession);
  }, [defaultSession]);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    initAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      if (!user) return;
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) return;
        const response = await fetch(`${API_URL}/api/mcp-config`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data?.config) {
          setMcpConfig({
            stripe_mcp_url: data.config.stripe_mcp_url || '',
            stripe_mcp_key: data.config.stripe_mcp_key || '',
            supabase_mcp_url: data.config.supabase_mcp_url || '',
            supabase_mcp_key: data.config.supabase_mcp_key || '',
            github_mcp_url: data.config.github_mcp_url || '',
            github_mcp_key: data.config.github_mcp_key || ''
          });
        }
      } catch (error) {
        console.error('MCP config load error:', error);
      }
    };

    loadConfig();
  }, [API_URL, user]);

  useEffect(() => {
    setMcpConfig((prev) => ({
      ...prev,
      stripe_mcp_url: prev.stripe_mcp_url || defaultStripeMcpUrl,
      supabase_mcp_url: prev.supabase_mcp_url || defaultSupabaseMcpUrl,
      github_mcp_url: prev.github_mcp_url || defaultGithubMcpUrl
    }));
  }, [defaultStripeMcpUrl, defaultSupabaseMcpUrl, defaultGithubMcpUrl]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch(`${API_URL}/api/models`);
        const data = await response.json();
        setModels(data.models || []);
        if (data.models?.length) {
          setSelectedModel(data.models[0]);
        }
      } catch (error) {
        console.error('Model list error:', error);
      }
    };

    loadModels();
  }, [API_URL]);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('Compte créé. Vérifie ton email pour confirmer.');
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveMcpConfig = async () => {
    if (!user) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;
    const response = await fetch(`${API_URL}/api/mcp-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(mcpConfig)
    });
    if (!response.ok) {
      alert('Erreur lors de la sauvegarde MCP');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language, context: code })
      });
      
      const data = await response.json();
      setCode(data.code);
      setResult('Code generated successfully!');
    } catch (error) {
      setResult('Error generating code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemory = async () => {
    if (!sessionId) return;
    try {
      await fetch(`${API_URL}/api/memory/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      setChatHistory([]);
    } catch (error) {
      console.error('Memory clear error:', error);
    }
  };

  const handleExplain = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const data = await response.json();
      setResult(data.explanation);
    } catch (error) {
      setResult('Error explaining code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const data = await response.json();
      setCode(data.fixedCode);
      setResult('Code fixed and improved!');
    } catch (error) {
      setResult('Error fixing code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user', content: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage,
          history: chatHistory,
          sessionId,
          model: selectedModel,
          useMemory
        })
      });
      
      const data = await response.json();
      setChatHistory([...newHistory, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Error: ' + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'explain', label: 'Explain', icon: BookOpen },
    { id: 'fix', label: 'Fix', icon: Wrench },
    { id: 'chat', label: 'Chat', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold">AI Dev Studio</h1>
          </div>
          <p className="text-gray-400">Your AI-powered coding assistant</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/60 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Account</h2>
            {user ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">Connecté : {user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSignIn}
                    disabled={authLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignUp}
                    disabled={authLoading}
                    className="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800/60 rounded-xl p-5 lg:col-span-2">
            <h2 className="font-semibold mb-3">MCP Configuration (Stripe + Supabase)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={mcpConfig.stripe_mcp_url}
                onChange={(e) => setMcpConfig((prev) => ({ ...prev, stripe_mcp_url: e.target.value }))}
                placeholder="Stripe MCP URL"
                className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
              />
              <input
                type="password"
                value={mcpConfig.stripe_mcp_key}
                onChange={(e) => setMcpConfig((prev) => ({ ...prev, stripe_mcp_key: e.target.value }))}
                placeholder="Stripe MCP Key"
                className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
              />
              <input
                type="text"
                value={mcpConfig.supabase_mcp_url}
                onChange={(e) => setMcpConfig((prev) => ({ ...prev, supabase_mcp_url: e.target.value }))}
                placeholder="Supabase MCP URL"
                className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
              />
              <input
                type="password"
                value={mcpConfig.supabase_mcp_key}
                onChange={(e) => setMcpConfig((prev) => ({ ...prev, supabase_mcp_key: e.target.value }))}
                placeholder="Supabase MCP Key"
                className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
              />
              <input
                type="text"
                value={mcpConfig.github_mcp_url}
                onChange={(e) => setMcpConfig((prev) => ({ ...prev, github_mcp_url: e.target.value }))}
                placeholder="GitHub MCP URL"
                className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
              />
              <input
                type="password"
                value={mcpConfig.github_mcp_key}
                onChange={(e) => setMcpConfig((prev) => ({ ...prev, github_mcp_key: e.target.value }))}
                placeholder="GitHub MCP Key"
                className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={handleSaveMcpConfig}
                disabled={!user}
                className="px-4 py-2 bg-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                Sauvegarder MCP
              </button>
              {!user && (
                <p className="text-xs text-gray-400 mt-2">Connecte-toi pour sauvegarder la config.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {activeTab !== 'chat' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>

                {activeTab === 'generate' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">What do you want to build?</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Create a function that validates email addresses"
                      className="w-full h-32 px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-purple-500 outline-none resize-none"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Code'}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Code Editor</label>
                  <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <Editor
                      height="400px"
                      language={language}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>

                {activeTab === 'explain' && (
                  <button
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full bg-blue-600 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? 'Explaining...' : 'Explain Code'}
                  </button>
                )}

                {activeTab === 'fix' && (
                  <button
                    onClick={handleFix}
                    disabled={loading}
                    className="w-full bg-green-600 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? 'Fixing...' : 'Fix & Improve Code'}
                  </button>
                )}
              </>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4 h-[500px] overflow-y-auto space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Start a conversation with your AI assistant</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-purple-600 ml-12'
                            : 'bg-slate-700 mr-12'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
                    >
                      {models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Session</label>
                    <input
                      type="text"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={useMemory}
                      onChange={(e) => setUseMemory(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Use memory</span>
                    </span>
                  </label>
                  <button
                    onClick={handleClearMemory}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-700 text-sm hover:bg-slate-600 transition"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Clear memory</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask anything about coding..."
                    className="flex-1 px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-purple-500 outline-none"
                  />
                  <button
                    onClick={handleChat}
                    disabled={loading}
                    className="px-6 bg-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeTab !== 'chat' && (
            <div>
              <label className="block text-sm font-medium mb-2">Result</label>
              <div className="bg-slate-800 rounded-lg p-4 h-[600px] overflow-y-auto">
                {result ? (
                  <pre className="text-sm whitespace-pre-wrap text-gray-300">{result}</pre>
                ) : (
                  <div className="text-center text-gray-500 mt-20">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

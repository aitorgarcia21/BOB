import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { appendSessionMemory, clearSessionMemory, getSessionMemory } from './memoryStore.js';
import { supabaseAdmin } from './supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AVAILABLE_MODELS = (process.env.AI_MODELS || 'gpt-4o-mini,gpt-4o,gpt-4o-realtime-preview')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

app.use(cors());
app.use(express.json());

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization token' });
    }
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = data.user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Get MCP config for current user
app.get('/api/mcp-config', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('mcp_configs')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({ config: data || null });
  } catch (error) {
    console.error('MCP config fetch error:', error);
    res.status(500).json({ error: 'Failed to load MCP config' });
  }
});

// Upsert MCP config for current user
app.put('/api/mcp-config', requireAuth, async (req, res) => {
  try {
    const {
      stripe_mcp_url,
      stripe_mcp_key,
      supabase_mcp_url,
      supabase_mcp_key
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('mcp_configs')
      .upsert({
        user_id: req.user.id,
        stripe_mcp_url,
        stripe_mcp_key,
        supabase_mcp_url,
        supabase_mcp_key
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    res.json({ config: data });
  } catch (error) {
    console.error('MCP config update error:', error);
    res.status(500).json({ error: 'Failed to save MCP config' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Dev Studio API is running' });
});

// Available models
app.get('/api/models', (req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

// Generate code with AI
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, language, context } = req.body;

    const systemPrompt = `You are an expert programmer. Generate clean, production-ready code based on the user's request.
Language: ${language || 'JavaScript'}
${context ? `Context: ${context}` : ''}

Return ONLY the code without explanations, markdown formatting, or code blocks.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const code = completion.choices[0].message.content;

    res.json({
      code,
      language: language || 'javascript'
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Explain code with AI
app.post('/api/explain', async (req, res) => {
  try {
    const { code, language } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a code explainer. Explain the given code clearly and concisely.'
        },
        {
          role: 'user',
          content: `Explain this ${language || 'code'}:\n\n${code}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    res.json({
      explanation: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

// Fix/improve code with AI
app.post('/api/fix', async (req, res) => {
  try {
    const { code, language, issue } = req.body;

    const systemPrompt = `You are a code debugger and optimizer. ${issue ? `Fix this issue: ${issue}` : 'Improve and fix any issues in the code.'}
Return ONLY the fixed code without explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Language: ${language || 'JavaScript'}\n\n${code}` }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    res.json({
      fixedCode: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({ error: 'Failed to fix code' });
  }
});

// Chat with AI about code
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, sessionId, model, useMemory = true } = req.body;
    const selectedModel = model || AVAILABLE_MODELS[0] || 'gpt-4o-mini';
    const memory = useMemory && sessionId ? await getSessionMemory(sessionId) : [];

    const messages = [
      {
        role: 'system',
        content: 'You are an expert programming assistant. Help users with coding questions, debugging, and best practices.'
      },
      ...memory,
      ...(history || []),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 1500
    });

    const responseText = completion.choices[0].message.content;

    if (useMemory && sessionId) {
      await appendSessionMemory(sessionId, [
        { role: 'user', content: message },
        { role: 'assistant', content: responseText }
      ]);
    }

    res.json({
      response: responseText,
      model: selectedModel
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// Clear memory for a session
app.post('/api/memory/clear', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    await clearSessionMemory(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Memory clear error:', error);
    res.status(500).json({ error: 'Failed to clear memory' });
  }
});

// MCP tool proxy (optional)
app.post('/api/mcp/execute', requireAuth, async (req, res) => {
  try {
    const { tool, input, sessionId } = req.body;
    let mcpUrl = process.env.MCP_URL;
    let mcpKey = process.env.MCP_KEY;

    const { data } = await supabaseAdmin
      .from('mcp_configs')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (tool?.startsWith('stripe') && data?.stripe_mcp_url) {
      mcpUrl = data.stripe_mcp_url;
      mcpKey = data.stripe_mcp_key || mcpKey;
    }

    if (tool?.startsWith('supabase') && data?.supabase_mcp_url) {
      mcpUrl = data.supabase_mcp_url;
      mcpKey = data.supabase_mcp_key || mcpKey;
    }

    if (!mcpUrl) {
      return res.status(400).json({ error: 'MCP_URL not configured' });
    }

    const response = await fetch(`${mcpUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(mcpKey ? { Authorization: `Bearer ${mcpKey}` } : {})
      },
      body: JSON.stringify({ tool, input, sessionId })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('MCP proxy error:', error);
    res.status(500).json({ error: 'Failed to execute MCP tool' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Dev Studio server running on port ${PORT}`);
});

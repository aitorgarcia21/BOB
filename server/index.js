import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Dev Studio API is running' });
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
    const { message, history } = req.body;

    const messages = [
      {
        role: 'system',
        content: 'You are an expert programming assistant. Help users with coding questions, debugging, and best practices.'
      },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1500
    });

    res.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Dev Studio server running on port ${PORT}`);
});

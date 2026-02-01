# 🚀 AI Dev Studio

AI-powered development studio with code generation, explanation, fixing, and chat assistance.

## Features

- **Generate Code**: Describe what you want and AI generates the code
- **Explain Code**: Paste code and get clear explanations
- **Fix & Improve**: Automatically fix bugs and improve code quality
- **AI Chat**: Ask coding questions and get instant answers
- **Multi-model**: Choose between multiple OpenAI models
- **Session Memory**: Persistent memory per chat session
- **MCP Tools (optional)**: Proxy MCP tools from the backend
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Multi-language**: JavaScript, TypeScript, Python, Java, C++, Go, Rust

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + Monaco Editor
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4o family (configurable)

## Setup

1. **Install dependencies**:
```bash
npm install
cd client && npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Add your OPENAI_API_KEY
```

Optional env vars:
- `AI_MODELS` (comma-separated list)
- `MEMORY_PATH` (path to JSON memory store)
- `MCP_URL` (proxy MCP server base URL)

3. **Run development**:
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Add environment variables:
   - `OPENAI_API_KEY`
4. Deploy!

## API Endpoints

- `POST /api/generate` - Generate code from prompt
- `POST /api/explain` - Explain code
- `POST /api/fix` - Fix and improve code
- `GET /api/models` - List available models
- `POST /api/chat` - Chat with AI assistant (supports model + memory)
- `POST /api/memory/clear` - Clear memory for a session
- `POST /api/mcp/execute` - Proxy MCP tool execution

## License

MIT

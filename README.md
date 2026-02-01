# 🚀 AI Dev Studio

AI-powered development studio with code generation, explanation, fixing, and chat assistance.

## Features

- **Generate Code**: Describe what you want and AI generates the code
- **Explain Code**: Paste code and get clear explanations
- **Fix & Improve**: Automatically fix bugs and improve code quality
- **AI Chat**: Ask coding questions and get instant answers
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Multi-language**: JavaScript, TypeScript, Python, Java, C++, Go, Rust

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + Monaco Editor
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4

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
- `POST /api/chat` - Chat with AI assistant

## License

MIT

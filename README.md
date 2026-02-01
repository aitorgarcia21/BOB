# AI Dev Studio 🤖

Application de développement complet assistée par Intelligence Artificielle.

## Fonctionnalités

- **Génération de Code** - Créez du code à partir de descriptions en langage naturel
- **Revue de Code** - Analyse automatique avec suggestions d'amélioration
- **Débogage Intelligent** - Détection et correction automatique des bugs
- **Documentation Auto** - Génération automatique de documentation
- **Tests Automatisés** - Création de tests unitaires et d'intégration
- **Refactoring** - Suggestions de refactorisation du code
- **Chat IA** - Assistant de développement interactif

## Installation

```bash
# Installer toutes les dépendances
npm run install:all

# Configurer les variables d'environnement
cp server/.env.example server/.env
# Éditer server/.env avec vos clés API
```

## Démarrage

```bash
# Mode développement (frontend + backend)
npm run dev

# Mode production
npm run build
npm start
```

## Architecture

```
ai-dev-studio/
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   └── public/
├── server/          # Backend Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middleware/
│   └── tests/
└── shared/          # Types et utilitaires partagés
```

## Configuration

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Clé API OpenAI |
| `ANTHROPIC_API_KEY` | Clé API Anthropic |
| `PORT` | Port du serveur (défaut: 3001) |
| `NODE_ENV` | Environnement (development/production) |

## API Endpoints

- `POST /api/ai/generate` - Générer du code
- `POST /api/ai/review` - Revue de code
- `POST /api/ai/debug` - Débogage
- `POST /api/ai/document` - Générer documentation
- `POST /api/ai/test` - Générer tests
- `POST /api/ai/chat` - Chat avec l'IA
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet

## Licence

MIT

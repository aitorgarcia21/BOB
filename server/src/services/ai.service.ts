import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  GenerateCodeRequest,
  ReviewCodeRequest,
  DebugCodeRequest,
  DocumentCodeRequest,
  GenerateTestsRequest,
  ChatRequest,
  RefactorRequest,
  AIResponse,
  AIProvider
} from '../types';

class AIService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private defaultProvider: AIProvider;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    this.defaultProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'anthropic';
  }

  private async callAnthropic(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic API non configurée');
    }

    const response = await this.anthropic.messages.create({
      model: process.env.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content.find(c => c.type === 'text');

    return {
      success: true,
      result: textContent?.text || '',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API non configurée');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return {
      success: true,
      result: response.choices[0]?.message?.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0
      }
    };
  }

  private async callAI(systemPrompt: string, userPrompt: string, provider?: AIProvider): Promise<AIResponse> {
    const selectedProvider = provider || this.defaultProvider;

    try {
      if (selectedProvider === 'anthropic') {
        return await this.callAnthropic(systemPrompt, userPrompt);
      } else {
        return await this.callOpenAI(systemPrompt, userPrompt);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      return {
        success: false,
        error: message
      };
    }
  }

  async generateCode(request: GenerateCodeRequest): Promise<AIResponse> {
    const systemPrompt = `Tu es un expert en développement logiciel spécialisé en ${request.language}.
Tu génères du code propre, bien structuré et documenté.
Réponds uniquement avec le code demandé, sans explications supplémentaires sauf si nécessaire.
Utilise les meilleures pratiques du langage ${request.language}${request.framework ? ` et du framework ${request.framework}` : ''}.`;

    const userPrompt = `Génère le code suivant en ${request.language}:

${request.prompt}

${request.context ? `Contexte additionnel:\n${request.context}` : ''}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  async reviewCode(request: ReviewCodeRequest): Promise<AIResponse> {
    const focusAreas = request.focusAreas?.join(', ') || 'tous les aspects';

    const systemPrompt = `Tu es un expert en revue de code avec une grande expérience en ${request.language}.
Tu analyses le code de manière approfondie et fournis des suggestions constructives.
Structure ta réponse avec des sections claires:
- Résumé
- Points positifs
- Problèmes détectés (avec niveau de sévérité)
- Suggestions d'amélioration
- Score global (sur 10)`;

    const userPrompt = `Effectue une revue de code complète du code suivant en ${request.language}.
Concentre-toi sur: ${focusAreas}

\`\`\`${request.language}
${request.code}
\`\`\``;

    return this.callAI(systemPrompt, userPrompt);
  }

  async debugCode(request: DebugCodeRequest): Promise<AIResponse> {
    const systemPrompt = `Tu es un expert en débogage de code ${request.language}.
Tu identifies les bugs, les erreurs logiques et les problèmes potentiels.
Pour chaque problème trouvé:
1. Explique le problème
2. Montre où il se trouve
3. Propose une correction
4. Fournis le code corrigé`;

    const userPrompt = `Débogue le code suivant en ${request.language}:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.error ? `Erreur signalée: ${request.error}` : ''}
${request.context ? `Contexte: ${request.context}` : ''}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  async documentCode(request: DocumentCodeRequest): Promise<AIResponse> {
    const styleGuide = {
      jsdoc: 'JSDoc avec @param, @returns, @throws, @example',
      docstring: 'docstrings Python avec Args, Returns, Raises, Examples',
      markdown: 'documentation Markdown avec exemples de code',
      inline: 'commentaires inline explicatifs'
    };

    const systemPrompt = `Tu es un expert en documentation de code.
Tu génères une documentation claire, complète et professionnelle.
Style de documentation: ${styleGuide[request.style || 'jsdoc']}
Inclus:
- Description de la fonction/classe
- Paramètres et leurs types
- Valeurs de retour
- Exceptions possibles
- Exemples d'utilisation`;

    const userPrompt = `Génère la documentation pour le code suivant en ${request.language}:

\`\`\`${request.language}
${request.code}
\`\`\``;

    return this.callAI(systemPrompt, userPrompt);
  }

  async generateTests(request: GenerateTestsRequest): Promise<AIResponse> {
    const systemPrompt = `Tu es un expert en tests logiciels pour ${request.language}.
${request.framework ? `Utilise le framework de test ${request.framework}.` : ''}
Génère des tests complets incluant:
- Tests unitaires
- Cas limites (edge cases)
- Tests de gestion d'erreurs
- Mocks si nécessaire
Vise une couverture de ${request.coverageTarget || 80}%.`;

    const userPrompt = `Génère des tests pour le code suivant en ${request.language}:

\`\`\`${request.language}
${request.code}
\`\`\``;

    return this.callAI(systemPrompt, userPrompt);
  }

  async chat(request: ChatRequest): Promise<AIResponse> {
    const systemPrompt = `Tu es un assistant de développement IA expert.
Tu aides les développeurs avec:
- Répondre aux questions de programmation
- Expliquer des concepts
- Suggérer des solutions
- Déboguer du code
- Proposer des améliorations

Sois concis mais complet. Utilise des exemples de code quand c'est utile.
${request.context?.projectInfo ? `Contexte du projet: ${request.context.projectInfo}` : ''}`;

    let userPrompt = request.message;

    if (request.context?.code) {
      userPrompt += `\n\nCode de référence (${request.context.language || 'non spécifié'}):\n\`\`\`\n${request.context.code}\n\`\`\``;
    }

    return this.callAI(systemPrompt, userPrompt);
  }

  async refactorCode(request: RefactorRequest): Promise<AIResponse> {
    const goalDescriptions = {
      performance: 'optimiser les performances',
      readability: 'améliorer la lisibilité',
      modularity: 'rendre le code plus modulaire',
      dry: 'éliminer les répétitions (DRY)'
    };

    const systemPrompt = `Tu es un expert en refactorisation de code ${request.language}.
Objectif principal: ${goalDescriptions[request.goal || 'readability']}

Pour chaque modification:
1. Explique pourquoi le changement est bénéfique
2. Montre le code avant/après
3. Fournis le code refactorisé complet à la fin`;

    const userPrompt = `Refactorise le code suivant en ${request.language}:

\`\`\`${request.language}
${request.code}
\`\`\``;

    return this.callAI(systemPrompt, userPrompt);
  }

  async explainCode(code: string, language: string): Promise<AIResponse> {
    const systemPrompt = `Tu es un expert pédagogue en programmation.
Explique le code de manière claire et accessible.
Structure ton explication:
1. Vue d'ensemble
2. Explication ligne par ligne des parties importantes
3. Concepts clés utilisés
4. Cas d'utilisation typiques`;

    const userPrompt = `Explique le code suivant en ${language}:

\`\`\`${language}
${code}
\`\`\``;

    return this.callAI(systemPrompt, userPrompt);
  }
}

export const aiService = new AIService();

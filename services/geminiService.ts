import { GoogleGenAI } from "@google/genai";
import { ToneOfVoice, CopyType } from '../types';

// FIX: Refactored to align with API key handling guidelines. Removed mock data, API key checks, and UI warnings. The application now assumes a valid API_KEY is always present in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCopy = async (
  productName: string,
  description: string,
  targetAudience: string,
  tone: ToneOfVoice,
  type: CopyType
): Promise<string> => {
  const prompt = `Você é um copywriter especialista em marketing digital. Sua tarefa é criar uma copy persuasiva e de alta conversão.

**Produto/Serviço:** ${productName}
**Descrição:** ${description}
**Público-alvo:** ${targetAudience}
**Tom de voz:** ${tone}
**Tipo de Copy:** ${type}

Crie a copy solicitada. Use gatilhos mentais, quebras de linha para boa legibilidade e emojis relevantes para o tom de voz. Retorne apenas o texto da copy, sem introduções ou observações.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Error generating copy with Gemini:", error);
    let errorMessage = "Ocorreu um erro ao gerar a copy. Por favor, tente novamente.";
    if (error.message?.includes('API_KEY') || (error.response?.status === 401 || error.response?.status === 403)) {
        errorMessage = 'Erro: Chave API Gemini inválida ou não configurada. Por favor, verifique suas configurações no ambiente.';
    }
    return errorMessage;
  }
};

export const generateContentIdeas = async (niche: string): Promise<string> => {
  const prompt = `Você é um estrategista de conteúdo especialista em marketing digital. Sua tarefa é gerar 10 ideias de conteúdo criativas e relevantes para um nicho específico.

**Nicho/Objetivo:** ${niche}

Gere 10 ideias de conteúdo. Para cada ideia, forneça um título, uma breve descrição e uma sugestão de categoria (ex: Dica, Tutorial, Bastidores, Interativo, Prova Social).

**Formato de Saída (use exatamente este formato):**
[Número]. **[Título da Ideia] |** [Descrição da Ideia] | [Categoria]

**Exemplo:**
1. **Os 5 Maiores Erros no [Nicho] |** Um post listando os erros comuns que iniciantes cometem e como evitá-los. | Dica

Retorne apenas a lista de ideias, sem introduções ou observações.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Priorize a velocidade para a geração de ideias
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Error generating content ideas with Gemini:", error);
    let errorMessage = "Ocorreu um erro ao gerar as ideias. Por favor, tente novamente.";
    if (error.message?.includes('API_KEY') || (error.response?.status === 401 || error.response?.status === 403)) {
        errorMessage = 'Erro: Chave API Gemini inválida ou não configurada. Por favor, verifique suas configurações no ambiente.';
    }
    return errorMessage;
  }
};

export const generateIdeaExpansion = async (title: string, description: string): Promise<string> => {
  const prompt = `A partir do seguinte título e descrição de ideia de conteúdo, elabore uma descrição mais detalhada da proposta, incluindo sugestões de narrativa, elementos visuais (se aplicável), e potencial mensagem/call to action. Expanda a ideia em um parágrafo conciso mas informativo.

**Título da Ideia:** ${title}
**Descrição Curta:** ${description}

Descrição Detalhada:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use a text-focused model for idea expansion
      contents: prompt,
      config: {
          thinkingConfig: { thinkingBudget: 0 }, // Priorize a velocidade para a expansão de ideias
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Error generating idea expansion with Gemini:", error);
    let errorMessage = "Ocorreu um erro ao expandir a ideia. Por favor, tente novamente.";
    if (error.message?.includes('API_KEY') || (error.response?.status === 401 || error.response?.status === 403)) {
        errorMessage = 'Erro: Chave API Gemini inválida ou não configurada. Por favor, verifique suas configurações no ambiente.';
    }
    return errorMessage;
  }
};
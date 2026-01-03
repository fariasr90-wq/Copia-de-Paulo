
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSermonOutline = async (topic: string, theme: string, reference?: string) => {
  const prompt = `
    Aja como um renomado teólogo e pregador exegético. Crie um sermão completo baseado no assunto "${topic}", tema "${theme}" e na referência "${reference || 'Sugerir uma apropriada'}".
    
    SIGA RIGOROSAMENTE A ESTRUTURA ABAIXO, NA MESMA ORDEM SEQUENCIAL:

    1. PREPARAÇÃO: Liste o texto bíblico dos Versículos Propostos na íntegra.
    
    2. EXEGESE DOS VERSÍCULOS: Faça uma análise detalhada e crítica do texto original (grego/hebraico), buscando o significado literal, gramatical e contextual das palavras e frases.
    
    3. HERMENÊUTICA DOS VERSÍCULOS: Interprete o significado do texto para o ouvinte moderno, aplicando os princípios corretos de interpretação (gênero literário, unidade da Escritura, etc.).
    
    4. NARRAÇÃO DRAMÁTICA: Atue como um narrador e faça uma narração com os versículos bíblicos propostos. 
       - Tom forte e dramático.
       - Inclua Contexto Histórico (data, eventos, autor, destinatário).
       - Inclua Contexto Cultural (costumes, tradições relevantes).
       - Extensão: 300 a 400 palavras.
       - Deixe em NEGRITO as partes de maior relevância.
    
    5. TEMA: Defina o tema central (título) do sermão.
    
    6. GANCHO / CHAMADA PARA ATENÇÃO: Declaração ou pergunta forte para capturar a audiência.
    
    7. QUEBRA-GELO: Proponha uma breve atividade ou pergunta relacionada ao tema antes da leitura.
    
    8. INTRODUÇÃO: Apresente o tema, a passagem e a tese central.
    
    9. CORPO DA PREGAÇÃO (TRÊS PONTOS PRINCIPAIS):
       - Distribua os versículos sequencialmente.
       - Cada um dos 3 pontos deve ter entre 450 a 500 PALAVRAS.
       - Cada ponto deve conter: Análise Hermenêutica completa, citações de comentários, exploração histórica/cultural.
       - Versículo de Apoio adicional para cada ponto.
       - Use NEGRITO para destacar partes importantes.
       - Termine cada ponto com uma FRASE DE IMPACTO que resuma o argumento.
    
    10. CONCLUSÃO: Resumo poderoso dos três pontos abordados e apelo final.
    
    IMPORTANTE: Mantenha um tom firme porém acolhedor. O conteúdo deve ser profundamente bíblico e acadêmico na base, mas prático na entrega.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return response.text;
};

export const fetchChronologicalEvents = async (passage: string) => {
  const prompt = `
    Aja como um historiador bíblico especializado em cronologia. 
    Analise a referência: "${passage}".
    Identifique os eventos principais narrados ou que cercam este período.
    
    Retorne um JSON estruturado com:
    - reference: a referência analisada.
    - period: uma descrição do período geral (Ex: Era dos Patriarcas, Período de Exílio).
    - events: lista de objetos { 
        year: "data estimada A.C. ou D.C.", 
        title: "título do evento", 
        description: "resumo do fato", 
        figures: ["personagens chave"],
        eventReference: "Capítulo e Versículo específico deste evento dentro da pesquisa" 
      } ordenados cronologicamente.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING },
          period: { type: Type.STRING },
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                figures: { type: Type.ARRAY, items: { type: Type.STRING } },
                eventReference: { type: Type.STRING, description: "Referência bíblica exata do evento (Cap:Ver)" }
              },
              required: ["year", "title", "description", "eventReference"]
            }
          }
        },
        required: ["reference", "period", "events"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const fetchBiblicalCommentary = async (passage: string) => {
  const prompt = `
    Aja como um profundo comentador bíblico, sintetizando o pensamento de autores como Matthew Henry, Charles Spurgeon, Agostinho e teólogos contemporâneos.
    Analise a passagem: "${passage}".
    
    Forneça a resposta em formato JSON estruturado com:
    - reference: a referência bíblica confirmada.
    - historicalContext: o contexto da época em que foi escrito.
    - verseByVerse: uma lista de objetos { verse: "número", text: "texto", commentary: "análise profunda" }.
    - theologicalInsights: principais lições doutrinárias.
    - practicalApplication: como pregar ou aplicar isso hoje.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING },
          historicalContext: { type: Type.STRING },
          verseByVerse: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                verse: { type: Type.STRING }, 
                text: { type: Type.STRING }, 
                commentary: { type: Type.STRING } 
              },
              required: ["verse", "commentary"]
            } 
          },
          theologicalInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
          practicalApplication: { type: Type.STRING }
        },
        required: ["reference", "historicalContext", "verseByVerse", "theologicalInsights", "practicalApplication"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const translateBiblical = async (text: string, direction: 'pt-gr' | 'gr-pt' | 'pt-he' | 'he-pt') => {
  const config = {
    'pt-gr': 'Português para Grego Bíblico (Koiné)',
    'gr-pt': 'Grego Bíblico (Koiné) para Português',
    'pt-he': 'Português para Hebraico Bíblico',
    'he-pt': 'Hebraico Bíblico para Português',
  };

  const prompt = `Atue como um erudito bíblico e linguista. Traduza e analise o texto de ${config[direction]}: "${text}".
  Forneça uma resposta detalhada em JSON contendo:
  - original: o texto original.
  - translated: a tradução principal.
  - transliteration: a forma fonética.
  - meanings: significados detalhados e definições das palavras-chave.
  - exegesis: análise do contexto original, gramática e nuances históricas.
  - hermeneutics: interpretação teológica e aplicação contemporânea.
  - biblicalExamples: uma lista de objetos with "verse" (referência) e "context" (breve explicação) onde este termo ou conceito aparece.
  - thematicConcordance: uma lista de temas ou palavras relacionadas para estudo posterior.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          translated: { type: Type.STRING },
          transliteration: { type: Type.STRING },
          meanings: { type: Type.STRING },
          exegesis: { type: Type.STRING },
          hermeneutics: { type: Type.STRING },
          biblicalExamples: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                verse: { type: Type.STRING }, 
                context: { type: Type.STRING } 
              },
              required: ["verse", "context"]
            } 
          },
          thematicConcordance: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["original", "translated", "meanings", "exegesis", "hermeneutics", "biblicalExamples", "thematicConcordance"]
      }
    }
  });
  
  return JSON.parse(response.text.trim());
};

export const theologicalLookup = async (term: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Defina o termo teológico "${term}" sob uma perspectiva acadêmica e bíblica. Inclua etimologia e importância doutrinária.`,
  });
  return response.text;
};

export const portugueseDictionaryLookup = async (word: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Aja como um dicionário exaustivo da língua portuguesa. Defina a palavra "${word}". 
    Retorne em JSON com as seguintes propriedades:
    - definition: a definição principal.
    - class: classe gramatical (ex: substantivo, verbo).
    - synonyms: lista de sinônimos.
    - antonyms: lista de antônimos.
    - examples: 2 ou 3 frases de exemplo.
    Tudo deve estar em Português do Brasil.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          class: { type: Type.STRING },
          synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["definition", "class"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

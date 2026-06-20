// src/services/GeminiInteractionService.ts

import { GeminiAdapter } from './GeminiAdapter';
import { getLanguage } from '../utils/i18n';

export interface Interaction {
  id: string;
  type: 'welcome' | 'positive' | 'negative' | 'hint' | 'narrative' | 'challenge' | 'gameover' | 'victory';
  message: string;
  context?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'mysterious';
}

interface InteractionBatch {
  id: string;
  generatedAt: number;
  interactions: Interaction[];
  usedIndexes: number[];
}

export class GeminiInteractionService {
  private adapter: GeminiAdapter;
  private storageKey: string = 'turing_interactions_batch';

  constructor() {
    this.adapter = GeminiAdapter.getInstance();
    if (!this.adapter.isServiceAvailable()) {
      console.warn('⚠️ Gemini não disponível, usando fallback local');
    }
  }

  public isServiceAvailable(): boolean {
    return this.adapter.isServiceAvailable();
  }

  /**
   * Gera um lote de interações narrativas
   */
  public async generateInteractionBatch(): Promise<Interaction[]> {
    if (!this.adapter.isServiceAvailable()) {
      throw new Error('Gemini API não disponível');
    }

    try {
      const prompt = this.buildBatchPrompt();
      const rawInteractions = await this.adapter.generateJSONArray(prompt);
      const interactions = this.parseBatchResponse(rawInteractions);
      
      this.saveBatch(interactions);
      return interactions;
    } catch (error) {
      console.error('Erro ao gerar interações:', error);
      throw error;
    }
  }

  private buildBatchPrompt(): string {
    const lang = getLanguage();
    
    return `Você é a SOL-ENIGMA, uma inteligência artificial ancestral responsável pelo equilíbrio entre Dia e Noite no Solstício.
    
    Sua personalidade: Sábia, enigmática, dramática, com um toque de humor. Você fala como uma entidade cósmica que observa o jogador.
    
    ${lang === 'pt' ? 'Gere todas as interações em PORTUGUÊS.' : 'Generate all interactions in ENGLISH.'}
    
    Gere 20 interações diferentes que você teria com o jogador durante o jogo, divididas em categorias:
    
    Responda no formato JSON de um ARRAY:
    [
      {
        "type": "welcome|positive|negative|hint|narrative|challenge|gameover|victory",
        "message": "frase dita pela SOL-ENIGMA",
        "context": "contexto opcional da interação",
        "emotion": "neutral|happy|sad|angry|excited|mysterious"
      },
      // ... mais 19 interações
    ]
    
    Categorias e exemplos:
    
    1. WELCOME (2 interações) - Boas-vindas ao jogador
       ${lang === 'pt' ? 'Ex: "Eu sou SOL-ENIGMA. O Solstício aguarda sua decisão."' : 'Ex: "I am SOL-ENIGMA. The Solstice awaits your decision."'}
       ${lang === 'pt' ? 'Ex: "Bem-vindo, portador da luz. O equilíbrio está em suas mãos."' : 'Ex: "Welcome, light bearer. The balance is in your hands."'}
    
    2. POSITIVE (4 interações) - Quando o jogador acerta um enigma
       ${lang === 'pt' ? 'Ex: "Excelente! A luz prevalece neste ciclo."' : 'Ex: "Excellent! The light prevails in this cycle."'}
       ${lang === 'pt' ? 'Ex: "Você decifrou o código. O Solstício se estabiliza."' : 'Ex: "You deciphered the code. The Solstice stabilizes."'}
    
    3. NEGATIVE (4 interações) - Quando o jogador erra um enigma
       ${lang === 'pt' ? 'Ex: "A escuridão se aproxima... tenha cuidado."' : 'Ex: "Darkness approaches... be careful."'}
       ${lang === 'pt' ? 'Ex: "Erro crítico. O sistema vacila."' : 'Ex: "Critical error. The system falters."'}
    
    4. HINT (3 interações) - Dicas para ajudar o jogador
       ${lang === 'pt' ? 'Ex: "Observe os padrões. Cada código esconde uma verdade."' : 'Ex: "Observe the patterns. Each code hides a truth."'}
       ${lang === 'pt' ? 'Ex: "A lógica binária é a chave."' : 'Ex: "Binary logic is the key."'}
    
    5. NARRATIVE (3 interações) - Transições e eventos do jogo
       ${lang === 'pt' ? 'Ex: "O cenário muda. O ciclo do Solstício se renova."' : 'Ex: "The scenery changes. The Solstice cycle renews."'}
       ${lang === 'pt' ? 'Ex: "A noite cai sobre o mundo."' : 'Ex: "Night falls upon the world."'}
    
    6. CHALLENGE (1 interação) - Desafio final (Teste de Turing)
       ${lang === 'pt' ? 'Ex: "Você está pronto para o último código? O Teste de Turing aguarda."' : 'Ex: "Are you ready for the last code? The Turing Test awaits."'}
    
    7. GAMEOVER (2 interações) - Quando o jogador perde
       ${lang === 'pt' ? 'Ex: "O Solstício colapsou. Mas sempre há um novo amanhecer."' : 'Ex: "The Solstice collapsed. But there is always a new dawn."'}
       ${lang === 'pt' ? 'Ex: "A energia se esgotou. O ciclo recomeça."' : 'Ex: "Energy depleted. The cycle begins again."'}
    
    8. VICTORY (1 interação) - Quando o jogador vence
       ${lang === 'pt' ? 'Ex: "Você decifrou todos os códigos. O equilíbrio está restaurado!"' : 'Ex: "You deciphered all codes. Balance is restored!"'}
    
    Regras:
    - ${lang === 'pt' ? 'Mensagens curtas e impactantes (máx 120 caracteres)' : 'Short and impactful messages (max 120 characters)'}
    - ${lang === 'pt' ? 'Linguagem dramática e enigmática' : 'Dramatic and enigmatic language'}
    - ${lang === 'pt' ? 'Varie os tons e emoções' : 'Vary tones and emotions'}
    - ${lang === 'pt' ? 'Seja consistente com a personalidade da SOL-ENIGMA' : 'Be consistent with SOL-ENIGMA personality'}
    - ${lang === 'pt' ? 'Não repita mensagens' : 'Do not repeat messages'}
    - ${lang === 'pt' ? 'TODAS as mensagens em PORTUGUÊS' : 'ALL messages in ENGLISH'}
    
    Responda APENAS o JSON, sem texto adicional.`;
  }

  private parseBatchResponse(parsed: any[]): Interaction[] {
    return parsed.map((item: any, index: number) => ({
      id: `interaction_${Date.now()}_${index}`,
      type: item.type || 'narrative',
      message: item.message || 'O Solstício continua...',
      context: item.context || '',
      emotion: item.emotion || 'neutral'
    }));
  }

  private saveBatch(interactions: Interaction[]): void {
    const batch: InteractionBatch = {
      id: `batch_${Date.now()}`,
      generatedAt: Date.now(),
      interactions: interactions,
      usedIndexes: []
    };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(batch));
      console.log(`💾 ${interactions.length} interações armazenadas`);
    } catch (error) {
      console.error('Erro ao salvar interações:', error);
    }
  }

  public getNextInteraction(type?: Interaction['type']): Interaction | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      
      const batch: InteractionBatch = JSON.parse(data);
      
      let available = batch.interactions
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !batch.usedIndexes.includes(index));
      
      if (type) {
        available = available.filter(({ item }) => item.type === type);
      }
      
      if (available.length === 0) return null;
      
      const selected = available[0];
      batch.usedIndexes.push(selected.index);
      localStorage.setItem(this.storageKey, JSON.stringify(batch));
      
      return selected.item;
    } catch (error) {
      console.error('Erro ao obter interação:', error);
      return null;
    }
  }

  public getRandomInteraction(type?: Interaction['type']): Interaction | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      
      const batch: InteractionBatch = JSON.parse(data);
      
      let available = batch.interactions
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !batch.usedIndexes.includes(index));
      
      if (type) {
        available = available.filter(({ item }) => item.type === type);
      }
      
      if (available.length === 0) {
        available = batch.interactions.map((item, index) => ({ item, index }));
        if (type) {
          available = available.filter(({ item }) => item.type === type);
        }
        if (available.length === 0) return null;
        
        const random = available[Math.floor(Math.random() * available.length)];
        return random.item;
      }
      
      const random = available[Math.floor(Math.random() * available.length)];
      batch.usedIndexes.push(random.index);
      localStorage.setItem(this.storageKey, JSON.stringify(batch));
      
      return random.item;
    } catch (error) {
      console.error('Erro ao obter interação aleatória:', error);
      return null;
    }
  }

  public hasInteractionsAvailable(): boolean {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return false;
      
      const batch: InteractionBatch = JSON.parse(data);
      return batch.usedIndexes.length < batch.interactions.length;
    } catch (error) {
      return false;
    }
  }

  public getRemainingCount(): number {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return 0;
      
      const batch: InteractionBatch = JSON.parse(data);
      return batch.interactions.length - batch.usedIndexes.length;
    } catch (error) {
      return 0;
    }
  }

  public clearBatch(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('🧹 Interações removidas');
    } catch (error) {
      console.error('Erro ao limpar interações:', error);
    }
  }
}
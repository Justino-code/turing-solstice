// src/services/GeminiEnigmaService.ts

import { Enigma } from '../systems/EnigmaSystem';
import { GeminiAdapter } from './GeminiAdapter';
import { getLanguage } from '../utils/i18n';

interface EnigmaBatch {
  id: string;
  generatedAt: number;
  language: string;
  enigmas: Enigma[];
  usedIndexes: number[];
}

export class GeminiEnigmaService {
  private adapter: GeminiAdapter;
  private batchSize: number = 60;

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
   * Chave de storage por idioma
   */
  private get storageKey(): string {
    const lang = getLanguage();
    return `turing_enigmas_batch_${lang}`;
  }

  /**
   * Gera um lote de enigmas em uma única chamada
   */
  public async generateEnigmaBatch(difficulty: number): Promise<Enigma[]> {
    if (!this.adapter.isServiceAvailable()) {
      throw new Error('Gemini API não disponível');
    }

    try {
      const prompt = this.buildBatchPrompt(difficulty, this.batchSize);
      const rawEnigmas = await this.adapter.generateJSONArray(prompt);
      
      const enigmas = this.parseBatchResponse(rawEnigmas, difficulty);
      this.saveBatch(enigmas);
      
      return enigmas;
    } catch (error) {
      console.error('Erro ao gerar lote de enigmas:', error);
      throw error;
    }
  }

  private buildBatchPrompt(difficulty: number, count: number): string {
    const lang = getLanguage();
    const languageInstruction = lang === 'pt' 
      ? 'Gere todos os enigmas em PORTUGUÊS.' 
      : 'Generate all riddles in ENGLISH.';

    return `${languageInstruction} Gere ${count} enigmas criativos diferentes com dificuldade nível ${difficulty + 1} (de 1 a 5).
    
    Os enigmas podem ser sobre qualquer tema, desde que envolvam:
    - Raciocínio lógico
    - Padrões e sequências
    - Computação ou matemática
    - Criptografia ou decodificação
    
    Responda no formato JSON de um ARRAY:
    [
      {
        "question": "pergunta clara do enigma 1",
        "options": ["opção A", "opção B", "opção C", "opção D"],
        "correctIndex": 0,
        "pattern": "representação visual do enigma 1",
        "type": "nome do tipo de enigma 1",
        "timeLimit": 5,
        "hint": "dica criativa sem dar a resposta",
        "rule": "explicação simples da regra"
      },
      // ... mais ${count - 1} enigmas
    ]
    
    Regras para CADA enigma:
    1. 4 opções de resposta (ou 2 se for binário)
    2. Resposta correta única e clara
    3. Dica deve ajudar sem revelar a resposta
    4. Regra deve explicar a lógica de forma simples
    5. Seja criativo, não se limite a tipos comuns
    6. Padrão deve ser visual e representar o enigma
    7. Se o enigma tiver apenas 2 opções (0/1, sim/não), use apenas 2 opções
    8. A dificuldade deve ser compatível com o nível solicitado
    9. TODOS os enigmas devem ser DIFERENTES entre si
    10. Varie os tipos de enigma (binário, sequência, lógica, criptografia, padrões, etc.)
    ${lang === 'pt' ? '11. TODOS os textos (pergunta, opções, dica, regra) devem estar em PORTUGUÊS' : '11. ALL texts (question, options, hint, rule) must be in ENGLISH'}
    
    Responda APENAS o JSON, sem texto adicional.`;
  }

  private parseBatchResponse(parsed: any[], difficulty: number): Enigma[] {
    return parsed.map((item: any, index: number) => {
      const options = item.options || ['A', 'B', 'C', 'D'];
      const correctIndex = item.correctIndex !== undefined ? item.correctIndex : 0;
      
      return {
        id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`,
        question: item.question || 'Qual é a resposta correta?',
        options: options.slice(0, 4),
        correctIndex: Math.min(correctIndex, options.length - 1),
        pattern: item.pattern || '◆ ◇ ◆ ◇',
        type: item.type || 'enigma',
        difficulty: difficulty,
        timeLimit: item.timeLimit || 5,
        hint: item.hint || '💡 Pense com calma',
        rule: item.rule || '📖 Use a lógica'
      };
    });
  }

  /**
   * Salva o lote no localStorage
   */
  private saveBatch(enigmas: Enigma[]): void {
    const batch: EnigmaBatch = {
      id: `batch_${Date.now()}`,
      generatedAt: Date.now(),
      language: getLanguage(),
      enigmas: enigmas,
      usedIndexes: []
    };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(batch));
      console.log(`💾 ${enigmas.length} enigmas armazenados no localStorage (${getLanguage()})`);
    } catch (error) {
      console.warn('⚠️ localStorage cheio, limpando lotes antigos...');
      this.clearAllBatches();
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(batch));
        console.log(`💾 ${enigmas.length} enigmas armazenados após limpeza`);
      } catch (e) {
        console.error('❌ localStorage cheio! Não foi possível salvar.');
      }
    }
  }

  /**
   * Obtém o próximo enigma do lote armazenado
   */
  public getNextEnigmaFromBatch(): Enigma | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      
      const batch: EnigmaBatch = JSON.parse(data);
      
      // Verifica se o idioma do lote coincide com o atual
      if (batch.language !== getLanguage()) {
        console.log('🔄 Idioma diferente, ignorando lote antigo');
        return null;
      }
      
      for (let i = 0; i < batch.enigmas.length; i++) {
        if (!batch.usedIndexes.includes(i)) {
          batch.usedIndexes.push(i);
          localStorage.setItem(this.storageKey, JSON.stringify(batch));
          return batch.enigmas[i];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter enigma do lote:', error);
      return null;
    }
  }

  /**
   * Verifica se há enigmas disponíveis no lote
   */
  public hasEnigmasAvailable(): boolean {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return false;
      
      const batch: EnigmaBatch = JSON.parse(data);
      
      // Verifica idioma
      if (batch.language !== getLanguage()) return false;
      
      return batch.usedIndexes.length < batch.enigmas.length;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém o número de enigmas restantes
   */
  public getRemainingCount(): number {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return 0;
      
      const batch: EnigmaBatch = JSON.parse(data);
      
      if (batch.language !== getLanguage()) return 0;
      
      return batch.enigmas.length - batch.usedIndexes.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Limpa o lote do idioma atual
   */
  public clearBatch(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log(`🧹 Lote de enigmas removido (${getLanguage()})`);
    } catch (error) {
      console.error('Erro ao limpar lote:', error);
    }
  }

  /**
   * Limpa todos os lotes de todos os idiomas
   */
  private clearAllBatches(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('turing_enigmas_batch_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Todos os lotes de enigmas removidos');
  }
}
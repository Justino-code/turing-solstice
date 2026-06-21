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

  private get storageKey(): string {
    const lang = getLanguage();
    return `turing_enigmas_batch_${lang}`;
  }

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
    
    Regras IMPORTANTES para CADA enigma:
    1. 4 opções de resposta (ou 2 se for binário)
    2. A resposta correta deve ser RANDÔMICA, não sempre a primeira opção
    3. Dica deve ajudar sem revelar a resposta
    4. Regra deve explicar a lógica de forma simples
    5. Seja criativo, não se limite a tipos comuns
    6. Padrão deve ser visual e representar o enigma
    7. Se o enigma tiver apenas 2 opções (0/1, sim/não), use apenas 2 opções
    8. A dificuldade deve ser compatível com o nível solicitado
    9. TODOS os enigmas devem ser DIFERENTES entre si
    10. Varie os tipos de enigma (binário, sequência, lógica, criptografia, padrões, etc.)
    11. IMPORTANTE: o correctIndex deve ser RANDÔMICO entre 0 e 3 (ou 0 e 1 para 2 opções)
    12. NÃO coloque a resposta correta sempre na mesma posição
    13. Varie a posição da resposta correta ao longo dos enigmas
    
    ${lang === 'pt' ? '14. TODOS os textos (pergunta, opções, dica, regra) devem estar em PORTUGUÊS' : '14. ALL texts (question, options, hint, rule) must be in ENGLISH'}
    
    Responda APENAS o JSON, sem texto adicional.`;
  }

  private parseBatchResponse(parsed: any[], difficulty: number): Enigma[] {
    return parsed.map((item: any, index: number) => {
      const options = item.options || ['A', 'B', 'C', 'D'];
      let correctIndex = item.correctIndex !== undefined ? item.correctIndex : 0;
      
      // Garante que o correctIndex esteja dentro dos limites
      if (correctIndex >= options.length) {
        correctIndex = options.length - 1;
      }
      if (correctIndex < 0) {
        correctIndex = 0;
      }
      
      // Se o enigma veio sem correctIndex ou com valor inválido, gera aleatório
      if (item.correctIndex === undefined || item.correctIndex === null) {
        correctIndex = Math.floor(Math.random() * options.length);
      }
      
      return {
        id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`,
        question: item.question || 'Qual é a resposta correta?',
        options: options.slice(0, 4),
        correctIndex: correctIndex,
        pattern: item.pattern || '◆ ◇ ◆ ◇',
        type: item.type || 'enigma',
        difficulty: difficulty,
        timeLimit: item.timeLimit || 5,
        hint: item.hint || '💡 Pense com calma',
        rule: item.rule || '📖 Use a lógica'
      };
    });
  }

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

  public getNextEnigmaFromBatch(): Enigma | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      
      const batch: EnigmaBatch = JSON.parse(data);
      
      if (batch.language !== getLanguage()) {
        console.log('🔄 Idioma diferente, ignorando lote antigo');
        return null;
      }
      
      // Embaralha os índices não usados para maior variedade
      const availableIndexes = batch.enigmas
        .map((_, i) => i)
        .filter(i => !batch.usedIndexes.includes(i));
      
      if (availableIndexes.length === 0) {
        // Reinicia se todos foram usados
        console.log('🔄 Todos os enigmas usados, reiniciando lote');
        batch.usedIndexes = [];
        localStorage.setItem(this.storageKey, JSON.stringify(batch));
        return batch.enigmas[0];
      }
      
      // Pega um índice aleatório dos disponíveis
      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      batch.usedIndexes.push(randomIndex);
      localStorage.setItem(this.storageKey, JSON.stringify(batch));
      
      return batch.enigmas[randomIndex];
    } catch (error) {
      console.error('Erro ao obter enigma do lote:', error);
      return null;
    }
  }

  public hasEnigmasAvailable(): boolean {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return false;
      
      const batch: EnigmaBatch = JSON.parse(data);
      
      if (batch.language !== getLanguage()) return false;
      
      return batch.usedIndexes.length < batch.enigmas.length;
    } catch (error) {
      return false;
    }
  }

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

  public clearBatch(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log(`🧹 Lote de enigmas removido (${getLanguage()})`);
    } catch (error) {
      console.error('Erro ao limpar lote:', error);
    }
  }

  private clearAllBatches(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('turing_enigmas_batch_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Todos os lotes de enigmas removidos');
  }

  // ===== MÉTODO DE TESTE =====
  public async testEnigmaGeneration(difficulty: number = 0): Promise<void> {
    console.log('🧪 Testando geração de enigmas...');
    try {
      const enigmas = await this.generateEnigmaBatch(difficulty);
      console.log(`✅ ${enigmas.length} enigmas gerados:`);
      enigmas.forEach((e, i) => {
        console.log(`  ${i + 1}. "${e.question}" → Resposta correta: ${e.options[e.correctIndex]} (${e.correctIndex})`);
      });
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
}
// src/systems/InteractionSystem.ts

import { Interaction } from '../services/GeminiInteractionService';
import { GeminiInteractionService } from '../services/GeminiInteractionService';
import { LocalInteractionService } from '../services/LocalInteractionService';

export class InteractionSystem {
  private geminiService: GeminiInteractionService;
  private localService: LocalInteractionService;
  private useGemini: boolean = false;
  private isGenerating: boolean = false;

  constructor(geminiApiKey?: string) {
    this.geminiService = new GeminiInteractionService();
    this.localService = new LocalInteractionService();
    
    if (this.geminiService.isServiceAvailable()) {
      this.useGemini = true;
      console.log('🤖 Gemini Interactions ativado!');
      
      // Verifica se já há interações no storage
      if (!this.geminiService.hasInteractionsAvailable()) {
        this.generateBatch();
      }
    } else {
      console.log('📦 Usando interações locais');
    }
  }

  public async generateBatch(): Promise<void> {
    if (this.isGenerating || !this.useGemini) return;
    
    this.isGenerating = true;
    
    try {
      console.log('🔄 Gerando interações com Gemini...');
      await this.geminiService.generateInteractionBatch();
      const remaining = this.geminiService.getRemainingCount();
      console.log(`✅ ${remaining} interações disponíveis`);
    } catch (error) {
      console.error('Erro ao gerar interações:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  public getInteraction(type?: Interaction['type']): Interaction | null {
    // Tenta Gemini primeiro
    if (this.useGemini && this.geminiService.isServiceAvailable()) {
      let interaction = this.geminiService.getNextInteraction(type);
      
      // Se não há interações disponíveis, gera mais
      if (!interaction && this.geminiService.hasInteractionsAvailable()) {
        // Tenta pegar aleatório
        interaction = this.geminiService.getRandomInteraction(type);
      }
      
      // Se ainda não tem, tenta gerar novo lote
      if (!interaction) {
        console.log('🔄 Gerando novo lote de interações...');
        this.generateBatch();
        interaction = this.geminiService.getNextInteraction(type);
      }
      
      if (interaction) {
        console.log(`🤖 Gemini: ${interaction.message}`);
        return interaction;
      }
    }
    
    // Fallback para local
    console.log('📦 Local: usando fallback');
    return this.localService.getInteraction(type);
  }

  public getRandomInteraction(type?: Interaction['type']): Interaction | null {
    // Tenta Gemini primeiro
    if (this.useGemini && this.geminiService.isServiceAvailable()) {
      let interaction = this.geminiService.getRandomInteraction(type);
      
      if (!interaction) {
        // Se não tem, tenta gerar novo lote
        this.generateBatch();
        interaction = this.geminiService.getRandomInteraction(type);
      }
      
      if (interaction) {
        console.log(`🤖 Gemini: ${interaction.message}`);
        return interaction;
      }
    }
    
    // Fallback para local
    console.log('📦 Local: usando fallback');
    return this.localService.getRandomInteraction(type);
  }

  public getWelcome(): Interaction | null {
    return this.getRandomInteraction('welcome');
  }

  public getPositive(): Interaction | null {
    return this.getRandomInteraction('positive');
  }

  public getNegative(): Interaction | null {
    return this.getRandomInteraction('negative');
  }

  public getHint(): Interaction | null {
    return this.getRandomInteraction('hint');
  }

  public getNarrative(): Interaction | null {
    return this.getRandomInteraction('narrative');
  }

  public getChallenge(): Interaction | null {
    return this.getRandomInteraction('challenge');
  }

  public getGameOver(): Interaction | null {
    return this.getRandomInteraction('gameover');
  }

  public getVictory(): Interaction | null {
    return this.getRandomInteraction('victory');
  }

  public getRemainingCount(): number {
    if (this.useGemini && this.geminiService.isServiceAvailable()) {
      return this.geminiService.getRemainingCount();
    }
    return this.localService.getRemainingCount();
  }

  public setUseGemini(use: boolean): void {
    this.useGemini = use && this.geminiService.isServiceAvailable();
  }

  public reset(): void {
    this.localService.reset();
    if (this.useGemini && this.geminiService.isServiceAvailable()) {
      this.geminiService.clearBatch();
    }
  }
}
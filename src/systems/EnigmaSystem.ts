// src/systems/EnigmaSystem.ts

import { LocalEnigmaService } from '../services/LocalEnigmaService';
import { GeminiEnigmaService } from '../services/GeminiEnigmaService';
import { TuringTestService } from '../services/TuringTestService';

export interface Enigma {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  pattern: string;
  type: string;
  difficulty: number;
  timeLimit: number;
  hint: string;
  rule: string;
}

export class EnigmaSystem {
  private currentEnigma: Enigma | null = null;
  private isActive: boolean = false;
  private isAnswered: boolean = false;
  private timeRemaining: number = 0;
  private timerInterval: number | null = null;
  
  private localService: LocalEnigmaService;
  private geminiService: GeminiEnigmaService;
  private turingTestService: TuringTestService;
  private useGemini: boolean = false;
  private isGeneratingBatch: boolean = false;
  private enigmaSource: 'local' | 'gemini' | 'turing' | 'fallback' = 'local';

  private onEnigmaStart: ((enigma: Enigma) => void) | null = null;
  private onEnigmaAnswer: ((correct: boolean) => void) | null = null;
  private onEnigmaTimeout: (() => void) | null = null;
  private onBatchGeneratedCallback: ((count: number) => void) | null = null;

  constructor() {
    this.localService = new LocalEnigmaService();
    this.geminiService = new GeminiEnigmaService();
    this.turingTestService = new TuringTestService();
    this.currentEnigma = null;
    this.isActive = false;
    this.isAnswered = false;
    this.timeRemaining = 0;
    
    if (this.geminiService.isServiceAvailable()) {
      this.useGemini = true;
      console.log('🤖 Gemini ativado!');
      
      if (this.geminiService.hasEnigmasAvailable()) {
        const remaining = this.geminiService.getRemainingCount();
        console.log(`📦 ${remaining} enigmas disponíveis no storage`);
      } else {
        this.generateBatch(0);
      }
    } else {
      console.log('📦 Usando enigmas locais (Gemini indisponível)');
    }
  }

  public async generateBatch(difficulty: number): Promise<void> {
    if (this.isGeneratingBatch || !this.useGemini) return;
    
    this.isGeneratingBatch = true;
    
    try {
      console.log('🔄 Solicitando 60 enigmas ao Gemini...');
      await this.geminiService.generateEnigmaBatch(difficulty);
      const remaining = this.geminiService.getRemainingCount();
      console.log(`✅ Gemini: ${remaining} enigmas disponíveis`);
      
      if (this.onBatchGeneratedCallback) {
        this.onBatchGeneratedCallback(remaining);
      }
    } catch (error) {
      console.warn('⚠️ Gemini falhou, usando fallback local');
      this.useGemini = false;
    } finally {
      this.isGeneratingBatch = false;
    }
  }

  public setUseGemini(use: boolean): void {
    this.useGemini = use && this.geminiService.isServiceAvailable();
  }

  public async startEnigma(difficulty: number): Promise<Enigma> {
    try {
      let enigma: Enigma | null = null;
      this.enigmaSource = 'local';
      
      if (this.useGemini && this.geminiService.isServiceAvailable()) {
        enigma = this.geminiService.getNextEnigmaFromBatch();
        
        if (enigma) {
          this.enigmaSource = 'gemini';
          console.log(`🤖 Gemini: enigma ${this.geminiService.getRemainingCount() + 1} restantes`);
        } else {
          console.log('🔄 Lote vazio, gerando novos enigmas...');
          try {
            await this.geminiService.generateEnigmaBatch(difficulty);
            enigma = this.geminiService.getNextEnigmaFromBatch();
            if (enigma) {
              this.enigmaSource = 'gemini';
              console.log(`🤖 Gemini: novo lote gerado`);
            }
          } catch (error) {
            console.warn('⚠️ Falha ao gerar lote Gemini, usando fallback local');
          }
        }
      }
      
      if (!enigma) {
        this.enigmaSource = 'local';
        enigma = this.localService.generateEnigma(difficulty);
        console.log(`📦 Local: enigma gerado (fallback)`);
      }
      
      if (!enigma) {
        enigma = this.localService.generateEnigma(0);
        this.enigmaSource = 'local';
        console.log(`📦 Local: enigma de emergência`);
      }
      
      const sourceLabel = this.enigmaSource === 'gemini' ? '🤖 Gemini' : '📦 Local';
      console.log(`📜 Enigma ${sourceLabel}: ${enigma.type} - ${enigma.pattern}`);
      
      this.currentEnigma = enigma;
      this.isActive = true;
      this.isAnswered = false;
      this.timeRemaining = enigma.timeLimit;
      
      if (this.onEnigmaStart) {
        this.onEnigmaStart(enigma);
      }
      
      this.startTimer();
      
      return enigma;
    } catch (error) {
      console.error('❌ Erro ao gerar enigma:', error);
      const fallback = this.localService.generateEnigma(0);
      this.enigmaSource = 'local';
      this.currentEnigma = fallback;
      this.isActive = true;
      this.isAnswered = false;
      this.timeRemaining = fallback.timeLimit;
      
      console.log(`📦 Local: enigma de emergência (fallback)`);
      
      if (this.onEnigmaStart) {
        this.onEnigmaStart(fallback);
      }
      
      this.startTimer();
      return fallback;
    }
  }

  /**
   * Inicia a Máquina Enigma (Fase 1 do Último Código) - SEM TIMER
   */
  public async startEnigmaMachine(): Promise<Enigma> {
    const enigma = await this.turingTestService.generateEnigmaMachine();
    
    this.enigmaSource = 'turing';
    this.currentEnigma = enigma;
    this.isActive = true;
    this.isAnswered = false;
    this.timeRemaining = enigma.timeLimit;
    
    if (this.onEnigmaStart) {
      this.onEnigmaStart(enigma);
    }
    
    console.log('🔐 ENIGMA MACHINE iniciada (sem tempo limite)!');
    return enigma;
  }

  /**
   * Inicia o Teste de Turing (Fase 2 do Último Código) - SEM TIMER
   */
  public async startTuringTest(): Promise<Enigma> {
    const enigma = await this.turingTestService.generateTuringTest();
    
    this.enigmaSource = 'turing';
    this.currentEnigma = enigma;
    this.isActive = true;
    this.isAnswered = false;
    this.timeRemaining = enigma.timeLimit;
    
    if (this.onEnigmaStart) {
      this.onEnigmaStart(enigma);
    }
    
    console.log('🔐 TURING TEST iniciado (sem tempo limite)!');
    return enigma;
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = window.setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.handleTimeout();
      }
    }, 1000);
  }

  public answerEnigma(selectedIndex: number): boolean {
    if (!this.isActive || this.isAnswered || !this.currentEnigma) {
      return false;
    }
    
    this.isAnswered = true;
    const isCorrect = selectedIndex === this.currentEnigma.correctIndex;
    
    const sourceLabel = this.enigmaSource === 'gemini' ? '🤖 Gemini' : this.enigmaSource === 'turing' ? '🔐 Turing' : '📦 Local';
    console.log(`📝 Resposta ${sourceLabel}: ${isCorrect ? '✅ CORRETA' : '❌ ERRADA'}`);
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    if (this.onEnigmaAnswer) {
      this.onEnigmaAnswer(isCorrect);
    }
    
    this.isActive = false;
    return isCorrect;
  }

  private handleTimeout(): void {
    if (this.isAnswered) return;
    
    this.isAnswered = true;
    this.isActive = false;
    
    const sourceLabel = this.enigmaSource === 'gemini' ? '🤖 Gemini' : this.enigmaSource === 'turing' ? '🔐 Turing' : '📦 Local';
    console.log(`⏰ Timeout ${sourceLabel}`);
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    if (this.onEnigmaTimeout) {
      this.onEnigmaTimeout();
    }
  }

  public updateCurrentEnigma(enigma: Enigma): void {
    this.currentEnigma = enigma;
    if (this.isActive) {
      this.timeRemaining = enigma.timeLimit;
    }
  }

  public getCurrentEnigma(): Enigma | null { return this.currentEnigma; }
  public isEnigmaActive(): boolean { return this.isActive; }
  public isEnigmaAnswered(): boolean { return this.isAnswered; }
  public getTimeRemaining(): number { return this.timeRemaining; }

  public getRemainingEnigmas(): number {
    if (this.useGemini && this.geminiService.isServiceAvailable()) {
      return this.geminiService.getRemainingCount();
    }
    return 0;
  }

  public getEnigmaSource(): 'local' | 'gemini' | 'turing' | 'fallback' { return this.enigmaSource; }

  public reset(): void {
    this.currentEnigma = null;
    this.isActive = false;
    this.isAnswered = false;
    this.timeRemaining = 0;
    this.enigmaSource = 'local';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public onStart(callback: (enigma: Enigma) => void): void { this.onEnigmaStart = callback; }
  public onAnswer(callback: (correct: boolean) => void): void { this.onEnigmaAnswer = callback; }
  public onTimeout(callback: () => void): void { this.onEnigmaTimeout = callback; }
  public onBatchGenerated(callback: (count: number) => void): void { this.onBatchGeneratedCallback = callback; }
}
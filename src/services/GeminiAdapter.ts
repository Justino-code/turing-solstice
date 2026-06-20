// src/services/GeminiAdapter.ts

import { GEMINI } from '@/constants/env';
import { GoogleGenAI } from '@google/genai';

export class GeminiAdapter {
  private static instance: GeminiAdapter | null = null;
  private genAI: GoogleGenAI | null = null;
  private isAvailable: boolean = false;
  private model: string | null = null;

  private constructor() {
    const apiKey = GEMINI.API_KEY;
    this.model = GEMINI.MODEL;
    
    if (!apiKey) {
      console.warn('⚠️ Gemini API key não encontrada');
      return;
    }

    try {
      this.genAI = new GoogleGenAI({ apiKey });
      this.isAvailable = true;
      console.log('🤖 Gemini Adapter inicializado!');
      console.log(`   Modelo: ${this.model}`);
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini:', error);
      this.isAvailable = false;
      this.genAI = null;
    }
  }

  public static getInstance(): GeminiAdapter {
    if (!GeminiAdapter.instance) {
      GeminiAdapter.instance = new GeminiAdapter();
    }
    return GeminiAdapter.instance;
  }

  public isServiceAvailable(): boolean {
    return this.isAvailable && this.genAI !== null;
  }

  public async generateContent(prompt: string): Promise<string> {
    if (!this.isServiceAvailable() || !this.genAI) {
      throw new Error('Gemini não disponível');
    }

    const response = await this.genAI.models.generateContent({
      model: this.model!,
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('Resposta vazia');
    return text;
  }

  public async generateJSONArray<T>(prompt: string): Promise<T[]> {
    const text = await this.generateContent(prompt);
    
    // Tenta extrair o array JSON
    let match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      // Tenta encontrar qualquer JSON
      match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Resposta sem JSON:', text.substring(0, 200));
        throw new Error('Resposta sem JSON');
      }
      // Se for um objeto, tenta converter para array
      try {
        const obj = JSON.parse(match[0]);
        if (Array.isArray(obj)) {
          return obj;
        }
        // Se for um objeto com propriedade que é array
        for (const key of Object.keys(obj)) {
          if (Array.isArray(obj[key])) {
            return obj[key];
          }
        }
        throw new Error('Não foi possível extrair array do JSON');
      } catch (e) {
        throw new Error('Resposta não é um array');
      }
    }
    
    const jsonStr = match[0];
    
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      // Tenta limpar o JSON
      const cleaned = this.cleanJSON(jsonStr);
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('Erro ao parsear JSON:', error);
        console.error('Texto original:', jsonStr.substring(0, 300));
        console.error('Texto limpo:', cleaned.substring(0, 300));
        throw new Error('JSON inválido');
      }
    }
  }

  /**
   * Tenta limpar um JSON mal formatado
   */
  private cleanJSON(str: string): string {
    // Remove comentários
    str = str.replace(/\/\/.*$/gm, '');
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove vírgulas extras antes de } ou ]
    str = str.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove vírgulas extras no início de linhas
    str = str.replace(/,\s*,/g, ',');
    
    // Adiciona aspas em propriedades sem aspas
    str = str.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    
    // Remove caracteres de controle
    str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return str;
  }
}
// src/services/GeminiAdapter.ts

import { GEMINI } from '@/constants/env';

export class GeminiAdapter {
  private static instance: GeminiAdapter | null = null;
  private isAvailable: boolean = false;
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = GEMINI.API_KEY;
    this.model = GEMINI.MODEL;
    this.baseUrl = GEMINI.BASE_URL;
    
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API key não encontrada');
      return;
    }

    this.isAvailable = true;
    console.log('🤖 Gemini Adapter inicializado!');
    console.log(`   Modelo: ${this.model}`);
    console.log(`   URL: ${this.baseUrl}`);
  }

  public static getInstance(): GeminiAdapter {
    if (!GeminiAdapter.instance) {
      GeminiAdapter.instance = new GeminiAdapter();
    }
    return GeminiAdapter.instance;
  }

  public isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  public async generateContent(prompt: string): Promise<string> {
    if (!this.isServiceAvailable()) {
      throw new Error('Gemini não disponível');
    }

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error('Resposta vazia');
    return text;
  }

  public async generateJSONArray<T>(prompt: string): Promise<T[]> {
    const text = await this.generateContent(prompt);
    
    let match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Resposta sem JSON:', text.substring(0, 200));
        throw new Error('Resposta sem JSON');
      }
      try {
        const obj = JSON.parse(match[0]);
        if (Array.isArray(obj)) return obj;
        for (const key of Object.keys(obj)) {
          if (Array.isArray(obj[key])) return obj[key];
        }
        throw new Error('Não foi possível extrair array');
      } catch (e) {
        throw new Error('Resposta não é um array');
      }
    }
    
    let jsonStr = this.fixTruncatedJSON(match[0]);
    
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      const cleaned = this.cleanJSON(jsonStr);
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('JSON inválido');
        throw new Error('JSON inválido');
      }
    }
  }

  private fixTruncatedJSON(str: string): string {
    let depth = 0;
    let lastValidEnd = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (escapeNext) { escapeNext = false; continue; }
      if (char === '\\') { escapeNext = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (char === '{' || char === '[') depth++;
      if (char === '}' || char === ']') { depth--; if (depth === 0) lastValidEnd = i; }
    }
    
    if (lastValidEnd > 0) {
      str = str.substring(0, lastValidEnd + 1);
      str = str.replace(/,\s*$/, '');
      if (str.trim().startsWith('[') && !str.trim().endsWith(']')) str += ']';
    }
    return str;
  }

  private cleanJSON(str: string): string {
    str = str.replace(/\/\/.*$/gm, '');
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');
    str = str.replace(/,(\s*[}\]])/g, '$1');
    str = str.replace(/,\s*,/g, ',');
    str = str.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    return str;
  }
}
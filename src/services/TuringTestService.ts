// src/services/TuringTestService.ts
// Serviço para gerar o Último Código (Enigma Machine + Turing Test)

import { Enigma } from '../systems/EnigmaSystem';
import { GeminiAdapter } from './GeminiAdapter';
import { getLanguage } from '../utils/i18n';

export class TuringTestService {
  private adapter: GeminiAdapter;
  private useGemini: boolean = false;

  constructor() {
    this.adapter = GeminiAdapter.getInstance();
    this.useGemini = this.adapter.isServiceAvailable();
  }

  // ===== FASE 1: MÁQUINA ENIGMA =====

  /**
   * Gera o enigma da Máquina Enigma (criptografia)
   */
  public async generateEnigmaMachine(): Promise<Enigma> {
    if (this.useGemini) {
      try {
        return await this.generateEnigmaWithGemini();
      } catch (error) {
        console.warn('⚠️ Gemini falhou na Enigma, usando local');
        return this.generateEnigmaLocal();
      }
    }
    return this.generateEnigmaLocal();
  }

  private async generateEnigmaWithGemini(): Promise<Enigma> {
    const lang = getLanguage();
    
    const prompt = `Você é a MÁQUINA ENIGMA, inspirada na máquina de criptografia que Alan Turing ajudou a quebrar em Bletchley Park.
    
    ${lang === 'pt' ? 'Gere em PORTUGUÊS.' : 'Generate in ENGLISH.'}
    
    Crie uma mensagem criptografada por substituição simples de caracteres, e 3 opções para o jogador escolher a mensagem correta decifrada.
    
    Exemplo de criptografia: cada letra é substituída por outra (A=M, B=N, C=O...)
    Mensagem original: "TURING"
    Mensagem criptografada: "FGHVAT"
    
    Use uma mensagem sobre Alan Turing, computação ou o Solstício.
    
    Responda APENAS no formato JSON de array com 1 elemento:
    [{
      "pattern": "mensagem criptografada aqui",
      "question": "Qual é a mensagem decifrada?",
      "options": ["mensagem correta", "mensagem errada 1", "mensagem errada 2"],
      "hint": "Cada letra foi substituída por outra...",
      "rule": "Substituição de caracteres"
    }]`;

    const result = await this.adapter.generateJSONArray<{
      pattern: string;
      question: string;
      options: string[];
      hint: string;
      rule: string;
    }>(prompt);
    
    const data = result[0] || result;
    
    return {
      id: 'enigma-machine',
      question: data.question || 'Qual é a mensagem decifrada?',
      options: data.options || ['?', '?', '?'],
      correctIndex: 0,
      pattern: data.pattern || '???',
      type: 'enigma',
      difficulty: 10,
      timeLimit: 9999,
      hint: data.hint || 'Cada letra foi substituída por outra',
      rule: data.rule || 'Substituição de caracteres'
    };
  }

  private generateEnigmaLocal(): Enigma {
    const lang = getLanguage();
    const isPt = lang === 'pt';
    
    // Cifra de César simples (shift de 13 - ROT13)
    const encrypt = (text: string): string => {
      return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + 13) % 26) + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + 13) % 26) + 97);
        return char;
      }).join('');
    };
    
    const original = isPt ? 'TURING' : 'TURING';
    const encrypted = encrypt(original);
    
    return {
      id: 'enigma-machine',
      question: isPt ? 'Qual é a mensagem decifrada?' : 'What is the decrypted message?',
      options: [original, 'ALAN', 'ENIGMA'],
      correctIndex: 0,
      pattern: encrypted,
      type: 'enigma',
      difficulty: 10,
      timeLimit: 9999,
      hint: isPt ? 'Cada letra foi substituída por outra 13 posições à frente' : 'Each letter was replaced by another 13 positions ahead',
      rule: 'ROT13'
    };
  }

  // ===== FASE 2: TESTE DE TURING =====

  /**
   * Gera o Teste de Turing (conversa IA vs Humano)
   */
  public async generateTuringTest(): Promise<Enigma> {
    if (this.useGemini) {
      try {
        return await this.generateTuringWithGemini();
      } catch (error) {
        console.warn('⚠️ Gemini falhou no Turing Test, usando local');
        return this.generateTuringLocal();
      }
    }
    return this.generateTuringLocal();
  }

  private async generateTuringWithGemini(): Promise<Enigma> {
    const lang = getLanguage();
    
    const prompt = `Você é a SOL-ENIGMA. Crie o Teste de Turing final.
    
    ${lang === 'pt' ? 'Gere em PORTUGUÊS.' : 'Generate in ENGLISH.'}
    
    Um interrogador fez a mesma pergunta para duas entidades:
    "${lang === 'pt' ? 'O que é o Solstício para você?' : 'What is the Solstice to you?'}"
    
    Gere 2 respostas:
    - Entidade A: resposta de uma INTELIGÊNCIA ARTIFICIAL (técnica, lógica, binária)
    - Entidade B: resposta de um HUMANO (emocional, filosófica, poética)
    
    O jogador deve identificar qual é a IA (Entidade A).
    
    Responda APENAS no formato JSON de array com 1 elemento:
    [{
      "pattern": "Entidade A: (resposta da IA)\\n\\nEntidade B: (resposta humana)",
      "question": "Qual entidade é a inteligência artificial?",
      "options": ["Entidade A", "Entidade B"],
      "hint": "Procure por padrões lógicos e linguagem técnica...",
      "rule": "Teste de Turing"
    }]`;

    const result = await this.adapter.generateJSONArray<{
      pattern: string;
      question: string;
      options: string[];
      hint: string;
      rule: string;
    }>(prompt);
    
    const data = result[0] || result;
    
    return {
      id: 'turing-test',
      question: data.question || 'Qual entidade é a IA?',
      options: data.options || ['Entidade A', 'Entidade B'],
      correctIndex: -1,
      pattern: data.pattern || 'Entidade A: ...\n\nEntidade B: ...',
      type: 'turing',
      difficulty: 10,
      timeLimit: 999,
      hint: data.hint || 'Procure por padrões lógicos',
      rule: data.rule || 'Teste de Turing'
    };
  }

  private generateTuringLocal(): Enigma {
    const lang = getLanguage();
    const isPt = lang === 'pt';
    
    return {
      id: 'turing-test',
      question: isPt ? 'Qual entidade é a inteligência artificial?' : 'Which entity is the artificial intelligence?',
      options: ['Entidade A', 'Entidade B'],
      correctIndex: -1,
      pattern: isPt 
        ? 'Entidade A: "O Solstício é um evento astronômico onde o Sol atinge sua declinação máxima de +23.5° ou -23.5° em relação ao equador celeste, resultando no dia mais longo ou mais curto do ano. Este fenômeno ocorre devido à inclinação axial da Terra de 23.5 graus."\n\nEntidade B: "O Solstício... é quando o Sol parece parar no céu, como se estivesse contemplando o mundo. É um momento mágico onde a luz e a escuridão dançam juntas, e eu sinto que tudo é possível. A natureza nos mostra que até o Sol precisa descansar."'
        : 'Entity A: "The Solstice is an astronomical event where the Sun reaches its maximum declination of +23.5° or -23.5° relative to the celestial equator, resulting in the longest or shortest day of the year. This phenomenon occurs due to Earth\'s axial tilt of 23.5 degrees."\n\nEntity B: "The Solstice... it\'s when the Sun seems to stop in the sky, as if contemplating the world. It\'s a magical moment where light and darkness dance together, and I feel anything is possible. Nature shows us that even the Sun needs to rest."',
      type: 'turing',
      difficulty: 10,
      timeLimit: 999,
      hint: isPt ? '🔐 Procure por padrões lógicos e linguagem técnica...' : '🔐 Look for logical patterns and technical language...',
      rule: 'Teste de Turing'
    };
  }

  public isAvailable(): boolean {
    return true;
  }
}
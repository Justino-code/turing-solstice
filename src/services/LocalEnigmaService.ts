// src/services/LocalEnigmaService.ts

import { Enigma } from '../systems/EnigmaSystem';
import { getLanguage } from '../utils/i18n';

export class LocalEnigmaService {
  // Dicas genéricas por tipo
  private readonly typeHints: Record<string, { pt: string; en: string }> = {
    'binary': {
      pt: '💡 Observe a sequência de 0s e 1s',
      en: '💡 Observe the sequence of 0s and 1s'
    },
    'sequence': {
      pt: '💡 Encontre o padrão entre os números',
      en: '💡 Find the pattern between the numbers'
    },
    'logic': {
      pt: '💡 Aplique a operação matemática',
      en: '💡 Apply the mathematical operation'
    },
    'crypto': {
      pt: '💡 Decodifique a mensagem binária',
      en: '💡 Decode the binary message'
    }
  };

  private readonly typeRules: Record<string, { pt: string; en: string }> = {
    'binary': {
      pt: '📖 Regra: Alternância ou paridade binária',
      en: '📖 Rule: Binary alternation or parity'
    },
    'sequence': {
      pt: '📖 Regra: Progressão aritmética',
      en: '📖 Rule: Arithmetic progression'
    },
    'logic': {
      pt: '📖 Regra: Operação matemática',
      en: '📖 Rule: Mathematical operation'
    },
    'crypto': {
      pt: '📖 Regra: Cada 8 bits = 1 byte',
      en: '📖 Rule: Each 8 bits = 1 byte'
    }
  };

  private getHint(type: string): string {
    const hint = this.typeHints[type];
    return hint ? (hint[getLanguage()] || hint.pt) : '';
  }

  private getRule(type: string): string {
    const rule = this.typeRules[type];
    return rule ? (rule[getLanguage()] || rule.pt) : '';
  }

  public generateEnigma(difficulty: number): Enigma {
    const types: ('binary' | 'sequence' | 'logic' | 'crypto')[] = ['binary', 'sequence', 'logic', 'crypto'];
    const maxTypeIndex = Math.min(Math.floor(difficulty / 2), types.length - 1);
    const type = types[Math.floor(Math.random() * (maxTypeIndex + 1))];
    
    switch (type) {
      case 'binary':
        return this.generateBinaryEnigma(difficulty);
      case 'sequence':
        return this.generateSequenceEnigma(difficulty);
      case 'logic':
        return this.generateLogicEnigma(difficulty);
      case 'crypto':
        return this.generateCryptoEnigma(difficulty);
      default:
        return this.generateBinaryEnigma(difficulty);
    }
  }

  private generateBinaryEnigma(difficulty: number): Enigma {
    const lang = getLanguage();
    let bits: number[];
    let correct: number;
    
    if (difficulty < 3) {
      const length = 4 + Math.floor(difficulty / 2);
      bits = [];
      const start = Math.random() > 0.5 ? 0 : 1;
      for (let i = 0; i < length; i++) {
        bits.push((start + i) % 2);
      }
      correct = bits[bits.length - 1] === 0 ? 1 : 0;
    } else {
      const length = 4 + Math.floor(difficulty / 2);
      bits = [];
      for (let i = 0; i < length; i++) {
        bits.push(Math.random() > 0.5 ? 1 : 0);
      }
      const sum = bits.reduce((a, b) => a + b, 0);
      correct = sum % 2 === 0 ? 0 : 1;
    }
    
    const options = ['0', '1'];
    const correctIndex = options.indexOf(correct.toString());
    
    return {
      id: `binary_${Date.now()}`,
      type: 'binary',
      question: lang === 'pt' ? 'Qual é o próximo bit?' : 'What is the next bit?',
      options: options,
      correctIndex: correctIndex,
      pattern: bits.join(' ') + ' ?',
      difficulty: difficulty,
      timeLimit: 6,
      hint: this.getHint('binary'),
      rule: this.getRule('binary')
    };
  }

  private generateSequenceEnigma(difficulty: number): Enigma {
    const lang = getLanguage();
    const length = 3 + Math.floor(difficulty / 2);
    const seq: number[] = [];
    const start = Math.floor(Math.random() * 3) + 1;
    const diff = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < length; i++) {
      seq.push(start + i * diff);
    }
    
    const next = seq[seq.length - 1] + diff;
    
    const options = this.shuffleOptions([
      next.toString(),
      (next + Math.floor(Math.random() * 3) + 1).toString(),
      (next - Math.floor(Math.random() * 3) - 1).toString(),
      (next + Math.floor(Math.random() * 5) + 2).toString()
    ]);
    const correctIndex = options.indexOf(next.toString());
    
    return {
      id: `sequence_${Date.now()}`,
      type: 'sequence',
      question: lang === 'pt' ? 'Qual é o próximo número?' : 'What is the next number?',
      options: options,
      correctIndex: correctIndex,
      pattern: seq.join(' → ') + ' → ?',
      difficulty: difficulty,
      timeLimit: 5,
      hint: this.getHint('sequence'),
      rule: this.getRule('sequence')
    };
  }

  private generateLogicEnigma(difficulty: number): Enigma {
    const lang = getLanguage();
    const a = Math.floor(Math.random() * 6) + 2;
    const b = Math.floor(Math.random() * 6) + 2;
    const operations = ['+', '-', '×', '⊕'];
    const maxOpIndex = Math.min(Math.floor(difficulty / 2), operations.length - 1);
    const op = operations[Math.floor(Math.random() * (maxOpIndex + 1))];
    
    let result: number;
    let displayOp: string;
    
    switch (op) {
      case '+':
        result = a + b;
        displayOp = '+';
        break;
      case '-':
        result = a - b;
        displayOp = '−';
        break;
      case '×':
        result = a * b;
        displayOp = '×';
        break;
      case '⊕':
        result = a ^ b;
        displayOp = '⊕';
        break;
      default:
        result = a + b;
        displayOp = '+';
    }
    
    const options = this.shuffleOptions([
      result.toString(),
      (result + Math.floor(Math.random() * 4) + 1).toString(),
      (result - Math.floor(Math.random() * 4) - 1).toString(),
      (result + Math.floor(Math.random() * 6) + 2).toString()
    ]);
    const correctIndex = options.indexOf(result.toString());
    
    return {
      id: `logic_${Date.now()}`,
      type: 'logic',
      question: lang === 'pt' ? `Resolva: ${a} ${displayOp} ${b} = ?` : `Solve: ${a} ${displayOp} ${b} = ?`,
      options: options,
      correctIndex: correctIndex,
      pattern: `${a} ${displayOp} ${b} = ?`,
      difficulty: difficulty,
      timeLimit: 4,
      hint: this.getHint('logic'),
      rule: this.getRule('logic')
    };
  }

  private generateCryptoEnigma(difficulty: number): Enigma {
    const lang = getLanguage();
    const messages = [
      { text: 'Hi', binary: '01001000 01101001' },
      { text: 'Turing', binary: '01010100 01110101 01110010 01101001 01101110 01100111' },
      { text: 'Solstice', binary: '01010011 01101111 01101100 01110011 01110100 01101001 01100011 01100101' },
      { text: 'Enigma', binary: '01000101 01101110 01101001 01100111 01101101 01100001' },
      { text: 'AI', binary: '01000001 01001001' }
    ];
    
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const correct = msg.binary.split(' ').length;
    
    const options = this.shuffleOptions([
      correct.toString(),
      (correct + 1).toString(),
      (correct + 2).toString(),
      (correct - 1).toString()
    ]);
    const correctIndex = options.indexOf(correct.toString());
    
    return {
      id: `crypto_${Date.now()}`,
      type: 'crypto',
      question: lang === 'pt' 
        ? `Quantos bytes tem "${msg.text}" em binário?` 
        : `How many bytes does "${msg.text}" have in binary?`,
      options: options,
      correctIndex: correctIndex,
      pattern: msg.binary,
      difficulty: difficulty,
      timeLimit: 5,
      hint: this.getHint('crypto'),
      rule: this.getRule('crypto')
    };
  }

  private shuffleOptions(options: string[]): string[] {
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }
}
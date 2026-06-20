// src/services/LocalInteractionService.ts

import { Interaction } from './GeminiInteractionService';
import { LOCAL_INTERACTIONS } from '../data/interactions';
import { getLanguage } from '../utils/i18n';

export class LocalInteractionService {
  private interactions: Interaction[];
  private usedIndexes: number[] = [];

  constructor() {
    // Clona as interações locais para não modificar o original
    this.interactions = LOCAL_INTERACTIONS.map((item, index) => ({
      ...item,
      id: `local_${index}_${Date.now()}`
    }));
    this.usedIndexes = [];
    console.log(`📦 ${this.interactions.length} interações locais carregadas`);
  }

  private filterByLanguage(available: { item: Interaction; index: number }[]): { item: Interaction; index: number }[] {
    const lang = getLanguage();
    const isEnglish = lang === 'en';
    
    return available.filter(({ item }) => {
      const context = item.context || '';
      const isEnContext = context.endsWith('_en');
      
      if (isEnglish) {
        // Em inglês: inclui contextos _en ou sem sufixo (fallback)
        return isEnContext || (!context.endsWith('_pt') && !isEnContext);
      } else {
        // Em português: exclui contextos _en
        return !isEnContext;
      }
    });
  }

  public getInteraction(type?: Interaction['type']): Interaction | null {
    // Filtra disponíveis
    let available = this.interactions
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => !this.usedIndexes.includes(index));
    
    if (type) {
      available = available.filter(({ item }) => item.type === type);
    }
    
    // Filtra por idioma
    available = this.filterByLanguage(available);
    
    if (available.length === 0) {
      // Se não há disponíveis, reinicia o ciclo
      this.usedIndexes = [];
      available = this.interactions
        .map((item, index) => ({ item, index }));
      
      if (type) {
        available = available.filter(({ item }) => item.type === type);
      }
      
      // Filtra por idioma novamente
      available = this.filterByLanguage(available);
      
      if (available.length === 0) return null;
    }
    
    // Pega o primeiro disponível
    const selected = available[0];
    this.usedIndexes.push(selected.index);
    
    return selected.item;
  }

  public getRandomInteraction(type?: Interaction['type']): Interaction | null {
    // Filtra disponíveis
    let available = this.interactions
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => !this.usedIndexes.includes(index));
    
    if (type) {
      available = available.filter(({ item }) => item.type === type);
    }
    
    // Filtra por idioma
    available = this.filterByLanguage(available);
    
    if (available.length === 0) {
      // Se não há disponíveis, reinicia o ciclo
      this.usedIndexes = [];
      available = this.interactions
        .map((item, index) => ({ item, index }));
      
      if (type) {
        available = available.filter(({ item }) => item.type === type);
      }
      
      // Filtra por idioma novamente
      available = this.filterByLanguage(available);
      
      if (available.length === 0) return null;
    }
    
    // Pega aleatório
    const random = available[Math.floor(Math.random() * available.length)];
    this.usedIndexes.push(random.index);
    
    return random.item;
  }

  public reset(): void {
    this.usedIndexes = [];
  }

  public getRemainingCount(): number {
    return this.interactions.length - this.usedIndexes.length;
  }
}
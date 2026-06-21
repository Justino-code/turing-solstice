// src/registries/ObstacleRegistry.ts
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';

export type ObstacleConstructor = new (x: number, y: number, config?: any) => BaseObstacle;

export interface ObstacleConfig {
  minLevel: number;
  weight: number;
}

export class ObstacleRegistry {
  private static obstacles: Map<string, ObstacleConstructor> = new Map();
  private static configs: Map<string, ObstacleConfig> = new Map();
  
  /**
   * Registra um novo tipo de obstáculo
   * @param type - Nome do tipo (ex: 'spike', 'block', etc)
   * @param constructor - Construtor do obstáculo
   * @param config - Configurações (nível mínimo e peso)
   */
  static register(type: string, constructor: ObstacleConstructor, config: ObstacleConfig = { minLevel: 0, weight: 1 }): void {
    if (this.obstacles.has(type)) {
      console.warn(`⚠️ Obstáculo ${type} já registrado, sobrescrevendo...`);
    }
    this.obstacles.set(type, constructor);
    this.configs.set(type, config);
    console.log(`✅ Obstáculo registrado: ${type} (nível mínimo: ${config.minLevel}, peso: ${config.weight})`);
  }
  
  /**
   * Cria uma instância de um obstáculo pelo tipo
   * @param type - Tipo do obstáculo
   * @param x - Posição X
   * @param y - Posição Y
   * @param config - Configurações adicionais
   * @returns Instância do BaseObstacle
   */
  static create(type: string, x: number, y: number, config?: any): BaseObstacle {
    const Constructor = this.obstacles.get(type);
    if (!Constructor) {
      throw new Error(`❌ Tipo de obstáculo não registrado: ${type}`);
    }
    return new Constructor(x, y, config);
  }
  
  /**
   * Retorna todos os tipos disponíveis
   */
  static getAvailableTypes(): string[] {
    return Array.from(this.obstacles.keys());
  }
  
  /**
   * Retorna os tipos disponíveis baseado no nível de dificuldade
   */
  static getTypesForLevel(level: number): string[] {
    const types: string[] = [];
    for (const [type, config] of this.configs) {
      if (level >= config.minLevel) {
        types.push(type);
      }
    }
    return types;
  }
  
  /**
   * Cria um obstáculo aleatório baseado no nível com pesos
   * @param x - Posição X
   * @param yRange - Range de posição Y { min, max }
   * @param difficultyLevel - Nível de dificuldade atual
   * @returns Instância do BaseObstacle
   */
  static createRandom(x: number, yRange: { min: number; max: number }, difficultyLevel: number = 0): BaseObstacle {
    const availableTypes = this.getTypesForLevel(difficultyLevel);
    
    // Se não houver tipos disponíveis, usa spike como fallback
    if (availableTypes.length === 0) {
      const y = Math.floor(Math.random() * (yRange.max - yRange.min + 1)) + yRange.min;
      console.warn('⚠️ Nenhum tipo disponível para o nível', difficultyLevel, ', usando spike como fallback');
      return this.create('spike', x, y);
    }
    
    // Seleciona baseado nos pesos
    const weightedTypes: string[] = [];
    for (const type of availableTypes) {
      const config = this.configs.get(type);
      const weight = config?.weight || 1;
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type);
      }
    }
    
    const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const y = Math.floor(Math.random() * (yRange.max - yRange.min + 1)) + yRange.min;
    
    console.log('🎲 Criando obstáculo:', type, 'no nível', difficultyLevel);
    
    return this.create(type, x, y, { difficultyLevel });
  }
  
  /**
   * Registra múltiplos obstáculos de uma vez
   */
  static registerBatch(obstacles: { 
    type: string; 
    constructor: ObstacleConstructor; 
    minLevel?: number;
    weight?: number;
  }[]): void {
    console.log(`🔄 Registrando ${obstacles.length} obstáculos em lote...`);
    for (const obs of obstacles) {
      this.register(obs.type, obs.constructor, { 
        minLevel: obs.minLevel || 0,
        weight: obs.weight || 1
      });
    }
  }
  
  /**
   * Verifica se um tipo está registrado
   */
  static isRegistered(type: string): boolean {
    return this.obstacles.has(type);
  }
  
  /**
   * Obtém o nível mínimo para um tipo
   */
  static getMinLevel(type: string): number {
    return this.configs.get(type)?.minLevel || 0;
  }
  
  /**
   * Obtém o peso de um tipo
   */
  static getWeight(type: string): number {
    return this.configs.get(type)?.weight || 1;
  }
  
  /**
   * Obtém a configuração completa de um tipo
   */
  static getConfig(type: string): ObstacleConfig | undefined {
    return this.configs.get(type);
  }
  
  /**
   * Remove um tipo do registro
   */
  static unregister(type: string): boolean {
    const removed = this.obstacles.delete(type);
    this.configs.delete(type);
    if (removed) {
      console.log(`🗑️ Obstáculo ${type} removido do registro`);
    }
    return removed;
  }
  
  /**
   * Limpa todos os registros
   */
  static clear(): void {
    this.obstacles.clear();
    this.configs.clear();
    console.log('🧹 Registro de obstáculos limpo');
  }
  
  /**
   * Retorna estatísticas do registro
   */
  static getStats(): { total: number; types: string[]; configs: Map<string, ObstacleConfig> } {
    return {
      total: this.obstacles.size,
      types: this.getAvailableTypes(),
      configs: new Map(this.configs)
    };
  }
}
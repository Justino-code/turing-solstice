// src/registries/ObstacleRegistration.ts
import { ObstacleRegistry } from './ObstacleRegistry';
import {
  SpikeObstacle,
  BlockObstacle,
  CrystalObstacle,
  PillarObstacle,
  WatcherObstacle,
  VoidObstacle,
  StormObstacle
} from '../entities/obstacles';

/**
 * Registra todos os obstáculos base do jogo
 * Cada tipo usa seu próprio construtor que estende BaseObstacle
 */
export function registerBaseObstacles(): void {
  console.log('🔄 Iniciando registro de obstáculos base...');
  
  ObstacleRegistry.registerBatch([
    { 
      type: 'spike', 
      constructor: SpikeObstacle, 
      minLevel: 0,
      weight: 5
    },
    { 
      type: 'block', 
      constructor: BlockObstacle, 
      minLevel: 0,
      weight: 4
    },
    { 
      type: 'crystal', 
      constructor: CrystalObstacle, 
      minLevel: 1,
      weight: 3
    },
    { 
      type: 'pillar', 
      constructor: PillarObstacle, 
      minLevel: 3,
      weight: 2
    },
    { 
      type: 'watcher', 
      constructor: WatcherObstacle, 
      minLevel: 5,
      weight: 2
    },
    { 
      type: 'void', 
      constructor: VoidObstacle, 
      minLevel: 7,
      weight: 1
    },
    { 
      type: 'storm', 
      constructor: StormObstacle, 
      minLevel: 10,
      weight: 1
    },
  ]);
  
  const stats = ObstacleRegistry.getStats();
  console.log(`✅ ${stats.total} obstáculos registrados:`, stats.types.join(', '));
}

/**
 * Função para registrar obstáculos personalizados externamente
 * @param type - Nome do tipo
 * @param constructor - Classe do obstáculo (deve estender BaseObstacle)
 * @param minLevel - Nível mínimo para aparecer
 * @param weight - Peso para spawn aleatório
 */
export function registerCustomObstacle(
  type: string,
  constructor: any,
  minLevel: number = 0,
  weight: number = 1
): void {
  if (ObstacleRegistry.isRegistered(type)) {
    console.warn(`⚠️ Tipo ${type} já registrado. Sobrescrevendo...`);
  }
  ObstacleRegistry.register(type, constructor, { minLevel, weight });
}

/**
 * Função para remover um obstáculo do registro
 */
export function unregisterObstacle(type: string): boolean {
  return ObstacleRegistry.unregister(type);
}

/**
 * Função para verificar se um tipo está disponível em determinado nível
 */
export function isObstacleAvailable(type: string, level: number): boolean {
  const minLevel = ObstacleRegistry.getMinLevel(type);
  return level >= minLevel;
}

/**
 * Função para listar todos os obstáculos disponíveis para um nível
 */
export function getObstaclesForLevel(level: number): string[] {
  return ObstacleRegistry.getTypesForLevel(level);
}

/**
 * Função para obter estatísticas dos obstáculos registrados
 */
export function getObstacleStats(): { total: number; types: string[] } {
  const stats = ObstacleRegistry.getStats();
  return {
    total: stats.total,
    types: stats.types
  };
}
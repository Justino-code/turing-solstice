// src/entities/Obstacle.ts

import { Obstacle as ObstacleType } from '../types';
import { COLORS } from '../constants/game';
import { randomFloat, randomInt } from '../utils/helpers';

export class Obstacle implements ObstacleType {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'block' | 'crystal';
  active: boolean;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  glowIntensity: number;

  constructor(x: number, y: number, type: 'spike' | 'block' | 'crystal' = 'spike') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.rotation = 0;
    this.rotationSpeed = randomFloat(-0.02, 0.02);
    this.pulsePhase = randomFloat(0, Math.PI * 2);
    this.glowIntensity = 0;

    // Define tamanho baseado no tipo
    switch (type) {
      case 'spike':
        this.w = randomInt(18, 28);
        this.h = randomInt(18, 28);
        break;
      case 'block':
        this.w = randomInt(25, 35);
        this.h = randomInt(25, 35);
        break;
      case 'crystal':
        this.w = randomInt(15, 22);
        this.h = randomInt(20, 30);
        break;
    }
  }

  /**
   * Atualiza o obstáculo
   */
  public update(speed: number): void {
    // Move para a esquerda
    this.x -= speed;
    
    // Atualiza rotação
    this.rotation += this.rotationSpeed;
    
    // Atualiza pulso
    this.pulsePhase += 0.05;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;
  }

  /**
   * Verifica se o obstáculo saiu da tela
   */
  public isOffScreen(width: number): boolean {
    return this.x + this.w < -50;
  }

  /**
   * Obtém a cor do obstáculo baseado no tipo
   */
  public getColor(): string {
    switch (this.type) {
      case 'spike':
        return COLORS.OBSTACLE;
      case 'block':
        return '#e67e22';
      case 'crystal':
        return '#9b59b6';
      default:
        return COLORS.OBSTACLE;
    }
  }

  /**
   * Obtém a cor do glow baseado no tipo
   */
  public getGlowColor(): string {
    switch (this.type) {
      case 'spike':
        return COLORS.OBSTACLE_GLOW;
      case 'block':
        return '#e67e22';
      case 'crystal':
        return '#9b59b6';
      default:
        return COLORS.OBSTACLE_GLOW;
    }
  }

  /**
   * Desenha o obstáculo (será usado pelo sistema de renderização)
   */
  public getVertices(): { x: number; y: number }[] {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const halfW = this.w / 2;
    const halfH = this.h / 2;

    switch (this.type) {
      case 'spike':
        // Forma de diamante
        return [
          { x: cx, y: this.y },                    // topo
          { x: this.x + this.w, y: cy },            // direita
          { x: cx, y: this.y + this.h },            // baixo
          { x: this.x, y: cy }                      // esquerda
        ];
      case 'block':
        // Retângulo
        return [
          { x: this.x, y: this.y },
          { x: this.x + this.w, y: this.y },
          { x: this.x + this.w, y: this.y + this.h },
          { x: this.x, y: this.y + this.h }
        ];
      case 'crystal':
        // Forma de cristal (hexágono alongado)
        return [
          { x: cx, y: this.y },
          { x: this.x + this.w, y: this.y + this.h * 0.2 },
          { x: this.x + this.w, y: this.y + this.h * 0.8 },
          { x: cx, y: this.y + this.h },
          { x: this.x, y: this.y + this.h * 0.8 },
          { x: this.x, y: this.y + this.h * 0.2 }
        ];
      default:
        return [];
    }
  }

  /**
   * Verifica colisão com um retângulo
   */
  public collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean {
    return this.x < rect.x + rect.w &&
           this.x + this.w > rect.x &&
           this.y < rect.y + rect.h &&
           this.y + this.h > rect.y;
  }

  /**
   * Cria um obstáculo aleatório
   */
  public static createRandom(x: number, yRange: { min: number; max: number }): Obstacle {
    const types: ('spike' | 'block' | 'crystal')[] = ['spike', 'block', 'crystal'];
    const type = types[randomInt(0, types.length - 1)];
    const y = randomInt(yRange.min, yRange.max);
    return new Obstacle(x, y, type);
  }

  /**
   * Reseta o obstáculo para uma nova posição
   */
  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.active = true;
    this.rotation = 0;
    this.pulsePhase = randomFloat(0, Math.PI * 2);
  }

  /**
   * Aplica dano (para obstáculos destrutíveis)
   */
  public takeDamage(damage: number): boolean {
    // Por enquanto, apenas desativa
    this.active = false;
    return true;
  }
}
// src/entities/Platform.ts

import { Platform as PlatformType } from '../types';
import { randomInt, randomFloat } from '../utils/helpers';

export class Platform implements PlatformType {
  x: number;
  y: number;
  w: number;
  h: number;
  life: number;
  maxLife: number;
  type: 'normal' | 'glowing' | 'fragile' | 'moving';
  pulsePhase: number;
  originalX: number;
  originalY: number;
  moveRange: number;
  moveSpeed: number;
  moveDirection: number;

  constructor(x: number, y: number, w?: number, h?: number, type: 'normal' | 'glowing' | 'fragile' | 'moving' = 'normal') {
    this.x = x;
    this.y = y;
    this.w = w || randomInt(50, 100);
    this.h = h || 10;
    this.type = type;
    this.life = 600;
    this.maxLife = 600;
    this.pulsePhase = randomFloat(0, Math.PI * 2);
    
    // Para plataformas móveis
    this.originalX = x;
    this.originalY = y;
    this.moveRange = randomInt(30, 80);
    this.moveSpeed = randomFloat(0.5, 1.5);
    this.moveDirection = 1;
  }

  /**
   * Atualiza a plataforma
   */
  public update(speed: number): void {
    // Reduz vida
    this.life -= 1;
    
    // Atualiza pulso
    this.pulsePhase += 0.03;
    
    // Movimento para plataformas móveis
    if (this.type === 'moving') {
      this.x = this.originalX + Math.sin(this.pulsePhase * this.moveSpeed) * this.moveRange;
      this.y = this.originalY + Math.cos(this.pulsePhase * this.moveSpeed * 0.7) * (this.moveRange * 0.5);
    }
    
    // Efeito de fade para plataformas frágeis
    if (this.type === 'fragile' && this.life < 120) {
      // Começa a piscar
    }
  }

  /**
   * Verifica se a plataforma ainda está ativa
   */
  public isActive(): boolean {
    return this.life > 0;
  }

  /**
   * Verifica se a plataforma saiu da tela
   */
  public isOffScreen(width: number): boolean {
    return this.x + this.w < -80;
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
   * Obtém a cor da plataforma baseado no tipo e vida
   */
  public getColor(isNight: boolean): string {
    const baseColor = isNight ? '#3a4a6a' : '#6a8aaa';
    const lifeRatio = this.life / this.maxLife;
    
    switch (this.type) {
      case 'glowing':
        return `hsl(${isNight ? 210 : 40}, 80%, ${50 + this.pulsePhase * 10}%)`;
      case 'fragile':
        if (this.life < 120) {
          // Pisca quando está prestes a quebrar
          return Math.floor(this.pulsePhase * 2) % 2 === 0 ? '#e74c3c' : baseColor;
        }
        return '#e67e22';
      case 'moving':
        return `hsl(${isNight ? 180 : 80}, 70%, ${50 + Math.sin(this.pulsePhase) * 10}%)`;
      default:
        return baseColor;
    }
  }

  /**
   * Obtém a opacidade da plataforma
   */
  public getAlpha(): number {
    if (this.type === 'fragile') {
      const lifeRatio = this.life / this.maxLife;
      if (lifeRatio < 0.3) {
        return 0.5 + (lifeRatio / 0.3) * 0.5;
      }
    }
    return 1;
  }

  /**
   * Aplica dano à plataforma (para plataformas destrutíveis)
   */
  public takeDamage(damage: number): boolean {
    this.life -= damage * 30;
    if (this.life <= 0) {
      this.life = 0;
      return true; // Destruída
    }
    return false;
  }

  /**
   * Reseta a plataforma
   */
  public reset(): void {
    this.life = this.maxLife;
    this.x = this.originalX;
    this.y = this.originalY;
    this.pulsePhase = randomFloat(0, Math.PI * 2);
  }

  /**
   * Cria uma plataforma aleatória
   */
  public static createRandom(x: number, yRange: { min: number; max: number }): Platform {
    const types: ('normal' | 'glowing' | 'fragile' | 'moving')[] = ['normal', 'normal', 'glowing', 'fragile'];
    const type = types[Math.floor(Math.random() * types.length)];
    const y = randomInt(yRange.min, yRange.max);
    const w = randomInt(50, 100);
    return new Platform(x, y, w, 10, type);
  }

  /**
   * Verifica se o jogador está em cima da plataforma
   */
  public isPlayerOn(rect: { x: number; y: number; w: number; h: number }): boolean {
    const margin = 2;
    return rect.x + rect.w > this.x + margin &&
           rect.x < this.x + this.w - margin &&
           rect.y + rect.h >= this.y + margin &&
           rect.y + rect.h <= this.y + this.h + 12 &&
           rect.y + rect.h - rect.h / 2 < this.y + this.h;
  }

  /**
   * Obtém o ponto central da plataforma
   */
  public getCenter(): { x: number; y: number } {
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2
    };
  }
}
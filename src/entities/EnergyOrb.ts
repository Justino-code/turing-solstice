// src/entities/EnergyOrb.ts

import { EnergyOrb as EnergyOrbType } from '../types';
import { COLORS } from '../constants/game';
import { randomFloat, randomInt } from '../utils/helpers';

export class EnergyOrb implements EnergyOrbType {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulsePhase: number;
  floatOffset: number;
  floatSpeed: number;
  rotation: number;
  rotationSpeed: number;
  glowSize: number;
  baseY: number;

  constructor(x: number, y: number, radius: number = 8) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.radius = radius;
    this.collected = false;
    this.pulsePhase = randomFloat(0, Math.PI * 2);
    this.floatOffset = randomFloat(0, Math.PI * 2);
    this.floatSpeed = randomFloat(0.02, 0.04);
    this.rotation = randomFloat(0, Math.PI * 2);
    this.rotationSpeed = randomFloat(0.02, 0.05);
    this.glowSize = radius * 2;
  }

  /**
   * Atualiza a orb
   */
  public update(speed: number): void {
    if (this.collected) return;

    // Move para a esquerda
    this.x -= speed * 0.8;

    // Efeito de flutuação
    this.floatOffset += this.floatSpeed;
    this.y = this.baseY + Math.sin(this.floatOffset) * 3;

    // Rotação
    this.rotation += this.rotationSpeed;

    // Pulso
    this.pulsePhase += 0.05;
    this.glowSize = this.radius * 2 + Math.sin(this.pulsePhase) * this.radius * 0.3;
  }

  /**
   * Verifica se a orb saiu da tela
   */
  public isOffScreen(width: number): boolean {
    return this.x + this.radius < -30;
  }

  /**
   * Coleta a orb
   */
  public collect(): void {
    this.collected = true;
  }

  /**
   * Verifica colisão com um retângulo
   */
  public collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean {
    if (this.collected) return false;

    // Calcula o ponto mais próximo do retângulo ao centro do círculo
    const closestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.h));
    
    const dx = this.x - closestX;
    const dy = this.y - closestY;
    
    return (dx * dx + dy * dy) < (this.radius * this.radius);
  }

  /**
   * Verifica colisão com um círculo
   */
  public collidesWithCircle(circle: { x: number; y: number; radius: number }): boolean {
    if (this.collected) return false;

    const dx = this.x - circle.x;
    const dy = this.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.radius + circle.radius;
  }

  /**
   * Obtém a cor da orb
   */
  public getColor(): string {
    return COLORS.ENERGY_ORB;
  }

  /**
   * Obtém a cor do glow
   */
  public getGlowColor(): string {
    return `rgba(247, 220, 111, ${0.2 + Math.sin(this.pulsePhase) * 0.1})`;
  }

  /**
   * Obtém o tamanho do glow
   */
  public getGlowSize(): number {
    return this.glowSize;
  }

  /**
   * Obtém a opacidade da orb
   */
  public getAlpha(): number {
    if (this.collected) return 0;
    return 0.8 + Math.sin(this.pulsePhase) * 0.2;
  }

  /**
   * Reseta a orb para uma nova posição
   */
  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.collected = false;
    this.pulsePhase = randomFloat(0, Math.PI * 2);
    this.floatOffset = randomFloat(0, Math.PI * 2);
  }

  /**
   * Cria uma orb em uma posição aleatória
   */
  public static createRandom(x: number, yRange: { min: number; max: number }): EnergyOrb {
    const y = randomInt(yRange.min, yRange.max);
    const radius = randomInt(6, 10);
    return new EnergyOrb(x, y, radius);
  }

  /**
   * Cria múltiplas orbs em um padrão
   */
  public static createPattern(x: number, y: number, count: number, spread: number): EnergyOrb[] {
    const orbs: EnergyOrb[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = spread * (0.5 + Math.random() * 0.5);
      const orb = new EnergyOrb(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist,
        randomInt(5, 8)
      );
      orbs.push(orb);
    }
    return orbs;
  }

  /**
   * Obtém o valor da orb (quantos pontos de energia)
   */
  public getValue(): number {
    // Orbs maiores dão mais energia
    return Math.floor(this.radius / 2) + 1;
  }

  /**
   * Verifica se a orb está visível na tela
   */
  public isOnScreen(width: number, height: number): boolean {
    return this.x + this.radius > 0 &&
           this.x - this.radius < width &&
           this.y + this.radius > 0 &&
           this.y - this.radius < height;
  }

  /**
   * Obtém os pontos para desenhar o brilho
   */
  public getGlowPoints(): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.rotation;
      const dist = this.glowSize * (0.8 + Math.sin(this.pulsePhase + i) * 0.2);
      points.push({
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist
      });
    }
    return points;
  }
}
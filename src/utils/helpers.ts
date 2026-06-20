// src/utils/helpers.ts

import { Vector2, Particle, GameConfig } from '../types';
import { GAME_CONFIG, COLORS } from '../constants/game';

/**
 * Gera um número inteiro aleatório entre min e max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera um número float aleatório entre min e max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Clampa um valor entre min e max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Verifica colisão entre dois retângulos
 */
export function rectCollision(a: { x: number; y: number; w: number; h: number }, 
                              b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

/**
 * Verifica colisão entre círculo e retângulo
 */
export function circleRectCollision(circle: { x: number; y: number; r: number },
                                   rect: { x: number; y: number; w: number; h: number }): boolean {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return (dx * dx + dy * dy) < (circle.r * circle.r);
}

/**
 * Distância entre dois pontos
 */
export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Distância ao quadrado (mais eficiente para comparações)
 */
export function distanceSquared(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Interpolação linear
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Gera um ID único
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Embaralha um array (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Cria uma partícula
 */
export function createParticle(x: number, y: number, color?: string): Particle {
  return {
    x,
    y,
    vx: randomFloat(-3, 3),
    vy: randomFloat(-4, 1),
    life: randomInt(30, 50),
    maxLife: 50,
    radius: randomFloat(2, 5),
    color: color || `hsl(${randomInt(40, 70)}, 100%, 70%)`,
    alpha: 1
  };
}

/**
 * Verifica se um ponto está dentro de um retângulo
 */
export function pointInRect(px: number, py: number, 
                           rect: { x: number; y: number; w: number; h: number }): boolean {
  return px >= rect.x && px <= rect.x + rect.w &&
         py >= rect.y && py <= rect.y + rect.h;
}

/**
 * Converte um número para binário com padding
 */
export function toBinaryString(num: number, padding: number = 8): string {
  return num.toString(2).padStart(padding, '0');
}

/**
 * Aplica shake na posição
 */
export function applyShake(x: number, y: number, intensity: number): { x: number; y: number } {
  return {
    x: x + randomFloat(-intensity, intensity),
    y: y + randomFloat(-intensity, intensity)
  };
}

/**
 * Verifica se o jogo está no modo noturno baseado no progresso
 */
export function isNightTime(progress: number): boolean {
  return progress > 0.5;
}

/**
 * Calcula o nível de dificuldade baseado no ciclo
 */
export function getDifficultyLevel(cycle: number): number {
  return Math.floor(cycle / 3);
}

/**
 * Formata pontuação
 */
export function formatScore(score: number): string {
  return Math.floor(score).toString().padStart(6, '0');
}

/**
 * Delay promisificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Escolhe um item aleatório de um array
 */
export function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Calcula o tamanho da fonte proporcional ao canvas
 * Mobile (< 400px): 70% do tamanho base
 * Tablet (400-600px): 80% do tamanho base
 * Desktop (> 600px): proporcional com limite de 130%
 */
export function getFontSize(canvasWidth: number, baseSize: number, baseWidth: number = 800): number {
  const scaled = Math.round((canvasWidth / baseWidth) * baseSize);
  if (canvasWidth < 400) {
    return Math.max(6, Math.round(baseSize * 0.7));
  }
  if (canvasWidth < 600) {
    return Math.max(6, Math.round(baseSize * 0.8));
  }
  return Math.max(6, Math.min(scaled, Math.round(baseSize * 1.3)));
}
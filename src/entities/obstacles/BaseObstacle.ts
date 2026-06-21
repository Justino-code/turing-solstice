// src/entities/obstacles/BaseObstacle.ts
import { IObstacle } from '../../interfaces/IObstacle';

export abstract class BaseObstacle implements IObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  active: boolean;
  rotation: number;
  protected rotationSpeed: number;
  protected floatOffset: number;
  protected pulsePhase: number;
  protected glowIntensity: number;
  protected floatSpeed: number;
  protected particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[];

  constructor(x: number, y: number, type: string, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this.type = type;
    this.active = true;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.floatOffset = 0;
    this.floatSpeed = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.glowIntensity = 0;
    this.particles = [];
  }

  abstract update(speed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean {
    const margin = this.getCollisionMargin();
    const box = this.getBoundingBox();
    return box.x + margin < rect.x + rect.w &&
           box.x + box.w - margin > rect.x &&
           box.y + margin < rect.y + rect.h &&
           box.y + box.h - margin > rect.y;
  }

  collidesWithCircle(centerX: number, centerY: number, radius: number): boolean {
    const box = this.getBoundingBox();
    const obstacleCenterX = box.x + box.w / 2;
    const obstacleCenterY = box.y + box.h / 2;
    const obstacleRadius = Math.sqrt(box.w * box.w + box.h * box.h) / 2;
    
    const dx = centerX - obstacleCenterX;
    const dy = centerY - obstacleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < radius + obstacleRadius;
  }

  isOffScreen(width: number): boolean {
    return this.x + this.w < -80;
  }

  getBoundingBox(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.x,
      y: this.y + this.floatOffset,
      w: this.w,
      h: this.h
    };
  }

  getColor(): string {
    return '#e74c3c';
  }

  getGlowColor(): string {
    return 'rgba(231, 76, 60, 0.6)';
  }

  getVertices(): { x: number; y: number }[] {
    return [
      { x: this.x, y: this.y + this.floatOffset },
      { x: this.x + this.w, y: this.y + this.floatOffset },
      { x: this.x + this.w, y: this.y + this.h + this.floatOffset },
      { x: this.x, y: this.y + this.h + this.floatOffset }
    ];
  }

  protected getCollisionMargin(): number {
    return 2;
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.active = true;
    this.rotation = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.particles = [];
  }

  takeDamage(damage: number): boolean {
    this.active = false;
    return true;
  }
}
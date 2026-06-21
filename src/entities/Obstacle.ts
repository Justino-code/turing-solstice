// src/entities/Obstacle.ts
import { Obstacle as ObstacleType, ObstacleType as ObstacleType2 } from '../types';
import { IObstacle } from '../interfaces/IObstacle';
import { BaseObstacle } from './obstacles/BaseObstacle';

export class Obstacle implements ObstacleType, IObstacle {
  x: number;
  y: number;
  w: number = 25;
  h: number = 25;
  type: ObstacleType2;
  active: boolean = true;
  rotation: number = 0;
  rotationSpeed: number = 0;
  pulsePhase: number;
  glowIntensity: number = 0;
  floatOffset: number = 0;
  floatSpeed: number = 0;
  particleTimer: number = 0;
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  // Referência ao delegate BaseObstacle (usado quando convertido de BaseObstacle)
  private delegate: BaseObstacle | null = null;

  constructor(x: number, y: number, type: ObstacleType2 = 'spike') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.pulsePhase = Math.random() * Math.PI * 2;
    
    this.setDefaultProperties(type);
  }

  /**
   * Converte um BaseObstacle para Obstacle
   * Usado pelo ObstacleRegistry para converter os obstáculos individuais
   */
  static fromBaseObstacle(baseObstacle: BaseObstacle): Obstacle {
    const newObstacle = new Obstacle(
      baseObstacle.x, 
      baseObstacle.y, 
      baseObstacle.type as ObstacleType2
    );
    
    // Copia todas as propriedades do BaseObstacle
    Object.assign(newObstacle, baseObstacle);
    
    // Mantém a referência ao delegate
    newObstacle.delegate = baseObstacle;
    
    return newObstacle;
  }

  private setDefaultProperties(type: string): void {
    switch (type) {
      case 'spike':
        this.w = 18 + Math.random() * 10;
        this.h = 18 + Math.random() * 10;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        break;
      case 'block':
        this.w = 25 + Math.random() * 10;
        this.h = 25 + Math.random() * 10;
        break;
      case 'crystal':
        this.w = 15 + Math.random() * 7;
        this.h = 20 + Math.random() * 10;
        this.floatSpeed = 0.02 + Math.random() * 0.02;
        break;
      case 'pillar':
        this.w = 20 + Math.random() * 10;
        this.h = 50 + Math.random() * 30;
        this.rotationSpeed = 0.01 + Math.random() * 0.03;
        break;
      case 'watcher':
        this.w = 25 + Math.random() * 10;
        this.h = 25 + Math.random() * 10;
        this.floatSpeed = 0.02 + Math.random() * 0.03;
        break;
      case 'void':
        this.w = 30 + Math.random() * 20;
        this.h = 30 + Math.random() * 20;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        break;
      case 'storm':
        this.w = 35 + Math.random() * 20;
        this.h = 35 + Math.random() * 20;
        this.rotationSpeed = 0.05 + Math.random() * 0.05;
        break;
      default:
        this.w = 25;
        this.h = 25;
    }
  }

  public update(speed: number): void {
    this.x -= speed;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.05;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;
    
    if (this.type === 'crystal' || this.type === 'watcher') {
      this.floatOffset = Math.sin(this.pulsePhase * this.floatSpeed * 10) * 8;
    }
    
    if (this.type === 'void' || this.type === 'storm') {
      this.particleTimer++;
      if (this.particleTimer % 3 === 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = this.w / 2 + Math.random() * 10;
        this.particles.push({
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          vx: Math.cos(angle) * 0.5,
          vy: Math.sin(angle) * 0.5 - 0.3,
          life: 30 + Math.random() * 20,
          color: this.type === 'void' ? '#9b30ff' : '#00ffcc'
        });
      }
      
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      }
      this.particles = this.particles.filter(p => p.life > 0);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Se tem delegate, usa o render do delegate
    if (this.delegate) {
      this.delegate.render(ctx);
      return;
    }

    const color = this.getColor();
    const glowColor = this.getGlowColor();
    const vertices = this.getVertices();

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    if (this.type === 'crystal') {
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2 + this.floatOffset;
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, this.w * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.arc(cx + 2, cy + 2, this.w * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'watcher') {
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2 + this.floatOffset;
      const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(cx, cy, this.w * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15 * pulse;
      ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + pulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(cx, cy, this.w * 0.15 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.type === 'void') {
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2;
      const time = Date.now() / 1000;
      for (let i = 0; i < 3; i++) {
        const radius = (i + 1) * 8 + Math.sin(time + i) * 3;
        const alpha = 0.1 + Math.sin(time * 1.5 + i * 2) * 0.05 + 0.05;
        ctx.strokeStyle = `rgba(155, 48, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const p of this.particles) {
        const alpha = p.life / 30;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(cx + p.x - 1, cy + p.y - 1, 2, 2);
        ctx.globalAlpha = 1;
      }
    } else if (this.type === 'storm') {
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2;
      const numRays = 6;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + Date.now() / 2000;
        const length = this.w * 0.6 + Math.sin(Date.now() / 300 + i) * 5;
        const x1 = cx + Math.cos(angle) * 8;
        const y1 = cy + Math.sin(angle) * 8;
        const x2 = cx + Math.cos(angle) * length;
        const y2 = cy + Math.sin(angle) * length;
        ctx.strokeStyle = `rgba(0, 255, 200, ${0.2 + Math.sin(Date.now() / 400 + i * 3) * 0.1 + 0.1})`;
        ctx.lineWidth = 2 + Math.sin(Date.now() / 200 + i) * 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const segments = 4;
        for (let j = 0; j <= segments; j++) {
          const t = j / segments;
          const tx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 4;
          const ty = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 4;
          ctx.lineTo(tx, ty);
        }
        ctx.stroke();
      }
      for (const p of this.particles) {
        const alpha = p.life / 20;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(cx + p.x - 1, cy + p.y - 1, 2, 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  public getBoundingBox(): { x: number; y: number; w: number; h: number } {
    if (this.delegate) {
      return this.delegate.getBoundingBox();
    }
    return {
      x: this.x,
      y: this.y + this.floatOffset,
      w: this.w,
      h: this.h
    };
  }

  public isOffScreen(width: number): boolean {
    if (this.delegate) {
      return this.delegate.isOffScreen(width);
    }
    return this.x + this.w < -80;
  }

  public getColor(): string {
    if (this.delegate) {
      return this.delegate.getColor();
    }
    const colors: { [key: string]: string } = {
      'spike': '#e74c3c',
      'block': '#e67e22',
      'crystal': '#9b59b6',
      'pillar': '#5b8cae',
      'watcher': '#ff4444',
      'void': '#1a0033',
      'storm': '#00cc99'
    };
    return colors[this.type] || '#e74c3c';
  }

  public getGlowColor(): string {
    if (this.delegate) {
      return this.delegate.getGlowColor();
    }
    const colors: { [key: string]: string } = {
      'spike': 'rgba(231, 76, 60, 0.6)',
      'block': 'rgba(230, 126, 34, 0.6)',
      'crystal': 'rgba(155, 89, 182, 0.6)',
      'pillar': 'rgba(91, 140, 174, 0.6)',
      'watcher': 'rgba(255, 68, 68, 0.6)',
      'void': 'rgba(26, 0, 51, 0.8)',
      'storm': 'rgba(0, 204, 153, 0.6)'
    };
    return colors[this.type] || 'rgba(231, 76, 60, 0.6)';
  }

  public getVertices(): { x: number; y: number }[] {
    if (this.delegate) {
      return this.delegate.getVertices();
    }
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + this.floatOffset;
    const hw = this.w / 2;
    const hh = this.h / 2;

    switch (this.type) {
      case 'spike':
        return [
          { x: cx, y: cy - hh },
          { x: cx + hw, y: cy + hh },
          { x: cx - hw, y: cy + hh }
        ];
      case 'crystal':
        return [
          { x: cx, y: cy - hh },
          { x: cx + hw, y: cy },
          { x: cx, y: cy + hh },
          { x: cx - hw, y: cy }
        ];
      case 'pillar':
        return [
          { x: this.x + 5, y: this.y + this.floatOffset },
          { x: this.x + this.w - 5, y: this.y + this.floatOffset },
          { x: this.x + this.w, y: this.y + 8 + this.floatOffset },
          { x: this.x + this.w, y: this.y + this.h - 8 + this.floatOffset },
          { x: this.x + this.w - 5, y: this.y + this.h + this.floatOffset },
          { x: this.x + 5, y: this.y + this.h + this.floatOffset },
          { x: this.x, y: this.y + this.h - 8 + this.floatOffset },
          { x: this.x, y: this.y + 8 + this.floatOffset }
        ];
      default:
        return [
          { x: this.x, y: this.y + this.floatOffset },
          { x: this.x + this.w, y: this.y + this.floatOffset },
          { x: this.x + this.w, y: this.y + this.h + this.floatOffset },
          { x: this.x, y: this.y + this.h + this.floatOffset }
        ];
    }
  }

  public collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean {
    if (this.delegate) {
      return this.delegate.collidesWith(rect);
    }
    const margin = this.type === 'storm' ? 4 : this.type === 'void' ? 3 : 1;
    const box = this.getBoundingBox();
    
    const obstacleBox = {
      x: box.x + margin,
      y: box.y + margin,
      w: box.w - margin * 2,
      h: box.h - margin * 2
    };
    
    return obstacleBox.x < rect.x + rect.w &&
           obstacleBox.x + obstacleBox.w > rect.x &&
           obstacleBox.y < rect.y + rect.h &&
           obstacleBox.y + obstacleBox.h > rect.y;
  }

  public collidesWithCircle(centerX: number, centerY: number, radius: number): boolean {
    if (this.delegate) {
      return this.delegate.collidesWithCircle ? this.delegate.collidesWithCircle(centerX, centerY, radius) : false;
    }
    const box = this.getBoundingBox();
    const obstacleCenterX = box.x + box.w / 2;
    const obstacleCenterY = box.y + box.h / 2;
    const obstacleRadius = Math.sqrt(box.w * box.w + box.h * box.h) / 2;
    
    const dx = centerX - obstacleCenterX;
    const dy = centerY - obstacleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < radius + obstacleRadius;
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.active = true;
    this.rotation = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.particles = [];
    if (this.delegate) {
      this.delegate.reset(x, y);
    }
  }

  public takeDamage(damage: number): boolean {
    if (this.delegate) {
      return this.delegate.takeDamage(damage);
    }
    this.active = false;
    return true;
  }

  public static createRandom(x: number, yRange: { min: number; max: number }, difficultyLevel?: number): Obstacle {
    const types: ObstacleType2[] = ['spike', 'block', 'crystal'];
    
    if (difficultyLevel && difficultyLevel >= 3) types.push('pillar');
    if (difficultyLevel && difficultyLevel >= 5) types.push('watcher');
    if (difficultyLevel && difficultyLevel >= 7) types.push('void');
    if (difficultyLevel && difficultyLevel >= 10) types.push('storm');
    
    const type = types[Math.floor(Math.random() * types.length)];
    const y = Math.floor(Math.random() * (yRange.max - yRange.min + 1)) + yRange.min;
    return new Obstacle(x, y, type);
  }
}
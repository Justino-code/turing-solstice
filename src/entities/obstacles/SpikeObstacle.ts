// src/entities/obstacles/SpikeObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class SpikeObstacle extends BaseObstacle {
  constructor(x: number, y: number, config?: any) {
    const width = 18 + Math.random() * 10;
    const height = 18 + Math.random() * 10;
    super(x, y, 'spike', width, height);
    this.rotation = Math.random() * Math.PI;
  }

  update(speed: number): void {
    this.x -= speed;
    this.pulsePhase += 0.05;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const hw = this.w / 2;
    const hh = this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // Glow
    ctx.shadowColor = 'rgba(231, 76, 60, 0.6)';
    ctx.shadowBlur = 20 * this.glowIntensity;

    // Corpo do espinho
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(hw, hh);
    ctx.lineTo(-hw, hh);
    ctx.closePath();
    ctx.fill();

    // Detalhe brilhante
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.5);
    ctx.lineTo(hw * 0.3, hh * 0.2);
    ctx.lineTo(-hw * 0.3, hh * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  protected getCollisionMargin(): number {
    return 3;
  }

  getColor(): string {
    return '#e74c3c';
  }

  getGlowColor(): string {
    return 'rgba(231, 76, 60, 0.6)';
  }

  getVertices(): { x: number; y: number }[] {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + this.floatOffset;
    const hw = this.w / 2;
    const hh = this.h / 2;
    
    // Rotaciona os vértices
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    
    const vertices = [
      { x: 0, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh }
    ];
    
    return vertices.map(v => ({
      x: cx + v.x * cos - v.y * sin,
      y: cy + v.x * sin + v.y * cos
    }));
  }
}
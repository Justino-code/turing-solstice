// src/entities/obstacles/PillarObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class PillarObstacle extends BaseObstacle {
  constructor(x: number, y: number, config?: any) {
    const width = 20 + Math.random() * 10;
    const height = 50 + Math.random() * 30;
    super(x, y, 'pillar', width, height);
    this.rotationSpeed = 0.01 + Math.random() * 0.03;
  }

  update(speed: number): void {
    this.x -= speed;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.04;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.3 + 0.7;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // Sombra
    ctx.shadowColor = 'rgba(91, 140, 174, 0.6)';
    ctx.shadowBlur = 15 * this.glowIntensity;

    // Corpo do pilar
    const grad = ctx.createLinearGradient(-this.w/2, 0, this.w/2, 0);
    grad.addColorStop(0, '#5b8cae');
    grad.addColorStop(0.3, '#7baecf');
    grad.addColorStop(0.7, '#7baecf');
    grad.addColorStop(1, '#5b8cae');
    ctx.fillStyle = grad;
    ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);

    ctx.shadowBlur = 0;

    // Detalhes verticais
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 4; i++) {
      const px = -this.w/2 + 4 + i * 6;
      ctx.fillRect(px, -this.h/2 + 2, 2, this.h - 4);
    }

    // Base e topo
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-this.w/2 + 2, -this.h/2, this.w - 4, 4);
    ctx.fillRect(-this.w/2 + 2, this.h/2 - 4, this.w - 4, 4);

    // Brilho
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(-this.w/2 + 4, -this.h/2 + 8, 4, this.h - 16);

    // Anéis decorativos
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const yPos = -this.h/2 + 10 + i * (this.h / 4);
      ctx.beginPath();
      ctx.moveTo(-this.w/2 + 3, yPos);
      ctx.lineTo(this.w/2 - 3, yPos);
      ctx.stroke();
    }

    ctx.restore();
  }

  getColor(): string {
    return '#5b8cae';
  }

  getGlowColor(): string {
    return 'rgba(91, 140, 174, 0.6)';
  }
}
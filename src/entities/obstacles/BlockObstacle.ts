// src/entities/obstacles/BlockObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class BlockObstacle extends BaseObstacle {
  constructor(x: number, y: number, config?: any) {
    const width = 25 + Math.random() * 10;
    const height = 25 + Math.random() * 10;
    super(x, y, 'block', width, height);
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  update(speed: number): void {
    this.x -= speed;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.03;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.3 + 0.7;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // Sombra e glow
    ctx.shadowColor = 'rgba(230, 126, 34, 0.6)';
    ctx.shadowBlur = 15 * this.glowIntensity;

    // Gradiente
    const grad = ctx.createLinearGradient(-this.w/2, -this.h/2, this.w/2, this.h/2);
    grad.addColorStop(0, '#f39c12');
    grad.addColorStop(1, '#d35400');
    ctx.fillStyle = grad;
    ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);

    // Borda
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.w/2, -this.h/2, this.w, this.h);

    // Padrão interno
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 3; i++) {
      const lx = -this.w/2 + 5 + i * 8;
      ctx.fillRect(lx, -this.h/2 + 4, 2, this.h - 8);
    }

    // Brilho
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-this.w/2 + 4, -this.h/2 + 4, this.w - 8, 3);

    ctx.restore();
  }

  getColor(): string {
    return '#e67e22';
  }

  getGlowColor(): string {
    return 'rgba(230, 126, 34, 0.6)';
  }
}
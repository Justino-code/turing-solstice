// src/entities/obstacles/WatcherObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class WatcherObstacle extends BaseObstacle {
  // Remove a declaração duplicada de floatOffset

  constructor(x: number, y: number, config?: any) {
    const width = 25 + Math.random() * 10;
    const height = 25 + Math.random() * 10;
    super(x, y, 'watcher', width, height);
    this.floatSpeed = 0.02 + Math.random() * 0.03;
  }

  update(speed: number): void {
    this.x -= speed;
    this.pulsePhase += 0.06;
    this.floatOffset = Math.sin(this.pulsePhase * this.floatSpeed * 10) * 8;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + this.floatOffset;
    const radius = Math.min(this.w, this.h) / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Glow do corpo
    ctx.shadowColor = 'rgba(255, 68, 68, 0.6)';
    ctx.shadowBlur = 20 * this.glowIntensity;

    // Corpo do watcher
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, '#ff6666');
    grad.addColorStop(1, '#cc0000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Olho do watcher
    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;

    // Fundo do olho
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Pupila pulsante
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15 * pulse;
    ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Brilho do olho
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(-3, -3, radius * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Antenas
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      const angle = i * Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.7, Math.sin(angle) * radius * 0.7);
      ctx.lineTo(Math.cos(angle) * radius * 1.3, Math.sin(angle) * radius * 1.3);
      ctx.stroke();

      // Ponta da antena
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * radius * 1.3,
        Math.sin(angle) * radius * 1.3,
        2, 0, Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  getColor(): string {
    return '#ff4444';
  }

  getGlowColor(): string {
    return 'rgba(255, 68, 68, 0.6)';
  }

  getVertices(): { x: number; y: number }[] {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + this.floatOffset;
    const r = Math.min(this.w, this.h) / 2;

    // Aproxima o círculo com um octógono
    const vertices = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      vertices.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r
      });
    }
    return vertices;
  }
}
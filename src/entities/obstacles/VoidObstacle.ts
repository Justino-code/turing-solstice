// src/entities/obstacles/VoidObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class VoidObstacle extends BaseObstacle {
  private particleTimer: number = 0;

  constructor(x: number, y: number, config?: any) {
    const size = 30 + Math.random() * 20;
    super(x, y, 'void', size, size);
    this.rotationSpeed = (Math.random() - 0.5) * 0.03;
    this.particles = [];
  }

  update(speed: number): void {
    this.x -= speed;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.04;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;

    // Partículas
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
        color: '#9b30ff'
      });
    }

    // Atualiza partículas
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const radius = Math.min(this.w, this.h) / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // Glow principal
    ctx.shadowColor = 'rgba(106, 13, 173, 0.8)';
    ctx.shadowBlur = 30 * this.glowIntensity;

    // Corpo escuro
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, '#1a0033');
    grad.addColorStop(0.5, '#0d001a');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Anéis de energia
    const time = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
      const ringRadius = (i + 1) * 8 + Math.sin(time + i) * 3;
      const alpha = 0.1 + Math.sin(time * 1.5 + i * 2) * 0.05 + 0.05;
      ctx.strokeStyle = `rgba(155, 48, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Centro brilhante
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
    glow.addColorStop(0, 'rgba(155, 48, 255, 0.4)');
    glow.addColorStop(1, 'rgba(155, 48, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Partículas
    for (const p of this.particles) {
      const alpha = p.life / 30;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  getColor(): string {
    return '#1a0033';
  }

  getGlowColor(): string {
    return 'rgba(106, 13, 173, 0.8)';
  }

  getVertices(): { x: number; y: number }[] {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
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
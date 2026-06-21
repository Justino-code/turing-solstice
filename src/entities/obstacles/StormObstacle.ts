// src/entities/obstacles/StormObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class StormObstacle extends BaseObstacle {
  private particleTimer: number = 0;

  constructor(x: number, y: number, config?: any) {
    const size = 35 + Math.random() * 20;
    super(x, y, 'storm', size, size);
    this.rotationSpeed = 0.05 + Math.random() * 0.05;
    this.particles = [];
  }

  update(speed: number): void {
    this.x -= speed;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.07;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;

    // Partículas
    this.particleTimer++;
    if (this.particleTimer % 2 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const dist = this.w / 2 + Math.random() * 15;
      this.particles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: Math.cos(angle) * 0.7,
        vy: Math.sin(angle) * 0.7 - 0.2,
        life: 20 + Math.random() * 15,
        color: '#00ffcc'
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

    // Glow
    ctx.shadowColor = 'rgba(0, 255, 204, 0.6)';
    ctx.shadowBlur = 25 * this.glowIntensity;

    // Corpo
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, '#00ffcc');
    grad.addColorStop(0.5, '#00997a');
    grad.addColorStop(1, '#003d33');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Raios elétricos
    const numRays = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 + Date.now() / 2000;
      const length = radius * 0.6 + Math.sin(Date.now() / 300 + i) * 5;
      const x1 = Math.cos(angle) * 4;
      const y1 = Math.sin(angle) * 4;
      const x2 = Math.cos(angle) * length;
      const y2 = Math.sin(angle) * length;

      ctx.strokeStyle = `rgba(0, 255, 200, ${0.2 + Math.sin(Date.now() / 400 + i * 3) * 0.1 + 0.1})`;
      ctx.lineWidth = 2 + Math.sin(Date.now() / 200 + i) * 0.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      // Linha zig-zag
      const segments = 5;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const tx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 6;
        const ty = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 6;
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();

      // Ponta do raio
      ctx.fillStyle = 'rgba(0, 255, 200, 0.3)';
      ctx.beginPath();
      ctx.arc(x2, y2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Núcleo
    const stormGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
    stormGlow.addColorStop(0, 'rgba(0, 255, 200, 0.5)');
    stormGlow.addColorStop(1, 'rgba(0, 255, 200, 0)');
    ctx.fillStyle = stormGlow;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Partículas
    for (const p of this.particles) {
      const alpha = p.life / 20;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  getColor(): string {
    return '#00cc99';
  }

  getGlowColor(): string {
    return 'rgba(0, 255, 204, 0.6)';
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
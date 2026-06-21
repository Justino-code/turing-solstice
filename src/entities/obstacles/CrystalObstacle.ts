// src/entities/obstacles/CrystalObstacle.ts
import { BaseObstacle } from './BaseObstacle';

export class CrystalObstacle extends BaseObstacle {
  constructor(x: number, y: number, config?: any) {
    const width = 25 + Math.random() * 10;
    const height = 30 + Math.random() * 15;
    super(x, y, 'crystal', width, height);
    this.floatSpeed = 0.02 + Math.random() * 0.02;
  }

  update(speed: number): void {
    this.x -= speed;
    this.pulsePhase += 0.05;
    this.floatOffset = Math.sin(this.pulsePhase * this.floatSpeed * 10) * 5;
    this.glowIntensity = Math.sin(this.pulsePhase) * 0.5 + 0.5;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + this.floatOffset;
    const hw = this.w / 2;
    const hh = this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Glow
    ctx.shadowColor = 'rgba(155, 89, 182, 0.6)';
    ctx.shadowBlur = 25 * this.glowIntensity;

    // Corpo do cristal - FORMA DE CRISTAL
    const grad = ctx.createLinearGradient(0, -hh, 0, hh);
    grad.addColorStop(0, '#c39bd3');
    grad.addColorStop(0.5, '#9b59b6');
    grad.addColorStop(1, '#6c3483');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(hw * 0.7, -hh * 0.3);
    ctx.lineTo(hw, hh * 0.1);
    ctx.lineTo(hw * 0.5, hh * 0.5);
    ctx.lineTo(0, hh);
    ctx.lineTo(-hw * 0.5, hh * 0.5);
    ctx.lineTo(-hw, hh * 0.1);
    ctx.lineTo(-hw * 0.7, -hh * 0.3);
    ctx.closePath();
    ctx.fill();

    // Brilho interno
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(-3, -3, this.w * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(2, 2, this.w * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Linhas de cristal (detalhes)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.6);
    ctx.lineTo(hw * 0.3, 0);
    ctx.lineTo(0, hh * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.6);
    ctx.lineTo(-hw * 0.3, 0);
    ctx.lineTo(0, hh * 0.6);
    ctx.stroke();

    ctx.restore();
  }

  getColor(): string {
    return '#9b59b6';
  }

  getGlowColor(): string {
    return 'rgba(155, 89, 182, 0.6)';
  }

  getVertices(): { x: number; y: number }[] {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + this.floatOffset;
    const hw = this.w / 2;
    const hh = this.h / 2;

    return [
      { x: cx, y: cy - hh },
      { x: cx + hw * 0.7, y: cy - hh * 0.3 },
      { x: cx + hw, y: cy + hh * 0.1 },
      { x: cx + hw * 0.5, y: cy + hh * 0.5 },
      { x: cx, y: cy + hh },
      { x: cx - hw * 0.5, y: cy + hh * 0.5 },
      { x: cx - hw, y: cy + hh * 0.1 },
      { x: cx - hw * 0.7, y: cy - hh * 0.3 }
    ];
  }
}
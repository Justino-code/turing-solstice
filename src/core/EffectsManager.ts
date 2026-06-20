// src/core/EffectsManager.ts

export class EffectsManager {
  private effectParticles: any[];
  public enigmaMessage: string;
  public enigmaMessageTimer: number;
  public enigmaMessageColor: string;

  constructor() {
    this.effectParticles = [];
    this.enigmaMessage = '';
    this.enigmaMessageTimer = 0;
    this.enigmaMessageColor = '#fff';
  }

  // Movido de: private showCenterMessage(message: string, color: string = '#fff', duration: number = 60): void
  public showCenterMessage(message: string, color: string = '#fff', duration: number = 60): void {
    this.enigmaMessage = message;
    this.enigmaMessageColor = color;
    this.enigmaMessageTimer = duration;
  }

  // Movido de: private createEffectExplosion(x: number, y: number, color: string, count: number = 30): void
  public createEffectExplosion(x: number, y: number, color: string, count: number = 30): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.effectParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        radius: 2 + Math.random() * 4,
        color: color,
        alpha: 1
      });
    }
  }

  // Atualiza as partículas de efeito
  public update(): void {
    for (const particle of this.effectParticles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.05;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
    }
    this.effectParticles = this.effectParticles.filter(p => p.life > 0);
  }

  // Atualiza o timer da mensagem
  public updateMessage(): void {
    if (this.enigmaMessageTimer > 0) {
      this.enigmaMessageTimer--;
    }
  }

  // Obtém as partículas de efeito
  public getParticles(): any[] {
    return this.effectParticles;
  }

  // Limpa todas as partículas
  public clear(): void {
    this.effectParticles = [];
  }

  // Reseta o estado
  public reset(): void {
    this.effectParticles = [];
    this.enigmaMessage = '';
    this.enigmaMessageTimer = 0;
    this.enigmaMessageColor = '#fff';
  }
}
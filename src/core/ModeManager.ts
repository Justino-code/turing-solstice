// src/core/ModeManager.ts
// Gerencia os modos especiais do jogo

import { GameState } from '../types';
import { UIController } from '../controllers/UIController';

export class ModeManager {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private uiController: UIController;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    uiController: UIController
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.uiController = uiController;
  }

  // ===== ATIVAÇÃO POR TECLA =====

  public handleKeydown(e: KeyboardEvent, state: GameState, hasStarted: boolean): void {
    if (!hasStarted || state.gameOver) return;
    if (state.challengeActive) return;
    
    const key = e.key.toLowerCase();

    if (key === 'h' && state.hardModeUnlocked) {
      this.toggleHardMode(state);
    }

    if (key === 'v' && state.turingVisionUnlocked) {
      this.toggleTuringVision(state);
    }

    if (key === 's' && state.spectrumModeUnlocked) {
      this.toggleSpectrumMode(state);
    }
  }

  // ===== TOGGLES (VERIFICAM DESBLOQUEIO) =====

  public toggleHardMode(state: GameState): void {
    if (!state.hardModeUnlocked) return;
    state.hardMode = !state.hardMode;
    state.turingVision = false;
    state.spectrumMode = false;
    this.uiController.showTimedNotification(
      state.hardMode ? '💀 Hard Mode ATIVADO' : 'Hard Mode DESATIVADO',
      'warning',
      2000
    );
  }

  public toggleTuringVision(state: GameState): void {
    if (!state.turingVisionUnlocked) return;
    state.turingVision = !state.turingVision;
    state.hardMode = false;
    state.spectrumMode = false;
    this.uiController.showTimedNotification(
      state.turingVision ? '👁️ Turing Vision ATIVADO' : 'Turing Vision DESATIVADO',
      'info',
      2000
    );
  }

  public toggleSpectrumMode(state: GameState): void {
    if (!state.spectrumModeUnlocked) return;
    state.spectrumMode = !state.spectrumMode;
    state.hardMode = false;
    state.turingVision = false;
    this.uiController.showTimedNotification(
      state.spectrumMode ? '🎨 Spectrum Mode ATIVADO' : 'Spectrum Mode DESATIVADO',
      'success',
      2000
    );
  }

  // ===== DESBLOQUEIO POR CICLO =====

  public checkUnlocks(state: GameState): void {
    if (state.cycle >= 10 && !state.hardModeUnlocked) {
      state.hardModeUnlocked = true;
      localStorage.setItem('turing-hardmode-unlocked', 'true');
      this.uiController.showTimedNotification('💀 Hard Mode desbloqueado! Pressione H', 'warning', 3000);
    }

    if (state.cycle >= 15 && !state.turingVisionUnlocked) {
      state.turingVisionUnlocked = true;
      localStorage.setItem('turing-vision-unlocked', 'true');
      this.uiController.showTimedNotification('👁️ Turing Vision desbloqueado! Pressione V', 'info', 3000);
    }

    if (state.cycle >= 20 && !state.spectrumModeUnlocked) {
      state.spectrumModeUnlocked = true;
      localStorage.setItem('turing-spectrum-unlocked', 'true');
      this.uiController.showTimedNotification('🎨 Spectrum Mode desbloqueado! Pressione S', 'success', 3000);
    }
  }

  // ===== EFEITOS DE RENDERIZAÇÃO =====

  public renderEffects(state: GameState): void {
    if (state.turingVision) {
      this.renderTuringVision();
    }
    
    if (state.spectrumMode) {
      this.renderSpectrumMode(state);
    }
  }

  private renderTuringVision(): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.08)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < this.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    const time = Date.now() / 100;
    for (let i = 0; i < 30; i++) {
      const x = (i * 35 + time * 15) % this.width;
      const y = (i * 50 + time * 40) % this.height;
      const bit = Math.random() > 0.5 ? '0' : '1';
      ctx.fillText(bit, x, y);
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let y = 0; y < this.height; y += 2) {
      ctx.fillRect(0, y, this.width, 1);
    }
  }

  private renderSpectrumMode(state: GameState): void {
    const ctx = this.ctx;
    const hue = (state.nightProgress * 720) % 360;
    
    const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.15)`);
    grad.addColorStop(0.25, `hsla(${(hue + 90) % 360}, 100%, 60%, 0.15)`);
    grad.addColorStop(0.5, `hsla(${(hue + 180) % 360}, 100%, 60%, 0.15)`);
    grad.addColorStop(0.75, `hsla(${(hue + 270) % 360}, 100%, 60%, 0.15)`);
    grad.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.15)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // ===== EFEITOS DE GAMEPLAY =====

  public getObstacleChanceMultiplier(state: GameState): number {
    return state.hardMode ? 2 : 1;
  }

  public getHealAmount(baseHeal: number, state: GameState): number {
    return state.hardMode ? Math.max(1, Math.floor(baseHeal / 2)) : baseHeal;
  }

  public shouldSpawnDouble(state: GameState): boolean {
    return state.hardMode || Math.random() < 0.15;
  }
}
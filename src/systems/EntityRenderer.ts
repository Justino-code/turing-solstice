// src/systems/EntityRenderer.ts
// Responsável por renderizar entidades do jogo: jogador, obstáculos, orbs, plataformas,
// indicador de pulo e HUD

import { Player, Platform, EnergyOrb, GameState } from '../types';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { COLORS } from '../constants/game';
import { t } from '../utils/i18n';
import { getFontSize } from '../utils/helpers';

export class EntityRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private state: GameState | null = null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setState(state: GameState): void {
    this.state = state;
  }

  // ===== JOGADOR =====

  public renderPlayer(player: Player, isNight: boolean, shakeX: number = 0, shakeY: number = 0): void {
    const ctx = this.ctx;
    const p = player as any;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const wheelRotation = player.grounded ? Date.now() / 80 : Date.now() / 150;
    const bobY = player.grounded ? Math.abs(Math.sin(wheelRotation / 4)) * 1.5 : 0;

    // === CORPO PRINCIPAL ===
    ctx.save();
    const bodyX = p.x;
    const bodyY = p.y + bobY - 6;
    const bodyW = p.w;
    const bodyH = p.h - 6;

    ctx.shadowColor = isNight ? 'rgba(100,200,255,0.3)' : 'rgba(255,200,50,0.2)';
    ctx.shadowBlur = 20;

    const gradient = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
    if (isNight) {
      gradient.addColorStop(0, '#4a8ab5');
      gradient.addColorStop(0.5, '#2a6a8a');
      gradient.addColorStop(1, '#1a4a6a');
    } else {
      gradient.addColorStop(0, '#f0c060');
      gradient.addColorStop(0.5, '#e0a040');
      gradient.addColorStop(1, '#c08030');
    }
    ctx.fillStyle = gradient;

    const radius = 6;
    ctx.beginPath();
    ctx.moveTo(bodyX + radius, bodyY);
    ctx.lineTo(bodyX + bodyW - radius, bodyY);
    ctx.quadraticCurveTo(bodyX + bodyW, bodyY, bodyX + bodyW, bodyY + radius);
    ctx.lineTo(bodyX + bodyW, bodyY + bodyH - radius);
    ctx.quadraticCurveTo(bodyX + bodyW, bodyY + bodyH, bodyX + bodyW - radius, bodyY + bodyH);
    ctx.lineTo(bodyX + radius, bodyY + bodyH);
    ctx.quadraticCurveTo(bodyX, bodyY + bodyH, bodyX, bodyY + bodyH - radius);
    ctx.lineTo(bodyX, bodyY + radius);
    ctx.quadraticCurveTo(bodyX, bodyY, bodyX + radius, bodyY);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = isNight ? 'rgba(100,200,255,0.2)' : 'rgba(200,150,50,0.2)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(bodyX + 4, bodyY + 6);
    ctx.lineTo(bodyX + bodyW - 4, bodyY + 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bodyX + 4, bodyY + bodyH - 6);
    ctx.lineTo(bodyX + bodyW - 4, bodyY + bodyH - 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bodyX + bodyW / 2, bodyY + 8);
    ctx.lineTo(bodyX + bodyW / 2, bodyY + bodyH - 8);
    ctx.stroke();

    const screwColor = isNight ? 'rgba(150,200,255,0.3)' : 'rgba(150,100,50,0.3)';
    ctx.fillStyle = screwColor;
    const screwPositions = [
      [bodyX + 4, bodyY + 4],
      [bodyX + bodyW - 4, bodyY + 4],
      [bodyX + 4, bodyY + bodyH - 4],
      [bodyX + bodyW - 4, bodyY + bodyH - 4]
    ];
    for (const pos of screwPositions) {
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const ledColor = isNight ? '#66ddff' : '#ffcc44';
    const ledPulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    const ledGlow = ctx.createRadialGradient(
      bodyX + bodyW / 2, bodyY + 12, 1,
      bodyX + bodyW / 2, bodyY + 12, 8
    );
    ledGlow.addColorStop(0, isNight ? `rgba(100,220,255,${0.6 * ledPulse})` : `rgba(255,200,50,${0.6 * ledPulse})`);
    ledGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = ledGlow;
    ctx.beginPath();
    ctx.arc(bodyX + bodyW / 2, bodyY + 12, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ledColor;
    ctx.shadowColor = isNight ? '#66ddff' : '#ffcc44';
    ctx.shadowBlur = 10 * ledPulse;
    ctx.beginPath();
    ctx.arc(bodyX + bodyW / 2, bodyY + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

    // === CABEÇA ===
    ctx.save();
    const headBob = player.grounded ? Math.sin(Date.now() / 250) * 1.2 : 0;
    const headX = p.x - 2;
    const headY = p.y - 10 + headBob + bobY - 6;
    const headW = 24;
    const headH = 14;

    ctx.shadowColor = isNight ? 'rgba(100,200,255,0.2)' : 'rgba(255,200,50,0.2)';
    ctx.shadowBlur = 15;

    const headGrad = ctx.createLinearGradient(headX, headY, headX, headY + headH);
    if (isNight) {
      headGrad.addColorStop(0, '#5a9ac5');
      headGrad.addColorStop(1, '#3a7a9a');
    } else {
      headGrad.addColorStop(0, '#f5d070');
      headGrad.addColorStop(1, '#e0b050');
    }
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.moveTo(headX + 4, headY);
    ctx.lineTo(headX + headW - 4, headY);
    ctx.quadraticCurveTo(headX + headW, headY, headX + headW, headY + 4);
    ctx.lineTo(headX + headW, headY + headH - 2);
    ctx.quadraticCurveTo(headX + headW - 2, headY + headH, headX + headW - 6, headY + headH);
    ctx.lineTo(headX + 6, headY + headH);
    ctx.quadraticCurveTo(headX + 2, headY + headH, headX, headY + headH - 2);
    ctx.lineTo(headX, headY + 4);
    ctx.quadraticCurveTo(headX, headY, headX + 4, headY);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = isNight ? '#88ccff' : '#ddaa55';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headX + headW - 4, headY + 2);
    ctx.lineTo(headX + headW + 3, headY - 5);
    ctx.stroke();

    const antennaPulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.fillStyle = isNight ? '#66ddff' : '#ffcc44';
    ctx.shadowColor = isNight ? '#66ddff' : '#ffcc44';
    ctx.shadowBlur = 8 * antennaPulse;
    ctx.beginPath();
    ctx.arc(headX + headW + 3, headY - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const eyeX = headX + headW - 6;
    const eyeY = headY + 4;

    const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 1, eyeX, eyeY, 6);
    eyeGlow.addColorStop(0, isNight ? 'rgba(100,220,255,0.5)' : 'rgba(255,255,200,0.5)');
    eyeGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();

    const eyeColor = isNight ? '#88ddff' : '#ffee88';
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = isNight ? '#88ddff' : '#ffee88';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(eyeX + 1.5, eyeY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === RODA ===
    ctx.save();
    const wheelX = p.x + p.w / 2;
    const wheelY = p.y + p.h + bobY - 6;
    const wheelRadius = 12;

    ctx.shadowColor = isNight ? 'rgba(100,200,255,0.2)' : 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 15;

    const wheelGrad = ctx.createRadialGradient(wheelX - 3, wheelY - 3, 2, wheelX, wheelY, wheelRadius);
    if (isNight) {
      wheelGrad.addColorStop(0, '#4a4a5a');
      wheelGrad.addColorStop(0.7, '#2a2a3a');
      wheelGrad.addColorStop(1, '#1a1a2a');
    } else {
      wheelGrad.addColorStop(0, '#5a5a6a');
      wheelGrad.addColorStop(0.7, '#3a3a4a');
      wheelGrad.addColorStop(1, '#2a2a3a');
    }
    ctx.fillStyle = wheelGrad;
    ctx.beginPath();
    ctx.arc(wheelX, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = isNight ? 'rgba(150,200,255,0.3)' : 'rgba(200,180,150,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wheelX, wheelY, wheelRadius - 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(wheelX, wheelY);
    ctx.rotate(wheelRotation);
    ctx.strokeStyle = isNight ? 'rgba(150,200,255,0.25)' : 'rgba(200,180,150,0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 4, Math.sin(angle) * 4);
      ctx.lineTo(Math.cos(angle) * (wheelRadius - 4), Math.sin(angle) * (wheelRadius - 4));
      ctx.stroke();
    }

    ctx.fillStyle = isNight ? 'rgba(150,200,255,0.4)' : 'rgba(200,180,150,0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = isNight ? 'rgba(200,230,255,0.15)' : 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(wheelX - 4, wheelY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    const hoverGlow = ctx.createRadialGradient(wheelX, wheelY + wheelRadius + 2, 2, wheelX, wheelY + wheelRadius + 2, 15);
    hoverGlow.addColorStop(0, isNight ? 'rgba(100,200,255,0.15)' : 'rgba(255,200,50,0.1)');
    hoverGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hoverGlow;
    ctx.beginPath();
    ctx.arc(wheelX, wheelY + wheelRadius + 2, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // === BRAÇOS ===
    ctx.save();
    const armSwing = player.grounded ? Math.sin(Date.now() / 150) * 0.3 : 0;

    ctx.save();
    ctx.translate(p.x + p.w - 2, p.y + 6 + bobY - 6);
    ctx.rotate(0.3 + armSwing);
    ctx.fillStyle = isNight ? '#3a7a9a' : '#d0a050';
    ctx.fillRect(0, 0, 4, 10);
    ctx.fillStyle = isNight ? '#4a8aaa' : '#dab060';
    ctx.fillRect(-1, 10, 6, 3);
    ctx.restore();

    ctx.save();
    ctx.translate(p.x - 1, p.y + 6 + bobY - 6);
    ctx.rotate(-0.3 - armSwing);
    ctx.fillStyle = isNight ? '#3a7a9a' : '#d0a050';
    ctx.fillRect(0, 0, 4, 10);
    ctx.fillStyle = isNight ? '#4a8aaa' : '#dab060';
    ctx.fillRect(-1, 10, 6, 3);
    ctx.restore();

    ctx.restore();

    // === EFEITOS ===
    if (player.grounded && this.state && this.state.speed > 6) {
      const trailAlpha = Math.min(0.1, (this.state.speed - 6) * 0.02);
      ctx.globalAlpha = trailAlpha;
      const trailColor = isNight ? 'rgba(100,200,255,0.15)' : 'rgba(255,200,50,0.15)';
      ctx.fillStyle = trailColor;
      for (let i = 1; i <= 4; i++) {
        const trailX = p.x - i * (6 + this.state.speed * 0.2);
        ctx.fillRect(trailX, p.y + p.h - 4, 3, 3);
      }
      ctx.globalAlpha = 1;
    }

    if (player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (player.grounded) {
      const ringPulse = Math.sin(Date.now() / 300) * 2 + 16;
      ctx.strokeStyle = isNight ? `rgba(100,200,255,${0.06 + Math.sin(Date.now() / 300) * 0.02})` : `rgba(255,200,50,${0.06 + Math.sin(Date.now() / 300) * 0.02})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + p.h + 2, ringPulse, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ===== PLATAFORMA =====

  public renderPlatform(platform: Platform, isNight: boolean): void {
    const ctx = this.ctx;
    const color = platform.getColor(isNight);
    const alpha = platform.getAlpha();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = isNight ? 'rgba(100,150,255,0.3)' : 'rgba(200,200,255,0.2)';
    ctx.shadowBlur = 15;

    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(platform.x + radius, platform.y);
    ctx.lineTo(platform.x + platform.w - radius, platform.y);
    ctx.quadraticCurveTo(platform.x + platform.w, platform.y, platform.x + platform.w, platform.y + radius);
    ctx.lineTo(platform.x + platform.w, platform.y + platform.h - radius);
    ctx.quadraticCurveTo(platform.x + platform.w, platform.y + platform.h, platform.x + platform.w - radius, platform.y + platform.h);
    ctx.lineTo(platform.x + radius, platform.y + platform.h);
    ctx.quadraticCurveTo(platform.x, platform.y + platform.h, platform.x, platform.y + platform.h - radius);
    ctx.lineTo(platform.x, platform.y + radius);
    ctx.quadraticCurveTo(platform.x, platform.y, platform.x + radius, platform.y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = isNight ? 'rgba(100,200,255,0.1)' : 'rgba(255,255,255,0.1)';
    ctx.fillRect(platform.x + 5, platform.y + 1, platform.w - 10, 3);

    ctx.globalAlpha = 1;
  }

  // ===== OBSTÁCULO - DELEGA A RENDERIZAÇÃO PARA O PRÓPRIO OBSTÁCULO =====
  // Mudança: Obstacle → BaseObstacle

  public renderObstacle(obstacle: BaseObstacle): void {
    // Cada obstáculo é responsável por sua própria renderização
    // Isso permite que cada tipo de obstáculo tenha sua própria lógica de desenho
    obstacle.render(this.ctx);
  }

  // ===== ORB DE ENERGIA =====

  public renderEnergyOrb(orb: EnergyOrb): void {
    if (orb.collected) return;

    const ctx = this.ctx;
    const alpha = orb.getAlpha();
    const glowSize = orb.getGlowSize();

    ctx.globalAlpha = alpha;

    const grad = ctx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, glowSize);
    grad.addColorStop(0, 'rgba(247, 220, 111, 0.6)');
    grad.addColorStop(0.5, 'rgba(247, 220, 111, 0.2)');
    grad.addColorStop(1, 'rgba(247, 220, 111, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = COLORS.ENERGY_ORB;
    ctx.shadowBlur = 25;

    const grad2 = ctx.createRadialGradient(orb.x - 2, orb.y - 2, 1, orb.x, orb.y, orb.radius);
    grad2.addColorStop(0, '#fff8e0');
    grad2.addColorStop(0.3, '#f7dc6f');
    grad2.addColorStop(1, '#f0b030');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ===== INDICADOR DE PULO =====

  public renderJumpIndicator(player: Player, hasStarted: boolean): void {
    if (!hasStarted) return;

    const ctx = this.ctx;
    const p = player;
    
    const fontSize = getFontSize(this.width, 9);
    const jumpsLeft = 2 - player.jumpCount;
    
    if (jumpsLeft > 0 && !player.grounded) {
      const bx = getFontSize(this.width, 5);
      const by = getFontSize(this.width, 22);
      const bw = getFontSize(this.width, 30);
      const bh = getFontSize(this.width, 12);
      const br = getFontSize(this.width, 6);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      // @ts-ignore - roundRect pode não estar disponível em todos os navegadores
      ctx.roundRect(p.x - bx, p.y - by, bw, bh, br);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = `${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`🦘 x${jumpsLeft}`, p.x + getFontSize(this.width, 10), p.y - getFontSize(this.width, 16));
    }
  }

  // ===== HUD =====

  public renderHUD(state: GameState, speedProgress: number, difficultyLevel: number, hasStarted: boolean): void {
    if (!hasStarted) return;

    const ctx = this.ctx;
    const level = difficultyLevel + 1;
    
    const hudFontSize = getFontSize(this.width, 14);
    const hudSmallFontSize = getFontSize(this.width, 11);
    const boxW = getFontSize(this.width, 130);
    const boxH = getFontSize(this.width, 50);
    const boxX = getFontSize(this.width, 10);
    const boxY = getFontSize(this.width, 10);
    const boxR = getFontSize(this.width, 10);

    // Fundo do HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    // @ts-ignore - roundRect pode não estar disponível em todos os navegadores
    ctx.roundRect(boxX, boxY, boxW, boxH, boxR);
    ctx.fill();

    // Nível
    const colors = ['#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#f44336', '#9C27B0'];
    const color = colors[Math.min(level - 1, colors.length - 1)];
    ctx.fillStyle = color;
    ctx.font = `bold ${hudFontSize}px "Courier New", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`${t('hud.level')} ${level}`, boxX + getFontSize(this.width, 10), boxY + hudFontSize + getFontSize(this.width, 4));

    // Velocidade
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `${hudSmallFontSize}px "Courier New", monospace`;
    ctx.fillText(`🚀 ${state.speed.toFixed(1)}`, boxX + getFontSize(this.width, 10), boxY + hudFontSize + hudSmallFontSize + getFontSize(this.width, 8));

    // Barra de progresso
    const progressX = boxX + getFontSize(this.width, 65);
    const progressY = boxY + getFontSize(this.width, 28);
    const progressW = getFontSize(this.width, 45);
    const progressH = getFontSize(this.width, 4);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(progressX, progressY, progressW, progressH);

    ctx.fillStyle = color;
    ctx.fillRect(progressX, progressY, progressW * speedProgress, progressH);

    // ===== INDICADOR DE MODO ATIVO =====
    if (state.hardMode || state.turingVision || state.spectrumMode) {
      const modeFontSize = getFontSize(this.width, 10);
      const modeY = boxY + boxH + getFontSize(this.width, 5);
      const modeH = getFontSize(this.width, 18);
      
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      // @ts-ignore - roundRect pode não estar disponível em todos os navegadores
      ctx.roundRect(boxX, modeY, boxW, modeH, getFontSize(this.width, 6));
      ctx.fill();
      
      ctx.font = `bold ${modeFontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      
      if (state.hardMode) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('💀 HARD MODE', boxX + boxW / 2, modeY + getFontSize(this.width, 13));
      } else if (state.turingVision) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('👁️ TURING VISION', boxX + boxW / 2, modeY + getFontSize(this.width, 13));
      } else if (state.spectrumMode) {
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('🎨 SPECTRUM', boxX + boxW / 2, modeY + getFontSize(this.width, 13));
      }
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
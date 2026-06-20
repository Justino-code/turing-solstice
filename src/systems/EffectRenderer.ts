// src/systems/EffectRenderer.ts
// Responsável por renderizar partículas, overlay de desafio, game over, efeitos,
// tela inicial e overlay de enigma

import { Particle, GameState, Challenge } from '../types';
import { t } from '../utils/i18n';
import { getFontSize } from '../utils/helpers';
import { RankingService } from '../services/RankingService';

export class EffectRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  // ===== PARTÍCULAS =====

  public renderParticles(particles: Particle[]): void {
    const ctx = this.ctx;
    for (const particle of particles) {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ===== OVERLAY DE DESAFIO =====

  public renderChallengeOverlay(challenge: Challenge, answered: boolean, isCorrect: boolean | null): void {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 0;

    const topY = getFontSize(this.width, 80);
    const boxHeight = getFontSize(this.width, 140);
    const boxX = getFontSize(this.width, 60);
    const boxW = this.width - boxX * 2;
    const boxY = topY;
    const boxH = boxHeight;

    ctx.strokeStyle = answered ?
      (isCorrect ? 'rgba(46,204,113,0.6)' : 'rgba(231,76,60,0.6)') :
      'rgba(100,200,255,0.4)';
    ctx.lineWidth = 2;
    ctx.shadowColor = answered ?
      (isCorrect ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)') :
      'rgba(100,200,255,0.2)';
    ctx.shadowBlur = getFontSize(this.width, 15);

    ctx.fillStyle = 'rgba(10,15,30,0.85)';
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, getFontSize(this.width, 12));
    ctx.fill();
    ctx.shadowBlur = getFontSize(this.width, 15);
    ctx.strokeStyle = 'rgba(100,200,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, getFontSize(this.width, 12));
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#8e9bb5';
    const smallFont = getFontSize(this.width, 13);
    ctx.font = `${smallFont}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('╔═══ SOL-ENIGMA ═══╗', this.width / 2, boxY + getFontSize(this.width, 22));

    ctx.fillStyle = '#b7cdff';
    const bigFont = getFontSize(this.width, 18);
    ctx.font = `bold ${bigFont}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(challenge.pattern, this.width / 2, boxY + getFontSize(this.width, 55));

    ctx.fillStyle = '#a0b0d0';
    const midFont = getFontSize(this.width, 14);
    ctx.font = `${midFont}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(challenge.question, this.width / 2, boxY + getFontSize(this.width, 80));

    const optionLabels = ['A', 'B', 'C', 'D'];
    const optFont = getFontSize(this.width, 13);
    ctx.font = `${optFont}px "Courier New", monospace`;
    const optionStartX = (this.width - getFontSize(this.width, 360)) / 2;
    
    for (let i = 0; i < challenge.options.length && i < 4; i++) {
      const x = optionStartX + i * getFontSize(this.width, 90);
      const y = boxY + getFontSize(this.width, 105);

      const isSelected = answered && i === challenge.correctIndex;
      ctx.fillStyle = isSelected ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(x - getFontSize(this.width, 5), y - getFontSize(this.width, 5), 
        getFontSize(this.width, 80), getFontSize(this.width, 22), getFontSize(this.width, 6));
      ctx.fill();

      ctx.fillStyle = isSelected ? '#2ecc71' : '#d6e2ff';
      ctx.textAlign = 'left';
      ctx.fillText(`${optionLabels[i]}. ${challenge.options[i]}`, x + getFontSize(this.width, 5), y + getFontSize(this.width, 14));
    }

    if (answered) {
      ctx.textAlign = 'center';
      ctx.font = `bold ${smallFont}px "Courier New", monospace`;
      if (isCorrect) {
        ctx.fillStyle = '#2ecc71';
        ctx.fillText(t('enigma.code_deciphered'), this.width / 2, boxY + boxH - getFontSize(this.width, 10));
      } else {
        ctx.fillStyle = '#e74c3c';
        ctx.fillText(t('enigma.code_incorrect'), this.width / 2, boxY + boxH - getFontSize(this.width, 10));
      }
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(100,200,255,0.3)';
      ctx.font = `${getFontSize(this.width, 11)}px "Courier New", monospace`;
      ctx.fillText(t('enigma.select_option'), this.width / 2, boxY + boxH - getFontSize(this.width, 10));
    }

    ctx.shadowBlur = 0;
  }

  // ===== GAME OVER =====

  public renderGameOver(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(255,0,0,${0.02 + i * 0.02})`;
      const offset = (i - 1) * getFontSize(this.width, 5);
      ctx.fillRect(0, 0 + offset, this.width, 2);
    }

    // Título Game Over
    ctx.fillStyle = '#f0a0a0';
    const titleFont = getFontSize(this.width, 30);
    ctx.font = `bold ${titleFont}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = getFontSize(this.width, 30);
    ctx.fillText(t('gameover.title'), this.width / 2, this.height / 2 - getFontSize(this.width, 80));
    ctx.shadowBlur = 0;

    // Info
    const infoFont = getFontSize(this.width, 14);
    ctx.font = `${infoFont}px "Courier New", monospace`;
    ctx.fillStyle = '#b0c0d0';
    ctx.fillText(`${t('gameover.cycles')}: ${state.cycle}  •  ${t('gameover.points')}: ${Math.floor(state.score)}`, 
      this.width / 2, this.height / 2 - getFontSize(this.width, 55));

    // Restart
    const restartFont = getFontSize(this.width, 12);
    ctx.fillStyle = '#8e9bb5';
    ctx.font = `${restartFont}px "Courier New", monospace`;
    ctx.fillText(t('gameover.restart'), this.width / 2, this.height / 2 - getFontSize(this.width, 35));

    // ===== RANKING PESSOAL =====
    const topScores = RankingService.getTopScores(5);
    if (topScores.length > 0) {
      const rankFont = getFontSize(this.width, 9);
      const rankStartY = this.height / 2 - getFontSize(this.width, 10);
      const rankLineH = getFontSize(this.width, 14);
      
      // Título do ranking
      ctx.fillStyle = '#f1c40f';
      ctx.font = `bold ${getFontSize(this.width, 11)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('🏆 MELHORES SCORES', this.width / 2, rankStartY);
      
      ctx.font = `${rankFont}px "Courier New", monospace`;
      
      topScores.forEach((entry, i) => {
        const y = rankStartY + rankLineH + i * rankLineH;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
        
        ctx.fillStyle = i === 0 ? '#f1c40f' : i === 1 ? '#bdc3c7' : i === 2 ? '#e67e22' : '#8e9bb5';
        
        let modeIcon = '';
        if (entry.mode === 'hard') modeIcon = '💀';
        else if (entry.mode === 'vision') modeIcon = '👁️';
        else if (entry.mode === 'spectrum') modeIcon = '🎨';
        
        ctx.fillText(
          `${medal} ${entry.score} pts - C${entry.cycle} ${modeIcon}`, 
          this.width / 2, 
          y
        );
      });
    }
  }

  // ===== EFEITO PRISM =====

  public renderPrismEffect(progress: number): void {
    const ctx = this.ctx;
    const hue = (progress * 360) % 360;

    const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.05)`);
    grad.addColorStop(0.33, `hsla(${(hue + 120) % 360}, 80%, 60%, 0.05)`);
    grad.addColorStop(0.66, `hsla(${(hue + 240) % 360}, 80%, 60%, 0.05)`);
    grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0.05)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // ===== TELA INICIAL =====

  public renderStartScreen(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#fff';
    const titleFont = getFontSize(this.width, 28);
    ctx.font = `bold ${titleFont}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(t('start.title'), this.width / 2, this.height / 2 - getFontSize(this.width, 50));

    const subFont = getFontSize(this.width, 15);
    ctx.font = `${subFont}px "Courier New", monospace`;
    ctx.fillStyle = '#8e9bb5';
    ctx.fillText(t('start.subtitle'), this.width / 2, this.height / 2 + getFontSize(this.width, 15));

    const hintFont = getFontSize(this.width, 11);
    ctx.font = `${hintFont}px "Courier New", monospace`;
    ctx.fillStyle = '#6a7a8a';
    ctx.fillText(t('start.double_jump'), this.width / 2, this.height / 2 + getFontSize(this.width, 50));
  }

  // ===== OVERLAY DE ENIGMA (MENSAGENS DA IA) =====

  public renderEnigmaOverlay(
    state: GameState,
    enigmaOverlayAlpha: number,
    enigmaMessage: string,
    enigmaMessageTimer: number,
    enigmaMessageColor: string
  ): void {
    const ctx = this.ctx;

    if (enigmaOverlayAlpha > 0 || enigmaMessageTimer > 0) {
      ctx.fillStyle = `rgba(0,0,0,${enigmaOverlayAlpha * 0.7})`;
      ctx.fillRect(0, 0, this.width, this.height);

      if (enigmaMessage) {
        const alpha = Math.min(1, enigmaMessageTimer / 30);
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = getFontSize(this.width, 15);
        const msgFont = getFontSize(this.width, 18);
        ctx.font = `bold ${msgFont}px "Courier New", monospace`;
        ctx.fillStyle = enigmaMessageColor;
        ctx.fillText(enigmaMessage, this.width / 2, this.height / 2 - getFontSize(this.width, 40));
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      if (state.challengeActive && state.challengeData) {
        const enigma = state.challengeData;
        const options = enigma.options;

        ctx.fillStyle = '#fff';
        const questionFont = getFontSize(this.width, 16);
        ctx.font = `${questionFont}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = getFontSize(this.width, 10);
        ctx.fillText(`❓ ${enigma.question}`, this.width / 2, this.height / 2 + getFontSize(this.width, 20));

        const optionLabels = ['A', 'B', 'C', 'D'];
        const optionColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
        const optW = getFontSize(this.width, 90);
        const optH = getFontSize(this.width, 35);
        const startX = (this.width - (options.length * getFontSize(this.width, 110))) / 2 + getFontSize(this.width, 55);

        for (let i = 0; i < options.length; i++) {
          const x = startX + i * getFontSize(this.width, 110);
          const y = this.height / 2 + getFontSize(this.width, 70);

          ctx.fillStyle = 'rgba(30,40,60,0.8)';
          ctx.shadowBlur = getFontSize(this.width, 8);
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          ctx.roundRect(x - getFontSize(this.width, 45), y - getFontSize(this.width, 17), 
            optW, optH, getFontSize(this.width, 8));
          ctx.fill();

          ctx.strokeStyle = optionColors[i % optionColors.length];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(x - getFontSize(this.width, 45), y - getFontSize(this.width, 17), 
            optW, optH, getFontSize(this.width, 8));
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          const optFont = getFontSize(this.width, 14);
          ctx.font = `${optFont}px "Courier New", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${optionLabels[i]}: ${options[i]}`, x, y);
        }
        ctx.shadowBlur = 0;
      }
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
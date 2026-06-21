// src/controllers/UIController.ts
// Controlador da interface do usuário - gerencia lógica e eventos

import { t, getLanguage, setLanguage, Language } from '../utils/i18n';
import { RankingService, ScoreEntry } from '../services/RankingService';
import { GlobalRankingService, GlobalScoreEntry } from '../services/GlobalRankingService';
import { AudioSystem } from '../systems/AudioSystem';
import { UIView } from '../views/UIView';

export class UIController {
  private view: UIView;
  private onStartCallback: (() => void) | null = null;
  private onPauseToggle: ((paused: boolean) => void) | null = null;
  private currentRankingTab: 'personal' | 'global' = 'personal';
  private audioSystem: AudioSystem | null = null;

  constructor(appId: string = 'app') {
    this.view = new UIView(appId);

    this.setupLanguageButton();
    this.setupStartMobileButton();
    this.setupRankingButtons();
    this.setupPauseButton();
    this.setupMobilePause();
    this.view.refreshUITexts(getLanguage());
    this.view.resizeCanvas();

    window.addEventListener('resize', () => this.view.resizeCanvas());
  }

  // ===== MÉTODOS DE ACESSO =====
  public getCanvasSize(): { width: number; height: number } {
    return this.view.getCanvasSize();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.view.getCanvas();
  }

  public getRestartButton(): HTMLElement {
    return this.view.getRestartButton();
  }

  public getNotification(): HTMLElement {
    return this.view.getNotification();
  }

  public getCodeDisplay(): HTMLElement {
    return this.view.getCodeDisplay();
  }

  public getOptionButtons(): HTMLElement[] {
    return this.view.getOptionButtons();
  }

  // ===== CALLBACKS =====
  public onStartClick(callback: () => void): void {
    this.onStartCallback = callback;
  }

  // ===== ÁUDIO =====
  public setAudioSystem(audioSystem: AudioSystem): void {
    this.audioSystem = audioSystem;
    this.setupVolumeButton();
  }

  private setupVolumeButton(): void {
    const volumeBtn = document.getElementById('volume-btn');
    if (!volumeBtn) return;

    let muted = false;
    volumeBtn.addEventListener('click', () => {
      muted = !muted;
      if (this.audioSystem) {
        this.audioSystem.toggleMute();
      }
      volumeBtn.textContent = muted ? '🔇' : '🔊';
      volumeBtn.title = muted ? 'Ativar som' : 'Desativar som';
    });
  }

  // ===== PAUSE =====
  private setupPauseButton(): void {
    this.view.pauseBtn.addEventListener('click', () => {
      this.togglePause();
    });

    this.view.pauseResumeBtn.addEventListener('click', () => {
      this.togglePause();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.view.pauseBtn.classList.contains('visible')) {
          this.togglePause();
        }
      }
    });
  }

  private setupMobilePause(): void {
    let lastTap = 0;
    this.view.canvas.addEventListener('touchend', (e) => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        if (this.view.pauseBtn.classList.contains('visible')) {
          this.togglePause();
        }
        e.preventDefault();
      }
      lastTap = currentTime;
    });
  }

  public togglePause(): void {
    this.view.togglePause();
    if (this.onPauseToggle) {
      this.onPauseToggle(this.view.isPaused);
    }
  }

  public setPauseCallback(callback: (paused: boolean) => void): void {
    this.onPauseToggle = callback;
  }

  public showPauseOverlay(): void {
    this.view.showPauseOverlay();
    if (this.onPauseToggle) {
      this.onPauseToggle(true);
    }
  }

  public hidePauseOverlay(): void {
    this.view.hidePauseOverlay();
    if (this.onPauseToggle) {
      this.onPauseToggle(false);
    }
  }

  public updatePauseButtonVisibility(visible: boolean): void {
    this.view.updatePauseButtonVisibility(visible);
    if (!visible && this.view.isPaused) {
      this.view.hidePauseOverlay();
      if (this.onPauseToggle) {
        this.onPauseToggle(false);
      }
    }
  }

  // ===== PROMPT CUSTOMIZADO =====
  public showNamePrompt(
    currentName: string,
    onConfirm: (name: string) => void,
    onCancel: () => void
  ): void {
    this.view.showNamePrompt(currentName, onConfirm, onCancel);
  }

  public async promptPlayerName(currentName: string): Promise<string | null> {
    return new Promise((resolve) => {
      this.view.showNamePrompt(
        currentName,
        (name) => resolve(name),
        () => resolve(null)
      );
    });
  }

  // ===== RANKING =====
  private setupRankingButtons(): void {
    this.view.rankingButton?.addEventListener('click', () => {
      if (this.view.pauseBtn.classList.contains('visible') && !this.view.isPaused) {
        this.togglePause();
      }
      this.showRankingScreen();
    });

    this.view.rankingBackButton?.addEventListener('click', () => {
      this.hideRankingScreen();
      if (this.view.isPaused && this.view.pauseBtn.classList.contains('visible')) {
        this.togglePause();
      }
    });

    this.view.tabPersonal.addEventListener('click', () => {
      this.currentRankingTab = 'personal';
      this.view.updateTabStyles('personal');
      this.loadRanking();
    });

    this.view.tabGlobal.addEventListener('click', () => {
      this.currentRankingTab = 'global';
      this.view.updateTabStyles('global');
      this.loadRanking();
    });
  }

  private showRankingScreen(): void {
    this.view.showRankingScreen();
    this.loadRanking();
  }

  private hideRankingScreen(): void {
    this.view.hideRankingScreen();
  }

  private loadRanking(): void {
    if (this.currentRankingTab === 'personal') {
      this.loadPersonalRanking();
    } else {
      this.loadGlobalRanking();
    }
  }

  private loadPersonalRanking(): void {
    const scores = RankingService.getScores();
    const html = this.buildRankingHTML(scores, 'personal');
    this.view.renderRankingList(html);
  }

  private async loadGlobalRanking(): Promise<void> {
    this.view.renderRankingList(`<div style="color:#8e9bb5;text-align:center;padding:20px;font-family:'Courier New',monospace;">${t('ranking.loading')}</div>`);

    if (!GlobalRankingService.isConfigured()) {
      this.view.renderRankingList(`<div style="color:#e67e22;text-align:center;padding:20px;font-family:'Courier New',monospace;">⚠️ ${t('ranking.not_configured')}</div>`);
      return;
    }

    try {
      const scores = await GlobalRankingService.getGlobalScores();
      const html = this.buildRankingHTML(scores, 'global');
      this.view.renderRankingList(html);
    } catch (error) {
      this.view.renderRankingList(`<div style="color:#e74c3c;text-align:center;padding:20px;font-family:'Courier New',monospace;">⚠️ ${t('ranking.unavailable')}</div>`);
    }
  }

  private buildRankingHTML(scores: (ScoreEntry | GlobalScoreEntry)[], type: 'personal' | 'global'): string {
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return `<div style="color:#8e9bb5;text-align:center;padding:20px;font-family:'Courier New',monospace;">${t('ranking.empty')}</div>`;
    }

    const validScores = scores.filter(e => e && typeof e.score === 'number');
    if (validScores.length === 0) {
      return `<div style="color:#8e9bb5;text-align:center;padding:20px;font-family:'Courier New',monospace;">${t('ranking.empty')}</div>`;
    }

    let html = '';
    validScores.forEach((entry, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      const pos = medal || `#${i + 1}`;
      const color = i === 0 ? '#f1c40f' : i === 1 ? '#bdc3c7' : i === 2 ? '#e67e22' : '#8e9bb5';

      let modeIcon = '';
      if (entry.mode === 'hard') modeIcon = '💀';
      else if (entry.mode === 'vision') modeIcon = '👁️';
      else if (entry.mode === 'spectrum') modeIcon = '🎨';

      const playerName = (entry as any).player && (entry as any).player !== 'Anônimo'
        ? `<span style="color:#6a7a8a;font-size:0.85em;">${(entry as any).player}</span>`
        : '';

      const score = entry.score || 0;
      const cycle = entry.cycle || 0;
      const date = entry.date || '';

      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.05);font-family:'Courier New',monospace;font-size:clamp(10px,1.5vw,12px);">
          <span style="color:${color};width:30px;text-align:center;">${pos}</span>
          <span style="color:#d6e2ff;flex:1;display:flex;justify-content:space-between;padding:0 8px;">
            <span style="color:#8e9bb5;font-size:0.9em;">${playerName}</span>
            <span style="font-weight:bold;">${score} pts</span>
          </span>
          <span style="color:#8e9bb5;width:35px;text-align:center;">C${cycle}</span>
          <span style="width:25px;text-align:center;">${modeIcon}</span>
          <span style="color:#6a7a8a;width:70px;text-align:right;font-size:0.8em;">${date}</span>
        </div>
      `;
    });

    return html;
  }

  // ===== LINGUAGEM =====
  private setupLanguageButton(): void {
    this.view.updateLanguageButton(getLanguage());
    this.view.languageButton.addEventListener('click', () => {
      const current = getLanguage();
      const next: Language = current === 'pt' ? 'en' : 'pt';
      setLanguage(next);
      this.view.updateLanguageButton(next);
      this.view.refreshUITexts(next);
    });
  }

  // ===== MOBILE =====
  private setupStartMobileButton(): void {
    this.view.startMobileButton.addEventListener('click', () => {
      if (this.onStartCallback) this.onStartCallback();
    });
  }

  // ===== UI METHODS =====
  public updateStats(cycle: number, energy: number, score: number): void {
    this.view.updateStats(cycle, energy, score);
  }

  public setNotification(message: string, type: 'info' | 'success' | 'fail' | 'warning' = 'info'): void {
    this.view.setNotification(message, type);
  }

  public clearNotification(): void {
    this.view.clearNotification();
  }

  public showTimedNotification(message: string, type: 'info' | 'success' | 'fail' | 'warning', duration: number): void {
    this.view.setNotification(message, type);
    setTimeout(() => this.view.clearNotification(), duration);
  }

  public showEnigma(visual: string, options: string[], timeLimit: number, remaining: number): void {
    this.view.showEnigma(visual, options, timeLimit, remaining);
  }

  public showEnigmaWithHint(visual: string, question: string, options: string[], hint: string, rule: string, timeLimit: number, remaining: number): void {
    this.view.showEnigmaWithHint(visual, question, options, hint, rule, timeLimit, remaining);
  }

  public hideEnigma(): void {
    this.view.hideEnigma();
  }

  public showStartScreen(): void {
    this.view.showStartScreen();
  }

  public hideStartScreen(): void {
    this.view.hideStartScreen();
  }

  public updateModeButtons(state: {
    hardModeUnlocked: boolean;
    turingVisionUnlocked: boolean;
    spectrumModeUnlocked: boolean;
    hardMode: boolean;
    turingVision: boolean;
    spectrumMode: boolean;
  }): void {
    this.view.updateModeButtons(state);
  }

  public setupModeButtonListeners(
    onToggleHardMode: () => void,
    onToggleTuringVision: () => void,
    onToggleSpectrumMode: () => void
  ): void {
    this.view.modeButtons.hardMode?.addEventListener('click', onToggleHardMode);
    this.view.modeButtons.turingVision?.addEventListener('click', onToggleTuringVision);
    this.view.modeButtons.spectrumMode?.addEventListener('click', onToggleSpectrumMode);
  }

  public markOptionCorrect(index: number): void {
    this.view.markOptionCorrect(index);
  }

  public markOptionWrong(index: number): void {
    this.view.markOptionWrong(index);
  }

  public setOptionsEnabled(enabled: boolean): void {
    this.view.setOptionsEnabled(enabled);
  }

  public clearOptionsStyles(): void {
    this.view.clearOptionsStyles();
  }

  public reset(): void {
    this.view.reset();
    this.hidePauseOverlay();
    this.updatePauseButtonVisibility(false);
  }
}
// src/controllers/UIController.ts
// Controlador da interface do usuário - constroi toda a UI

import { t, getLanguage, setLanguage, Language } from '../utils/i18n';
import { RankingService, ScoreEntry } from '../services/RankingService';
import { GlobalRankingService, GlobalScoreEntry } from '../services/GlobalRankingService';

export class UIController {
  private app: HTMLElement;
  private wrapper!: HTMLElement;
  private cycleDisplay!: HTMLElement;
  private energyDisplay!: HTMLElement;
  private scoreDisplay!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private startScreen!: HTMLElement;
  private rankingScreen!: HTMLElement;
  private rankingList!: HTMLElement;
  private tabPersonal!: HTMLElement;
  private tabGlobal!: HTMLElement;
  public codeDisplay!: HTMLElement;
  public optionButtons: HTMLElement[] = [];
  private restartButton!: HTMLElement;
  private notification!: HTMLElement;
  private languageButton!: HTMLElement;
  private startMobileButton!: HTMLElement;

  private modeButtons: {
    hardMode: HTMLElement;
    turingVision: HTMLElement;
    spectrumMode: HTMLElement;
  };

  private onStartCallback: (() => void) | null = null;
  private currentRankingTab: 'personal' | 'global' = 'personal';

  constructor(appId: string = 'app') {
    this.app = document.getElementById(appId)!;

    this.buildUI();

    this.modeButtons = {
      hardMode: document.getElementById('mode-hard')!,
      turingVision: document.getElementById('mode-vision')!,
      spectrumMode: document.getElementById('mode-spectrum')!
    };

    this.setupLanguageButton();
    this.setupStartMobileButton();
    this.setupRankingButtons();
    this.refreshUITexts();
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private buildUI(): void {
    this.app.innerHTML = `
      <div id="game-wrapper">
        <div id="header">
          <h1>☀︎ TURING'S SOLSTICE</h1>
          <div id="stats">
            <span class="stat-item">🌓 <strong id="cycleDisplay">0</strong></span>
            <span class="stat-item">⚡ <strong id="energyDisplay">0</strong></span>
            <span class="stat-item">⏳ <strong id="scoreDisplay">0</strong></span>
          </div>
        </div>
        <div id="game-area">
          <canvas id="gameCanvas"></canvas>
          <div id="start-screen">
            <button id="btn-language">🇧🇷 PT</button>
            <div id="start-content">
              <div class="start-logo">☀︎</div>
              <h2 class="start-title">TURING'S SOLSTICE</h2>
              <p class="start-subtitle">Pressione ESPAÇO para começar</p>
              <div id="mode-buttons">
                <button id="mode-hard" class="mode-btn locked">🔒 Hard Mode (Ciclo 10)</button>
                <button id="mode-vision" class="mode-btn locked">🔒 Turing Vision (Ciclo 15)</button>
                <button id="mode-spectrum" class="mode-btn locked">🔒 Spectrum Mode (Ciclo 20)</button>
              </div>
              <button id="btn-ranking" class="mode-btn">🏆 RANKING</button>
              <p class="start-hint">🦘 Pulo duplo: ESPAÇO duas vezes</p>
              <button id="btn-start-mobile" class="start-btn-mobile">▶ INICIAR</button>
            </div>
          </div>
          <div id="ranking-screen" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 8, 20, 0.95); z-index: 60; flex-direction: column; align-items: center; overflow-y: auto;">
            <h3 style="color: #f1c40f; font-family: 'Courier New', monospace; margin: 15px 0 10px; font-size: clamp(14px, 3vw, 20px);">${t('ranking.title')}</h3>
            <div id="ranking-tabs" style="display: flex; gap: 5px; margin-bottom: 10px;">
              <button id="tab-personal" class="ranking-tab active" style="padding: 6px 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; background: rgba(255,255,255,0.1); color: #fff; cursor: pointer; font-family: 'Courier New', monospace; font-size: clamp(10px, 1.5vw, 12px);">${t('ranking.personal')}</button>
              <button id="tab-global" class="ranking-tab" style="padding: 6px 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; background: rgba(255,255,255,0.05); color: #8e9bb5; cursor: pointer; font-family: 'Courier New', monospace; font-size: clamp(10px, 1.5vw, 12px);">${t('ranking.global')}</button>
            </div>
            <div id="ranking-list" style="width: 90%; max-width: 400px; flex: 1; overflow-y: auto; padding: 5px;"></div>
            <button id="btn-ranking-back" class="mode-btn" style="margin: 10px 0 15px; max-width: 200px;">${t('ranking.back')}</button>
          </div>
        </div>
        <div id="panel">
          <div id="code-display">◆ ◇ ◆ ◇</div>
          <div id="options">
            <button class="opt-btn" data-index="0">A</button>
            <button class="opt-btn" data-index="1">B</button>
            <button class="opt-btn" data-index="2">C</button>
            <button class="opt-btn" data-index="3">D</button>
          </div>
          <button id="restart-btn">⟳ RECOMEÇAR</button>
        </div>
        <div id="notification"></div>
      </div>
    `;

    this.wrapper = document.getElementById('game-wrapper')!;
    this.cycleDisplay = document.getElementById('cycleDisplay')!;
    this.energyDisplay = document.getElementById('energyDisplay')!;
    this.scoreDisplay = document.getElementById('scoreDisplay')!;
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.startScreen = document.getElementById('start-screen')!;
    this.rankingScreen = document.getElementById('ranking-screen')!;
    this.rankingList = document.getElementById('ranking-list')!;
    this.tabPersonal = document.getElementById('tab-personal')!;
    this.tabGlobal = document.getElementById('tab-global')!;
    this.codeDisplay = document.getElementById('code-display')!;
    this.optionButtons = Array.from(document.querySelectorAll('.opt-btn'));
    this.restartButton = document.getElementById('restart-btn')!;
    this.notification = document.getElementById('notification')!;
    this.languageButton = document.getElementById('btn-language')!;
    this.startMobileButton = document.getElementById('btn-start-mobile')!;
  }

  private resizeCanvas(): void {
    const gameArea = document.getElementById('game-area');
    if (gameArea && this.canvas) {
      const rect = gameArea.getBoundingClientRect();
      const isMobile = rect.width < 500;
      if (isMobile) {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        const ctx = this.canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
      }
    }
  }

  public getCanvasSize(): { width: number; height: number } { return { width: this.canvas.width, height: this.canvas.height }; }
  public getCanvas(): HTMLCanvasElement { return this.canvas; }
  public onStartClick(callback: () => void): void { this.onStartCallback = callback; }

  private setupStartMobileButton(): void {
    this.startMobileButton.addEventListener('click', () => {
      if (this.onStartCallback) this.onStartCallback();
    });
  }

  public async promptPlayerName(currentName: string): Promise<string | null> {
    return new Promise((resolve) => {
      const message = getLanguage() === 'pt'
        ? '🏆 Seu score entrou no ranking global!\nDigite seu nome:'
        : '🏆 Your score made it to the global ranking!\nEnter your name:';
      const name = prompt(message, currentName === 'Anônimo' ? '' : currentName);
      resolve(name);
    });
  }

  private setupRankingButtons(): void {
    document.getElementById('btn-ranking')?.addEventListener('click', () => this.showRankingScreen());
    document.getElementById('btn-ranking-back')?.addEventListener('click', () => this.hideRankingScreen());
    this.tabPersonal.addEventListener('click', () => { this.currentRankingTab = 'personal'; this.updateTabStyles(); this.loadRanking(); });
    this.tabGlobal.addEventListener('click', () => { this.currentRankingTab = 'global'; this.updateTabStyles(); this.loadRanking(); });
  }

  private updateTabStyles(): void {
    if (this.currentRankingTab === 'personal') {
      this.tabPersonal.style.background = 'rgba(255,255,255,0.1)'; this.tabPersonal.style.color = '#fff';
      this.tabGlobal.style.background = 'rgba(255,255,255,0.05)'; this.tabGlobal.style.color = '#8e9bb5';
    } else {
      this.tabGlobal.style.background = 'rgba(255,255,255,0.1)'; this.tabGlobal.style.color = '#fff';
      this.tabPersonal.style.background = 'rgba(255,255,255,0.05)'; this.tabPersonal.style.color = '#8e9bb5';
    }
  }

  private showRankingScreen(): void { this.startScreen.style.display = 'none'; this.rankingScreen.style.display = 'flex'; this.loadRanking(); }
  private hideRankingScreen(): void { this.rankingScreen.style.display = 'none'; this.startScreen.style.display = 'flex'; }

  private loadRanking(): void {
    if (this.currentRankingTab === 'personal') this.loadPersonalRanking();
    else this.loadGlobalRanking();
  }

  private loadPersonalRanking(): void {
    const scores = RankingService.getScores();
    this.renderRankingList(scores, 'personal');
  }

  private async loadGlobalRanking(): Promise<void> {
    this.rankingList.innerHTML = `<div style="color:#8e9bb5;text-align:center;padding:20px;font-family:Courier New,monospace;">${t('ranking.loading')}</div>`;
    if (!GlobalRankingService.isConfigured()) {
      this.rankingList.innerHTML = `<div style="color:#e67e22;text-align:center;padding:20px;font-family:Courier New,monospace;">⚠️ ${t('ranking.not_configured')}</div>`;
      return;
    }
    try {
      const scores = await GlobalRankingService.getGlobalScores();
      this.renderRankingList(scores, 'global');
    } catch (error) {
      this.rankingList.innerHTML = `<div style="color:#e74c3c;text-align:center;padding:20px;font-family:Courier New,monospace;">⚠️ ${t('ranking.unavailable')}</div>`;
    }
  }

  private renderRankingList(scores: (ScoreEntry | GlobalScoreEntry)[], type: 'personal' | 'global'): void {
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      this.rankingList.innerHTML = `<div style="color:#8e9bb5;text-align:center;padding:20px;font-family:Courier New,monospace;">${t('ranking.empty')}</div>`;
      return;
    }
    const validScores = scores.filter(e => e && typeof e.score === 'number');
    if (validScores.length === 0) {
      this.rankingList.innerHTML = `<div style="color:#8e9bb5;text-align:center;padding:20px;font-family:Courier New,monospace;">${t('ranking.empty')}</div>`;
      return;
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
      const playerName = entry.player && entry.player !== 'Anônimo' ? `<span style="color:#6a7a8a;font-size:0.85em;">${entry.player}</span>` : '';
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
  </div>
`;
    });
    this.rankingList.innerHTML = html;
  }

  private setupLanguageButton(): void {
    this.updateLanguageButton();
    this.languageButton.addEventListener('click', () => {
      const current = getLanguage();
      const next: Language = current === 'pt' ? 'en' : 'pt';
      setLanguage(next);
      this.updateLanguageButton();
      this.refreshUITexts();
    });
  }

  private updateLanguageButton(): void { this.languageButton.textContent = getLanguage() === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'; }

  private refreshUITexts(): void {
    const st = document.querySelector('.start-title');
    const ss = document.querySelector('.start-subtitle');
    const sh = document.querySelector('.start-hint');
    if (st) st.textContent = t('start.title');
    if (ss) ss.textContent = t('start.subtitle');
    if (sh) sh.textContent = t('start.double_jump');
    this.restartButton.textContent = `⟳ ${getLanguage() === 'pt' ? 'RECOMEÇAR' : 'RESTART'}`;
    const lang = getLanguage();
    this.startMobileButton.textContent = lang === 'pt' ? '▶ INICIAR' : '▶ START';
    this.notification.textContent = lang === 'pt' ? 'Decifre o código para controlar o Solstício' : 'Decipher the code to control the Solstice';
    const br = document.getElementById('btn-ranking');
    if (br) br.textContent = t('ranking.title');
    const bb = document.getElementById('btn-ranking-back');
    if (bb) bb.textContent = t('ranking.back');
    this.tabPersonal.textContent = t('ranking.personal');
    this.tabGlobal.textContent = t('ranking.global');
    const rt = document.querySelector('#ranking-screen h3');
    if (rt) rt.textContent = t('ranking.title');
  }

  public updateStats(cycle: number, energy: number, score: number): void {
    this.cycleDisplay.textContent = Math.floor(cycle).toString();
    this.energyDisplay.textContent = Math.floor(energy).toString();
    this.scoreDisplay.textContent = Math.floor(score).toString();
  }

  public setNotification(message: string, type: 'info' | 'success' | 'fail' | 'warning' = 'info'): void {
    this.notification.textContent = message;
    this.notification.className = type === 'info' ? '' : type;
  }
  public clearNotification(): void { this.notification.textContent = ''; this.notification.className = ''; }
  public showTimedNotification(message: string, type: 'info' | 'success' | 'fail' | 'warning', duration: number): void {
    this.setNotification(message, type);
    setTimeout(() => this.clearNotification(), duration);
  }

  public showEnigma(visual: string, options: string[], timeLimit: number, remaining: number): void {
    this.codeDisplay.innerHTML = `<div style="font-size:0.7rem;color:#6a7a8a;margin-bottom:4px;">⏱️ ${timeLimit}s | Restam ${remaining}</div><div style="font-size:1.8rem;margin-bottom:12px;color:#b7cdff;letter-spacing:2px;text-shadow: 0 0 20px rgba(100,200,255,0.3);">${visual}</div>`;
    this.optionButtons.forEach((btn, i) => {
      if (i < options.length) { btn.textContent = options[i]; btn.style.display = 'block'; btn.className = 'opt-btn'; (btn as HTMLButtonElement).disabled = false; }
      else { btn.style.display = 'none'; }
    });
  }

  public showEnigmaWithHint(visual: string, question: string, options: string[], hint: string, rule: string, timeLimit: number, remaining: number): void {
    this.codeDisplay.innerHTML = `<div style="font-size:0.7rem;color:#6a7a8a;margin-bottom:4px;">⏱️ ${timeLimit}s | Restam ${remaining}</div><div style="font-size:1.8rem;margin-bottom:8px;color:#b7cdff;letter-spacing:2px;text-shadow: 0 0 20px rgba(100,200,255,0.3);">${visual}</div><div style="font-size:0.75rem;color:#8e9bb5;margin-bottom:4px;font-style:italic;">${hint}</div>`;
    this.optionButtons.forEach((btn, i) => {
      if (i < options.length) { btn.textContent = options[i]; btn.style.display = 'block'; btn.className = 'opt-btn'; (btn as HTMLButtonElement).disabled = false; }
      else { btn.style.display = 'none'; }
    });
    this.setNotification(`🧠 ${question}`, 'warning');
  }

  public hideEnigma(): void { this.codeDisplay.textContent = '◆ ◇ ◆ ◇'; this.optionButtons.forEach(btn => { btn.style.display = 'none'; }); this.clearNotification(); }
  public showStartScreen(): void { this.startScreen.style.display = 'flex'; this.rankingScreen.style.display = 'none'; this.refreshUITexts(); }
  public hideStartScreen(): void { this.startScreen.style.display = 'none'; }

  public updateModeButtons(state: { hardModeUnlocked: boolean; turingVisionUnlocked: boolean; spectrumModeUnlocked: boolean; hardMode: boolean; turingVision: boolean; spectrumMode: boolean; }): void {
    if (this.modeButtons.hardMode) {
      if (state.hardModeUnlocked) { this.modeButtons.hardMode.classList.remove('locked'); this.modeButtons.hardMode.textContent = state.hardMode ? t('mode.hard_on') : t('mode.hard_off'); }
      else { this.modeButtons.hardMode.classList.add('locked'); this.modeButtons.hardMode.textContent = t('mode.locked_hard'); }
    }
    if (this.modeButtons.turingVision) {
      if (state.turingVisionUnlocked) { this.modeButtons.turingVision.classList.remove('locked'); this.modeButtons.turingVision.textContent = state.turingVision ? t('mode.vision_on') : t('mode.vision_off'); }
      else { this.modeButtons.turingVision.classList.add('locked'); this.modeButtons.turingVision.textContent = t('mode.locked_vision'); }
    }
    if (this.modeButtons.spectrumMode) {
      if (state.spectrumModeUnlocked) { this.modeButtons.spectrumMode.classList.remove('locked'); this.modeButtons.spectrumMode.textContent = state.spectrumMode ? t('mode.spectrum_on') : t('mode.spectrum_off'); }
      else { this.modeButtons.spectrumMode.classList.add('locked'); this.modeButtons.spectrumMode.textContent = t('mode.locked_spectrum'); }
    }
  }

  public setupModeButtonListeners(onToggleHardMode: () => void, onToggleTuringVision: () => void, onToggleSpectrumMode: () => void): void {
    if (this.modeButtons.hardMode) this.modeButtons.hardMode.addEventListener('click', onToggleHardMode);
    if (this.modeButtons.turingVision) this.modeButtons.turingVision.addEventListener('click', onToggleTuringVision);
    if (this.modeButtons.spectrumMode) this.modeButtons.spectrumMode.addEventListener('click', onToggleSpectrumMode);
  }

  public markOptionCorrect(index: number): void { if (index >= 0 && index < this.optionButtons.length) this.optionButtons[index].classList.add('correct'); }
  public markOptionWrong(index: number): void { if (index >= 0 && index < this.optionButtons.length) this.optionButtons[index].classList.add('wrong'); }
  public setOptionsEnabled(enabled: boolean): void { this.optionButtons.forEach(btn => { (btn as HTMLButtonElement).disabled = !enabled; }); }
  public clearOptionsStyles(): void { this.optionButtons.forEach(btn => { btn.className = 'opt-btn'; }); }

  public getRestartButton(): HTMLElement { return this.restartButton; }
  public getNotification(): HTMLElement { return this.notification; }
  public getCodeDisplay(): HTMLElement { return this.codeDisplay; }
  public getOptionButtons(): HTMLElement[] { return this.optionButtons; }

  public reset(): void { this.hideEnigma(); this.clearNotification(); this.setOptionsEnabled(false); this.clearOptionsStyles(); this.hideStartScreen(); }
}
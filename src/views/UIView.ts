// src/views/UIView.ts
// Responsável apenas pela renderização da UI

import { t, getLanguage, Language } from '../utils/i18n';

export class UIView {
  private app: HTMLElement;
  
  public wrapper!: HTMLElement;
  public cycleDisplay!: HTMLElement;
  public energyDisplay!: HTMLElement;
  public scoreDisplay!: HTMLElement;
  public canvas!: HTMLCanvasElement;
  public startScreen!: HTMLElement;
  public rankingScreen!: HTMLElement;
  public rankingList!: HTMLElement;
  public tabPersonal!: HTMLElement;
  public tabGlobal!: HTMLElement;
  public codeDisplay!: HTMLElement;
  public optionButtons: HTMLElement[] = [];
  public restartButton!: HTMLElement;
  public notification!: HTMLElement;
  public languageButton!: HTMLElement;
  public startMobileButton!: HTMLElement;
  public rankingButton!: HTMLElement;
  public rankingBackButton!: HTMLElement;
  public rankingTitle!: HTMLElement;

  // ===== PROPRIEDADES DE PAUSA =====
  public pauseBtn!: HTMLElement;
  public pauseOverlay!: HTMLElement;
  public pauseResumeBtn!: HTMLElement;
  public isPaused: boolean = false;

  public modeButtons: {
    hardMode: HTMLElement;
    turingVision: HTMLElement;
    spectrumMode: HTMLElement;
  };

  constructor(appId: string = 'app') {
    this.app = document.getElementById(appId)!;
    this.buildUI();
    this.addStyles();
    this.modeButtons = {
      hardMode: document.getElementById('mode-hard')!,
      turingVision: document.getElementById('mode-vision')!,
      spectrumMode: document.getElementById('mode-spectrum')!
    };
  }

  private buildUI(): void {
    this.app.innerHTML = `
      <div id="game-wrapper">
        <div id="header">
          <div id="header-left">
            <h1>☀︎ TURING'S SOLSTICE</h1>
          </div>
          <div id="stats">
            <span class="stat-item">🌓 <strong id="cycleDisplay">0</strong></span>
            <span class="stat-item">⚡ <strong id="energyDisplay">0</strong></span>
            <span class="stat-item">⏳ <strong id="scoreDisplay">0</strong></span>
          </div>
          <div id="header-right">
            <button id="pause-btn" class="pause-btn hidden" title="Pausar jogo">
              <span class="pause-icon">⏸️</span>
            </button>
          </div>
        </div>
        <div id="game-area">
          <canvas id="gameCanvas"></canvas>
          
          <!-- OVERLAY DE PAUSA -->
          <div id="pause-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(6px); z-index: 50; align-items: center; justify-content: center; flex-direction: column;">
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 64px; margin-bottom: 16px;">⏸️</div>
              <h2 style="color: #f1c40f; font-family: 'Courier New', monospace; font-size: clamp(24px, 4vw, 32px); margin: 0 0 8px 0; text-shadow: 0 0 30px rgba(241, 196, 15, 0.2);">${t('pause.title')}</h2>
              <p style="color: #b7cdff; font-family: 'Courier New', monospace; font-size: clamp(14px, 2vw, 18px); margin: 0 0 24px 0; opacity: 0.7;">${t('pause.subtitle')}</p>
              <button id="pause-resume-btn" style="
                padding: 14px 40px;
                background: linear-gradient(135deg, #f1c40f, #f39c12);
                border: none;
                border-radius: 12px;
                color: #1a1a2e;
                font-family: 'Courier New', monospace;
                font-size: clamp(14px, 1.5vw, 18px);
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(241, 196, 15, 0.3);
                touch-action: manipulation;
              ">${t('pause.resume')}</button>
              <p style="color: #6a7a8a; font-family: 'Courier New', monospace; font-size: clamp(10px, 1vw, 12px); margin-top: 16px; opacity: 0.5;">${t('pause.hint')}</p>
            </div>
          </div>
          
          <!-- START SCREEN -->
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
          
          <!-- RANKING SCREEN -->
          <div id="ranking-screen" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 8, 20, 0.95); z-index: 60; flex-direction: column; align-items: center; overflow-y: auto;">
            <h3 id="ranking-title" style="color: #f1c40f; font-family: 'Courier New', monospace; margin: 15px 0 10px; font-size: clamp(14px, 3vw, 20px);">${t('ranking.title')}</h3>
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

    // Referências dos elementos
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
    this.rankingTitle = document.getElementById('ranking-title')!;
    this.codeDisplay = document.getElementById('code-display')!;
    this.optionButtons = Array.from(document.querySelectorAll('.opt-btn'));
    this.restartButton = document.getElementById('restart-btn')!;
    this.notification = document.getElementById('notification')!;
    this.languageButton = document.getElementById('btn-language')!;
    this.startMobileButton = document.getElementById('btn-start-mobile')!;
    this.rankingButton = document.getElementById('btn-ranking')!;
    this.rankingBackButton = document.getElementById('btn-ranking-back')!;
    
    // Referências dos elementos de pausa
    this.pauseBtn = document.getElementById('pause-btn')!;
    this.pauseOverlay = document.getElementById('pause-overlay')!;
    this.pauseResumeBtn = document.getElementById('pause-resume-btn')!;
  }

  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* ===== HEADER ===== */
      #header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        background: rgba(0, 0, 0, 0.4);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        min-height: 40px;
        position: relative;
        z-index: 5;
        gap: 8px;
      }
      #header-left {
        flex: 0 0 auto;
        min-width: 0;
      }
      #header-left h1 {
        font-size: clamp(10px, 1.6vw, 16px);
        margin: 0;
        color: #f1c40f;
        font-family: 'Courier New', monospace;
        letter-spacing: 1px;
        text-shadow: 0 0 20px rgba(241, 196, 15, 0.15);
        white-space: nowrap;
        font-weight: bold;
      }
      #stats {
        display: flex;
        gap: clamp(6px, 1.5vw, 16px);
        flex: 1;
        justify-content: center;
        min-width: 0;
      }
      .stat-item {
        color: #b7cdff;
        font-family: 'Courier New', monospace;
        font-size: clamp(9px, 1.1vw, 13px);
        opacity: 0.85;
        white-space: nowrap;
      }
      .stat-item strong {
        color: #fff;
        font-size: clamp(10px, 1.2vw, 14px);
        margin-left: 2px;
      }
      #header-right {
        flex: 0 0 auto;
        display: flex;
        justify-content: flex-end;
        min-width: 0;
      }

      /* ===== BOTÃO DE PAUSA ===== */
      #pause-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex !important;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 15px;
        backdrop-filter: blur(4px);
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        padding: 0;
        flex-shrink: 0;
      }
      #pause-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.25);
        transform: scale(1.08);
      }
      #pause-btn:active {
        transform: scale(0.92);
      }
      #pause-btn .pause-icon {
        line-height: 1;
        color: #d6e2ff;
        font-size: 15px;
      }
      #pause-btn.hidden {
        display: none !important;
      }

      @keyframes pulse-pause {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.08); }
        70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      #pause-btn:not(.hidden) {
        animation: pulse-pause 2.5s infinite;
      }
      #pause-btn:hover {
        animation: none;
      }

      /* ===== OVERLAY DE PAUSA ===== */
      #pause-overlay {
        animation: fadeIn 0.3s ease-out;
      }
      #pause-resume-btn {
        touch-action: manipulation;
      }
      #pause-resume-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 30px rgba(241, 196, 15, 0.4);
      }
      #pause-resume-btn:active {
        transform: scale(0.95);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* ===== RESPONSIVO ===== */
      @media (max-width: 600px) {
        #header {
          padding: 4px 8px;
          min-height: 32px;
          gap: 4px;
        }
        #pause-btn {
          width: 28px;
          height: 28px;
          font-size: 12px;
        }
        #pause-btn .pause-icon {
          font-size: 12px;
        }
        #stats {
          gap: 4px;
        }
        .stat-item {
          font-size: 8px;
        }
        .stat-item strong {
          font-size: 9px;
        }
        #header-left h1 {
          font-size: 8px;
          letter-spacing: 0.5px;
        }
      }
      @media (max-width: 400px) {
        #header {
          padding: 3px 6px;
          min-height: 28px;
        }
        #pause-btn {
          width: 24px;
          height: 24px;
          font-size: 10px;
        }
        #pause-btn .pause-icon {
          font-size: 10px;
        }
        .stat-item {
          font-size: 7px;
        }
        .stat-item strong {
          font-size: 8px;
        }
        #header-left h1 {
          font-size: 7px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  public resizeCanvas(): void {
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

  public getCanvasSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // ===== RANKING =====
  public showRankingScreen(): void {
    this.startScreen.style.display = 'none';
    this.rankingScreen.style.display = 'flex';
    this.pauseBtn.classList.add('hidden');
  }

  public hideRankingScreen(): void {
    this.rankingScreen.style.display = 'none';
    this.startScreen.style.display = 'flex';
    this.pauseBtn.classList.add('hidden');
  }

  public updateTabStyles(activeTab: 'personal' | 'global'): void {
    if (activeTab === 'personal') {
      this.tabPersonal.style.background = 'rgba(255,255,255,0.1)';
      this.tabPersonal.style.color = '#fff';
      this.tabGlobal.style.background = 'rgba(255,255,255,0.05)';
      this.tabGlobal.style.color = '#8e9bb5';
    } else {
      this.tabGlobal.style.background = 'rgba(255,255,255,0.1)';
      this.tabGlobal.style.color = '#fff';
      this.tabPersonal.style.background = 'rgba(255,255,255,0.05)';
      this.tabPersonal.style.color = '#8e9bb5';
    }
  }

  public renderRankingList(html: string): void {
    this.rankingList.innerHTML = html;
  }

  // ===== LINGUAGEM =====
  public updateLanguageButton(lang: Language): void {
    this.languageButton.textContent = lang === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN';
  }

  public refreshUITexts(lang: Language): void {
    const st = document.querySelector('.start-title');
    const ss = document.querySelector('.start-subtitle');
    const sh = document.querySelector('.start-hint');
    if (st) st.textContent = t('start.title');
    if (ss) ss.textContent = t('start.subtitle');
    if (sh) sh.textContent = t('start.double_jump');
    this.restartButton.textContent = `⟳ ${lang === 'pt' ? 'RECOMEÇAR' : 'RESTART'}`;
    this.startMobileButton.textContent = lang === 'pt' ? '▶ INICIAR' : '▶ START';
    this.notification.textContent = lang === 'pt' ? 'Decifre o código para controlar o Solstício' : 'Decipher the code to control the Solstice';
    if (this.rankingButton) this.rankingButton.textContent = t('ranking.title');
    if (this.rankingBackButton) this.rankingBackButton.textContent = t('ranking.back');
    if (this.tabPersonal) this.tabPersonal.textContent = t('ranking.personal');
    if (this.tabGlobal) this.tabGlobal.textContent = t('ranking.global');
    if (this.rankingTitle) this.rankingTitle.textContent = t('ranking.title');
  }

  // ===== STATS =====
  public updateStats(cycle: number, energy: number, score: number): void {
    this.cycleDisplay.textContent = Math.floor(cycle).toString();
    this.energyDisplay.textContent = Math.floor(energy).toString();
    this.scoreDisplay.textContent = Math.floor(score).toString();
  }

  // ===== NOTIFICAÇÕES =====
  public setNotification(message: string, type: 'info' | 'success' | 'fail' | 'warning' = 'info'): void {
    this.notification.textContent = message;
    this.notification.className = type === 'info' ? '' : type;
  }

  public clearNotification(): void {
    this.notification.textContent = '';
    this.notification.className = '';
  }

  // ===== ENIGMA =====
  public showEnigma(visual: string, options: string[], timeLimit: number, remaining: number): void {
    this.codeDisplay.innerHTML = `
      <div style="font-size:0.7rem;color:#6a7a8a;margin-bottom:4px;">⏱️ ${timeLimit}s | Restam ${remaining}</div>
      <div style="font-size:1.8rem;margin-bottom:12px;color:#b7cdff;letter-spacing:2px;text-shadow: 0 0 20px rgba(100,200,255,0.3);">${visual}</div>
    `;
    this.optionButtons.forEach((btn, i) => {
      if (i < options.length) {
        btn.textContent = options[i];
        btn.style.display = 'block';
        btn.className = 'opt-btn';
        (btn as HTMLButtonElement).disabled = false;
      } else {
        btn.style.display = 'none';
      }
    });
  }

  public showEnigmaWithHint(visual: string, question: string, options: string[], hint: string, rule: string, timeLimit: number, remaining: number): void {
    this.codeDisplay.innerHTML = `
      <div style="font-size:0.7rem;color:#6a7a8a;margin-bottom:4px;">⏱️ ${timeLimit}s | Restam ${remaining}</div>
      <div style="font-size:1.8rem;margin-bottom:6px;color:#b7cdff;letter-spacing:2px;text-shadow: 0 0 20px rgba(100,200,255,0.3);">${visual}</div>
      <div style="font-size:0.85rem;color:#d6e2ff;margin-bottom:6px;font-weight:bold;">🧠 ${question}</div>
      <div style="font-size:0.75rem;color:#8e9bb5;margin-bottom:4px;font-style:italic;">${hint}</div>
    `;
    this.optionButtons.forEach((btn, i) => {
      if (i < options.length) {
        btn.textContent = options[i];
        btn.style.display = 'block';
        btn.className = 'opt-btn';
        (btn as HTMLButtonElement).disabled = false;
      } else {
        btn.style.display = 'none';
      }
    });
    this.setNotification(`🧠 ${question}`, 'warning');
  }

  public hideEnigma(): void {
    this.codeDisplay.textContent = '◆ ◇ ◆ ◇';
    this.optionButtons.forEach(btn => { btn.style.display = 'none'; });
    this.clearNotification();
  }

  // ===== START SCREEN =====
  public showStartScreen(): void {
    this.startScreen.style.display = 'flex';
    this.rankingScreen.style.display = 'none';
    this.refreshUITexts(getLanguage());
    this.pauseBtn.classList.add('hidden');
  }

  public hideStartScreen(): void {
    this.startScreen.style.display = 'none';
    this.pauseBtn.classList.remove('hidden');
  }

  // ===== MODE BUTTONS =====
  public updateModeButtons(state: {
    hardModeUnlocked: boolean;
    turingVisionUnlocked: boolean;
    spectrumModeUnlocked: boolean;
    hardMode: boolean;
    turingVision: boolean;
    spectrumMode: boolean;
  }): void {
    if (this.modeButtons.hardMode) {
      if (state.hardModeUnlocked) {
        this.modeButtons.hardMode.classList.remove('locked');
        this.modeButtons.hardMode.textContent = state.hardMode ? t('mode.hard_on') : t('mode.hard_off');
      } else {
        this.modeButtons.hardMode.classList.add('locked');
        this.modeButtons.hardMode.textContent = t('mode.locked_hard');
      }
    }
    if (this.modeButtons.turingVision) {
      if (state.turingVisionUnlocked) {
        this.modeButtons.turingVision.classList.remove('locked');
        this.modeButtons.turingVision.textContent = state.turingVision ? t('mode.vision_on') : t('mode.vision_off');
      } else {
        this.modeButtons.turingVision.classList.add('locked');
        this.modeButtons.turingVision.textContent = t('mode.locked_vision');
      }
    }
    if (this.modeButtons.spectrumMode) {
      if (state.spectrumModeUnlocked) {
        this.modeButtons.spectrumMode.classList.remove('locked');
        this.modeButtons.spectrumMode.textContent = state.spectrumMode ? t('mode.spectrum_on') : t('mode.spectrum_off');
      } else {
        this.modeButtons.spectrumMode.classList.add('locked');
        this.modeButtons.spectrumMode.textContent = t('mode.locked_spectrum');
      }
    }
  }

  // ===== OPTIONS =====
  public markOptionCorrect(index: number): void {
    if (index >= 0 && index < this.optionButtons.length) {
      this.optionButtons[index].classList.add('correct');
    }
  }

  public markOptionWrong(index: number): void {
    if (index >= 0 && index < this.optionButtons.length) {
      this.optionButtons[index].classList.add('wrong');
    }
  }

  public setOptionsEnabled(enabled: boolean): void {
    this.optionButtons.forEach(btn => {
      (btn as HTMLButtonElement).disabled = !enabled;
    });
  }

  public clearOptionsStyles(): void {
    this.optionButtons.forEach(btn => {
      btn.className = 'opt-btn';
    });
  }

  // ===== GETTERS =====
  public getRestartButton(): HTMLElement {
    return this.restartButton;
  }

  public getNotification(): HTMLElement {
    return this.notification;
  }

  public getCodeDisplay(): HTMLElement {
    return this.codeDisplay;
  }

  public getOptionButtons(): HTMLElement[] {
    return this.optionButtons;
  }

  // ===== PAUSE =====
  public showPauseOverlay(): void {
    this.pauseOverlay.style.display = 'flex';
    this.isPaused = true;
    this.pauseBtn.innerHTML = '<span class="pause-icon">▶️</span>';
    this.pauseBtn.title = 'Retomar jogo';
    this.pauseBtn.style.animation = 'none';
  }

  public hidePauseOverlay(): void {
    this.pauseOverlay.style.display = 'none';
    this.isPaused = false;
    this.pauseBtn.innerHTML = '<span class="pause-icon">⏸️</span>';
    this.pauseBtn.title = 'Pausar jogo';
    this.pauseBtn.style.animation = '';
  }

  public togglePause(): void {
    if (this.isPaused) {
      this.hidePauseOverlay();
    } else {
      this.showPauseOverlay();
    }
  }

  public updatePauseButtonVisibility(visible: boolean): void {
    if (visible) {
      this.pauseBtn.classList.remove('hidden');
    } else {
      this.pauseBtn.classList.add('hidden');
      if (this.isPaused) {
        this.hidePauseOverlay();
      }
    }
  }

  // ===== PROMPT CUSTOMIZADO =====
  public showNamePrompt(
    currentName: string,
    onConfirm: (name: string) => void,
    onCancel: () => void
  ): void {
    this.removeNamePrompt();

    const lang = getLanguage();
    const title = lang === 'pt' ? '🏆 PARABÉNS!' : '🏆 CONGRATULATIONS!';
    const subtitle = lang === 'pt' 
      ? 'Seu score entrou no ranking global!' 
      : 'Your score made it to the global ranking!';
    const placeholder = lang === 'pt' ? 'Digite seu nome...' : 'Enter your name...';
    const confirmText = lang === 'pt' ? '✅ SALVAR' : '✅ SAVE';
    const cancelText = lang === 'pt' ? '❌ CANCELAR' : '❌ CANCEL';
    const message = lang === 'pt'
      ? 'Deixe sua marca na história do Solstício!'
      : 'Leave your mark on Solstice history!';

    const modal = document.createElement('div');
    modal.id = 'name-prompt-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(145deg, #1a1a3a, #0d0d2a);
        border-radius: 24px;
        padding: 40px 50px;
        max-width: 450px;
        width: 90%;
        border: 1px solid rgba(100, 200, 255, 0.15);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(100, 200, 255, 0.05);
        text-align: center;
        animation: slideUp 0.4s ease-out;
      ">
        <div style="font-size: 48px; margin-bottom: 8px;">🌟</div>
        <h2 style="
          color: #f1c40f;
          font-family: 'Courier New', monospace;
          font-size: 24px;
          margin: 0 0 4px 0;
          letter-spacing: 2px;
          text-shadow: 0 0 30px rgba(241, 196, 15, 0.2);
        ">${title}</h2>
        <p style="
          color: #b7cdff;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin: 4px 0 16px 0;
          opacity: 0.8;
        ">${subtitle}</p>
        <div style="
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f1c40f, transparent);
          margin: 0 auto 16px auto;
        "></div>
        <p style="
          color: #8e9bb5;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          margin: 0 0 20px 0;
          font-style: italic;
        ">${message}</p>
        <div style="
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        ">
          <input
            id="name-prompt-input"
            type="text"
            value="${currentName === 'Anônimo' ? '' : currentName}"
            placeholder="${placeholder}"
            maxlength="20"
            style="
              width: 100%;
              padding: 14px 16px;
              background: rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(100, 200, 255, 0.15);
              border-radius: 8px;
              color: #d6e2ff;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              outline: none;
              transition: all 0.3s ease;
              box-sizing: border-box;
            "
            autofocus
          />
        </div>
        <div style="
          display: flex;
          gap: 12px;
          margin-top: 20px;
          justify-content: center;
        ">
          <button id="name-prompt-confirm" style="
            padding: 12px 32px;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
          ">${confirmText}</button>
          <button id="name-prompt-cancel" style="
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #8e9bb5;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          ">${cancelText}</button>
        </div>
        <div style="
          margin-top: 16px;
          color: #6a7a8a;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          opacity: 0.5;
        ">${lang === 'pt' ? 'Máximo 20 caracteres' : 'Maximum 20 characters'}</div>
      </div>
    `;

    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.setAttribute('name-prompt-style', 'true');
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      #name-prompt-input:focus {
        border-color: #f1c40f;
        box-shadow: 0 0 20px rgba(241, 196, 15, 0.1);
      }
      #name-prompt-confirm:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 25px rgba(46, 204, 113, 0.4);
      }
      #name-prompt-cancel:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #d6e2ff;
      }
    `;
    document.head.appendChild(style);

    const input = document.getElementById('name-prompt-input') as HTMLInputElement;
    const confirmBtn = document.getElementById('name-prompt-confirm');
    const cancelBtn = document.getElementById('name-prompt-cancel');

    const handleConfirm = () => {
      const name = input.value.trim() || 'Anônimo';
      this.removeNamePrompt();
      onConfirm(name);
    };

    const handleCancel = () => {
      this.removeNamePrompt();
      onCancel();
    };

    confirmBtn?.addEventListener('click', handleConfirm);
    cancelBtn?.addEventListener('click', handleCancel);

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') handleCancel();
    });

    setTimeout(() => input?.focus(), 100);
  }

  public removeNamePrompt(): void {
    const modal = document.getElementById('name-prompt-modal');
    if (modal) modal.remove();

    const style = document.querySelector('style[name-prompt-style]');
    if (style) style.remove();
  }

  public reset(): void {
    this.hideEnigma();
    this.clearNotification();
    this.setOptionsEnabled(false);
    this.clearOptionsStyles();
    this.hideStartScreen();
    this.hidePauseOverlay();
  }
}
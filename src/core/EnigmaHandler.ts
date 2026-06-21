// src/core/EnigmaHandler.ts

import { EnigmaSystem } from '../systems/EnigmaSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { UIController } from '../controllers/UIController';
import { GameState } from '../types';
import { randomInt } from '../utils/helpers';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { ObstacleRegistry } from '../registries/ObstacleRegistry';
import { t } from '../utils/i18n';

export class EnigmaHandler {
  private enigmaSystem: EnigmaSystem;
  private interactionSystem: InteractionSystem;
  private config: { width: number; height: number; groundHeight: number };
  private groundY: number;
  private uiController: UIController;

  private onStateChange: (state: Partial<GameState>) => void;
  private onShowCenterMessage: (message: string, color: string, duration: number) => void;
  private onCreateEffectExplosion: (x: number, y: number, color: string, count: number) => void;
  private onAddObstacle: (obstacle: BaseObstacle) => void;
  private onRemoveObstacles: (count: number) => void;
  private onUpdateUI: () => void;
  private onAddPlatform: ((x: number, y: number, w: number, type: string) => void) | null;
  private onSetEnigmaState: (state: {
    overlayAlpha?: number; paused?: boolean; timeLimit?: number;
    cooldown?: boolean; cooldownTimer?: number; cycleTimer?: number;
    answered?: boolean; message?: string; messageTimer?: number; messageColor?: string;
  }) => void;

  constructor(
    enigmaSystem: EnigmaSystem,
    interactionSystem: InteractionSystem,
    config: { width: number; height: number; groundHeight: number },
    uiController: UIController,
    callbacks: {
      onStateChange: (state: Partial<GameState>) => void;
      onShowCenterMessage: (message: string, color: string, duration: number) => void;
      onCreateEffectExplosion: (x: number, y: number, color: string, count: number) => void;
      onAddObstacle: (obstacle: BaseObstacle) => void;
      onRemoveObstacles: (count: number) => void;
      onUpdateUI: () => void;
      onAddPlatform?: (x: number, y: number, w: number, type: string) => void;
      onSetEnigmaState: (state: any) => void;
    }
  ) {
    this.enigmaSystem = enigmaSystem;
    this.interactionSystem = interactionSystem;
    this.config = config;
    this.groundY = config.height - config.groundHeight;
    this.uiController = uiController;
    this.onStateChange = callbacks.onStateChange;
    this.onShowCenterMessage = callbacks.onShowCenterMessage;
    this.onCreateEffectExplosion = callbacks.onCreateEffectExplosion;
    this.onAddObstacle = callbacks.onAddObstacle;
    this.onRemoveObstacles = callbacks.onRemoveObstacles;
    this.onUpdateUI = callbacks.onUpdateUI;
    this.onAddPlatform = callbacks.onAddPlatform || null;
    this.onSetEnigmaState = callbacks.onSetEnigmaState;
  }

  public setupEnigmaListeners(
    getState: () => GameState,
    getDifficultyLevel: () => number,
    getEnigmasPerCycle: () => number,
    getEnigmasSpawnedThisCycle: () => number
  ): void {
    this.enigmaSystem.onStart((enigma) => {
      // ===== FASE 1: MÁQUINA ENIGMA =====
      if (enigma.id === 'enigma-machine') {
        this.onStateChange({ challengeActive: true });
        this.onSetEnigmaState({ overlayAlpha: 0.85, paused: true });

        // Usa getter para acessar codeDisplay
        const codeDisplay = this.uiController.getCodeDisplay();
        codeDisplay.innerHTML = `
          <div class="enigma-container">
            <div class="enigma-phase">${t('enigma_machine.title')}</div>
            <div class="enigma-subtitle">${t('enigma_machine.subtitle')}</div>
            <div class="enigma-pattern-box">
              <div class="enigma-pattern">${enigma.pattern}</div>
            </div>
            <div class="enigma-hint">${enigma.hint || t('enigma_machine.hint')}</div>
          </div>
        `;

        // Usa getter para acessar optionButtons
        const optionButtons = this.uiController.getOptionButtons();
        optionButtons.forEach((btn: HTMLElement, i: number) => {
          if (i < enigma.options.length) {
            btn.textContent = enigma.options[i];
            btn.style.display = 'block';
            btn.className = 'opt-btn';
            (btn as HTMLButtonElement).disabled = false;
          } else {
            btn.style.display = 'none';
          }
        });

        this.uiController.setNotification(`🧠 ${enigma.question}`, 'warning');
        this.onShowCenterMessage(t('enigma_machine.center'), '#9C27B0', 60);
        return;
      }

      // ===== FASE 2: TESTE DE TURING =====
      if (enigma.id === 'turing-test') {
        this.onStateChange({ challengeActive: true });
        this.onSetEnigmaState({ overlayAlpha: 0.85, paused: true });

        const patternFormatted = enigma.pattern
          .replace(/\n/g, '<br>')
          .replace(/Entidade A:/g, '<span class="entity-a">Entidade A:</span>')
          .replace(/Entidade B:/g, '<span class="entity-b">Entidade B:</span>')
          .replace(/Entity A:/g, '<span class="entity-a">Entity A:</span>')
          .replace(/Entity B:/g, '<span class="entity-b">Entity B:</span>');

        const codeDisplay = this.uiController.getCodeDisplay();
        codeDisplay.innerHTML = `
          <div class="enigma-container">
            <div class="enigma-phase">${t('turing_test.title')}</div>
            <div class="enigma-subtitle">${t('turing_test.subtitle')}</div>
            <div class="enigma-pattern-box enigma-turing-box">
              <div class="enigma-turing-text">${patternFormatted}</div>
            </div>
            <div class="enigma-hint">${t('turing.no_time_limit')}</div>
          </div>
        `;

        const optionButtons = this.uiController.getOptionButtons();
        optionButtons.forEach((btn: HTMLElement, i: number) => {
          if (i < enigma.options.length) {
            btn.textContent = enigma.options[i];
            btn.style.display = 'block';
            btn.className = 'opt-btn';
            (btn as HTMLButtonElement).disabled = false;
          } else {
            btn.style.display = 'none';
          }
        });

        this.uiController.setNotification(`🧠 ${enigma.question}`, 'warning');
        this.onShowCenterMessage(t('turing_test.center'), '#9C27B0', 60);
        return;
      }

      // ===== ENIGMA NORMAL =====
      this.onStateChange({ challengeActive: true });
      this.onSetEnigmaState({ overlayAlpha: 0.8, paused: true });

      const baseTime = 12;
      const difficultyBonus = getDifficultyLevel() * 1;
      const timeLimit = Math.max(6, baseTime + difficultyBonus);
      this.onSetEnigmaState({ timeLimit: timeLimit });

      const updatedEnigma = { ...enigma, timeLimit: timeLimit };
      this.enigmaSystem.updateCurrentEnigma(updatedEnigma);

      const hintEmojis = ['🔮', '🌙', '✨', '🌀', '⚡'];
      const hintPhrases = [
        t('hint.pattern'),
        t('hint.details'),
        t('hint.logic'),
        t('hint.observe'),
        t('hint.code')
      ];
      const randomHint = hintPhrases[Math.floor(Math.random() * hintPhrases.length)];
      const randomEmoji = hintEmojis[Math.floor(Math.random() * hintEmojis.length)];

      this.uiController.showEnigmaWithHint(
        enigma.pattern, enigma.question, enigma.options,
        `${randomEmoji} ${randomHint}`, enigma.rule || '',
        timeLimit, this.enigmaSystem.getRemainingEnigmas()
      );

      this.onShowCenterMessage(t('enigma.decipher'), '#f1c40f', 60);
    });

    // ===== RESPOSTAS =====
    this.enigmaSystem.onAnswer((correct) => {
      const state = getState();
      const currentEnigma = this.enigmaSystem.getCurrentEnigma();

      if (currentEnigma && currentEnigma.id === 'enigma-machine') {
        if (correct) {
          this.onStateChange({ challengeActive: false, answered: true });
          this.onSetEnigmaState({ overlayAlpha: 0, paused: false });
          this.onShowCenterMessage(t('enigma_machine.decrypted'), '#2ecc71', 200);
          this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#2ecc71', 40);
          this.uiController.setNotification(t('enigma_machine.success'), 'success');
          setTimeout(() => {
            this.uiController.hideEnigma();
            this.onStateChange({ answered: false });
            this.onShowCenterMessage(t('turing_test.title'), '#9C27B0', 300);
            this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#9C27B0', 50);
            setTimeout(async () => { await this.enigmaSystem.startTuringTest(); }, 2000);
          }, 2000);
        } else {
          this.onStateChange({ challengeActive: false, answered: true });
          this.onSetEnigmaState({ overlayAlpha: 0, paused: false });
          this.uiController.setNotification(t('enigma_machine.wrong'), 'fail');
          this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#e74c3c', 20);
          setTimeout(() => {
            this.uiController.hideEnigma();
            this.onStateChange({ answered: false });
            this.enigmaSystem.startEnigmaMachine();
          }, 2000);
        }
        return;
      }

      if (currentEnigma && currentEnigma.id === 'turing-test') {
        this.onStateChange({ challengeActive: false, answered: true, prismMode: true });
        this.onSetEnigmaState({ overlayAlpha: 0, paused: false });
        this.onShowCenterMessage(t('turing.unlocked'), '#9C27B0', 300);
        this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#9C27B0', 80);
        this.onCreateEffectExplosion(this.config.width / 2 - 100, this.config.height / 2, '#f1c40f', 40);
        this.onCreateEffectExplosion(this.config.width / 2 + 100, this.config.height / 2, '#2ecc71', 40);
        this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2 - 80, '#e74c3c', 30);
        this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2 + 80, '#3498db', 30);
        this.uiController.setNotification(t('turing.unlocked'), 'success');
        this.onUpdateUI();
        setTimeout(() => {
          this.uiController.hideEnigma();
          this.onStateChange({ answered: false });
          this.onSetEnigmaState({ message: '' });
        }, 8000);
        return;
      }

      // Enigma normal
      this.onStateChange({ challengeActive: false, answered: true, lastAnswerCorrect: correct });
      this.onSetEnigmaState({ overlayAlpha: 0, paused: false });
      if (getEnigmasSpawnedThisCycle() < getEnigmasPerCycle()) {
        this.onSetEnigmaState({ cooldown: true, cooldownTimer: 0 });
      }
      this.onSetEnigmaState({ cycleTimer: 0 });

      if (correct) {
        const positive = this.interactionSystem.getPositive();
        const msg = positive ? positive.message : t('enigma.correct');
        this.onShowCenterMessage('✨ ' + msg, '#2ecc71', 180);
        this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#2ecc71', 50);
        this.onCreateEffectExplosion(this.config.width / 2 - 100, this.config.height / 2 - 50, '#f1c40f', 25);
        this.onCreateEffectExplosion(this.config.width / 2 + 100, this.config.height / 2 + 50, '#2ecc71', 25);
        this.uiController.setNotification(`✨ ${msg}`, 'success');
        state.energy = Math.min(100, state.energy + 15);
        state.score += 30;
        this.onRemoveObstacles(2);
        if (this.onAddPlatform) {
          const platformCount = 2 + Math.floor(Math.random() * 2);
          const types: ('normal' | 'glowing' | 'fragile')[] = ['normal', 'normal', 'glowing', 'fragile'];
          for (let i = 0; i < platformCount; i++) {
            const platX = this.config.width + 100 + i * 150 + Math.random() * 80;
            const platY = this.groundY - 45 - Math.random() * 25;
            const platW = 60 + Math.random() * 40;
            const platType = types[Math.floor(Math.random() * types.length)];
            this.onAddPlatform(platX, platY, platW, platType);
          }
          this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#f1c40f', 30);
        }
      } else {
        const negative = this.interactionSystem.getNegative();
        const msg = negative ? negative.message : t('enigma.wrong');
        this.onShowCenterMessage('💀 ' + msg, '#e74c3c', 180);
        this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#e74c3c', 50);
        this.uiController.setNotification(`🌑 ${msg}`, 'fail');
        state.energy = Math.max(0, state.energy - 10);
        
        // Cria obstáculos usando o Registry
        for (let i = 0; i < 2; i++) {
          const types = ['spike', 'block', 'spike', 'crystal'];
          const type = types[randomInt(0, Math.min(2, Math.floor(getDifficultyLevel() / 2)))];
          
          const obs = ObstacleRegistry.create(
            type,
            this.config.width + 20 + i * 50,
            this.groundY - randomInt(25, 45)
          );
          this.onAddObstacle(obs);
          this.onCreateEffectExplosion(obs.x + obs.w / 2, obs.y + obs.h / 2, '#e74c3c', 15);
        }
        
        if (state.energy <= 0) {
          this.onStateChange({ gameOver: true });
          const gameover = this.interactionSystem.getGameOver();
          this.onShowCenterMessage('💀 ' + (gameover ? gameover.message : t('gameover.message')), '#e74c3c', 200);
          this.uiController.setNotification(t('gameover.message'), 'fail');
          this.uiController.setOptionsEnabled(false);
          return;
        }
      }
      this.onUpdateUI();
      setTimeout(() => {
        this.uiController.hideEnigma();
        this.onStateChange({ answered: false });
        this.onSetEnigmaState({ message: '' });
      }, 5000);
    });

    // ===== TIMEOUT =====
    this.enigmaSystem.onTimeout(() => {
      this.onStateChange({ challengeActive: false, answered: true });
      this.onSetEnigmaState({ overlayAlpha: 0, paused: false });
      if (getEnigmasSpawnedThisCycle() < getEnigmasPerCycle()) {
        this.onSetEnigmaState({ cooldown: true, cooldownTimer: 0 });
      }
      this.onSetEnigmaState({ cycleTimer: 0 });
      this.onShowCenterMessage(t('enigma.timeout'), '#e67e22', 180);
      this.onCreateEffectExplosion(this.config.width / 2, this.config.height / 2, '#e67e22', 40);
      this.uiController.setNotification(t('enigma.timeout'), 'fail');
      const state = getState();
      state.energy = Math.max(0, state.energy - 5);
      if (state.energy <= 0) {
        this.onStateChange({ gameOver: true });
        this.onShowCenterMessage('💀 ' + t('gameover.message'), '#e74c3c', 200);
        this.uiController.setNotification(t('gameover.message'), 'fail');
        this.uiController.setOptionsEnabled(false);
        return;
      }
      this.onUpdateUI();
      setTimeout(() => {
        this.uiController.hideEnigma();
        this.onStateChange({ answered: false });
        this.onSetEnigmaState({ message: '' });
      }, 5000);
    });
  }

  public handleEnigmaAnswer(index: number, getState: () => GameState): void {
    const state = getState();
    if (state.challengeActive && !state.answered) {
      this.enigmaSystem.answerEnigma(index);
    }
  }
}
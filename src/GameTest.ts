// src/GameTest.ts

import { EnigmaSystem } from './systems/EnigmaSystem';
import { InteractionSystem } from './systems/InteractionSystem';

export class GameTest {
  private enigmaSystem: EnigmaSystem;
  private interactionSystem: InteractionSystem;
  private codeDisplay: HTMLElement;
  private optionButtons: HTMLElement[];
  private notification: HTMLElement;
  private cycleDisplay: HTMLElement;
  private energyDisplay: HTMLElement;
  private scoreDisplay: HTMLElement;
  private enigmaCounter: number = 0;
  private hasShownWelcome: boolean = false;

  constructor(
    uiElements: {
      codeDisplay: HTMLElement;
      optionButtons: HTMLElement[];
      notification: HTMLElement;
      cycleDisplay: HTMLElement;
      energyDisplay: HTMLElement;
      scoreDisplay: HTMLElement;
    }
  ) {
    this.codeDisplay = uiElements.codeDisplay;
    this.optionButtons = uiElements.optionButtons;
    this.notification = uiElements.notification;
    this.cycleDisplay = uiElements.cycleDisplay;
    this.energyDisplay = uiElements.energyDisplay;
    this.scoreDisplay = uiElements.scoreDisplay;

    this.enigmaSystem = new EnigmaSystem();
    this.interactionSystem = new InteractionSystem();
    
    this.setupEnigmaListeners();
    this.setupButtons();

    // Mostra mensagem de boas-vindas
    this.showWelcomeMessage();
    
    this.enigmaSystem.startEnigma(0);
  }

  private showWelcomeMessage(): void {
    const welcome = this.interactionSystem.getWelcome();
    if (welcome) {
      this.notification.textContent = `🌅 ${welcome.message}`;
      this.notification.className = 'info';
      setTimeout(() => {
        this.notification.className = '';
        this.notification.textContent = '🧠 Decifre o código para começar!';
        this.notification.className = 'warning';
      }, 3000);
    }
  }

  private setupEnigmaListeners(): void {
    this.enigmaSystem.onStart((enigma) => {
      this.enigmaCounter++;
      
      // Mostra interação narrativa a cada 3 enigmas
      if (this.enigmaCounter % 3 === 0) {
        const narrative = this.interactionSystem.getNarrative();
        if (narrative) {
          this.notification.textContent = `🌙 ${narrative.message}`;
          this.notification.className = 'info';
          setTimeout(() => {
            this.notification.className = 'warning';
            this.notification.textContent = `🧠 ${enigma.question}`;
          }, 1500);
        }
      } else {
        this.notification.textContent = `🧠 ${enigma.question}`;
        this.notification.className = 'warning';
      }
      
      this.codeDisplay.innerHTML = `
        <div style="font-size:0.7rem;color:#6a7a8a;margin-bottom:4px;">
          ${enigma.type} | #${this.enigmaCounter}
        </div>
        <div style="font-size:1.8rem;margin-bottom:12px;color:#b7cdff;letter-spacing:2px;">${enigma.pattern}</div>
        <div style="font-size:0.85rem;color:#8e9bb5;margin-bottom:4px;">${enigma.rule}</div>
        <div style="font-size:0.85rem;color:#f1c40f;">${enigma.hint}</div>
      `;

      const numOptions = enigma.options.length;
      this.optionButtons.forEach((btn, i) => {
        if (i < numOptions) {
          btn.textContent = enigma.options[i];
          btn.style.display = 'block';
          btn.className = 'opt-btn';
          (btn as HTMLButtonElement).disabled = false;
        } else {
          btn.style.display = 'none';
        }
      });
    });

    this.enigmaSystem.onAnswer((correct) => {
      if (correct) {
        // Interação positiva
        const positive = this.interactionSystem.getPositive();
        if (positive) {
          this.notification.textContent = `✨ ${positive.message}`;
          this.notification.className = 'success';
        } else {
          this.notification.textContent = '✅ Correto! +10 energia';
          this.notification.className = 'success';
        }
        
        const currentEnergy = parseInt(this.energyDisplay.textContent || '100');
        this.energyDisplay.textContent = String(currentEnergy + 10);
        const currentScore = parseInt(this.scoreDisplay.textContent || '0');
        this.scoreDisplay.textContent = String(currentScore + 20);
      } else {
        // Interação negativa
        const negative = this.interactionSystem.getNegative();
        if (negative) {
          this.notification.textContent = `🌑 ${negative.message}`;
          this.notification.className = 'fail';
        } else {
          this.notification.textContent = '❌ Errado! -5 energia';
          this.notification.className = 'fail';
        }
        
        const currentEnergy = parseInt(this.energyDisplay.textContent || '100');
        this.energyDisplay.textContent = String(Math.max(0, currentEnergy - 5));
      }

      this.cycleDisplay.textContent = String(this.enigmaCounter);

      setTimeout(() => {
        this.codeDisplay.textContent = '◆ ◇ ◆ ◇';
        this.optionButtons.forEach(btn => btn.style.display = 'none');
        this.notification.className = '';
        
        const nextDifficulty = Math.min(Math.floor(this.enigmaCounter / 2), 4);
        this.enigmaSystem.startEnigma(nextDifficulty);
      }, 2000);
    });

    this.enigmaSystem.onTimeout(() => {
      this.notification.textContent = '⏰ Tempo esgotado! -3 energia';
      this.notification.className = 'fail';
      const currentEnergy = parseInt(this.energyDisplay.textContent || '100');
      this.energyDisplay.textContent = String(Math.max(0, currentEnergy - 3));

      setTimeout(() => {
        this.codeDisplay.textContent = '◆ ◇ ◆ ◇';
        this.optionButtons.forEach(btn => btn.style.display = 'none');
        this.notification.className = '';
        
        const nextDifficulty = Math.min(Math.floor(this.enigmaCounter / 2), 4);
        this.enigmaSystem.startEnigma(nextDifficulty);
      }, 2000);
    });
  }

  private setupButtons(): void {
    this.optionButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        if (this.enigmaSystem.isEnigmaActive() && !this.enigmaSystem.isEnigmaAnswered()) {
          this.enigmaSystem.answerEnigma(index);
        }
      });
    });
  }
}
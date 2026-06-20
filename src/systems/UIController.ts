// src/systems/UIController.ts

export class UIController {
  private notification: HTMLElement;
  private cycleDisplay: HTMLElement;
  private energyDisplay: HTMLElement;
  private scoreDisplay: HTMLElement;
  private restartButton: HTMLElement;
  private codeDisplay: HTMLElement;
  private optionButtons: HTMLElement[];

  constructor(
    notification: HTMLElement,
    cycleDisplay: HTMLElement,
    energyDisplay: HTMLElement,
    scoreDisplay: HTMLElement,
    restartButton: HTMLElement,
    codeDisplay: HTMLElement,
    optionButtons: HTMLElement[]
  ) {
    this.notification = notification;
    this.cycleDisplay = cycleDisplay;
    this.energyDisplay = energyDisplay;
    this.scoreDisplay = scoreDisplay;
    this.restartButton = restartButton;
    this.codeDisplay = codeDisplay;
    this.optionButtons = optionButtons;
  }

  /**
   * Atualiza os displays de estatísticas
   */
  public updateStats(cycle: number, energy: number, score: number): void {
    this.cycleDisplay.textContent = Math.floor(cycle).toString();
    this.energyDisplay.textContent = Math.floor(energy).toString();
    this.scoreDisplay.textContent = Math.floor(score).toString();
  }

  /**
   * Define a mensagem de notificação
   */
  public setNotification(message: string, type: 'info' | 'success' | 'fail' | 'warning' = 'info'): void {
    this.notification.textContent = message;
    this.notification.className = type === 'info' ? '' : type;
  }

  /**
   * Limpa a notificação
   */
  public clearNotification(): void {
    this.notification.textContent = '';
    this.notification.className = '';
  }

  /**
   * Mostra o enigma na UI
   */
  public showEnigma(visual: string, options: string[]): void {
    this.codeDisplay.textContent = visual;
    this.optionButtons.forEach((btn, i) => {
      if (i < options.length) {
        btn.textContent = options[i];
        btn.style.display = 'block';
      } else {
        btn.style.display = 'none';
      }
    });
  }

  /**
   * Esconde o enigma da UI
   */
  public hideEnigma(): void {
    this.codeDisplay.textContent = '◆ ◇ ◆ ◇';
    this.optionButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  }

  /**
   * Habilita/desabilita os botões de opção
   */
  public setOptionsEnabled(enabled: boolean): void {
    this.optionButtons.forEach(btn => {
      (btn as HTMLButtonElement).disabled = !enabled;
    });
  }

  /**
   * Reseta a UI para o estado inicial
   */
  public reset(): void {
    this.hideEnigma();
    this.clearNotification();
    this.setOptionsEnabled(false);
  }

  /**
   * Obtém o botão de restart
   */
  public getRestartButton(): HTMLElement {
    return this.restartButton;
  }
}
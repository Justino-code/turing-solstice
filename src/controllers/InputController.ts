// src/controllers/InputController.ts

type InputAction = 'jump' | 'selectOption' | 'restart';

type InputListener = (action: InputAction, data?: any) => void;

export class InputController {
  private listeners: InputListener[] = [];
  private keys: Set<string> = new Set();
  private canvas: HTMLCanvasElement;
  private optionButtons: HTMLElement[];
  private restartButton: HTMLElement;
  private isTouchDevice: boolean = false;

  constructor(canvas: HTMLCanvasElement, optionButtons: HTMLElement[], restartButton: HTMLElement) {
    this.canvas = canvas;
    this.optionButtons = optionButtons;
    this.restartButton = restartButton;
    
    this.setupKeyboardListeners();
    this.setupMouseListeners();
    this.setupTouchListeners();
    this.setupOptionListeners();
    this.setupRestartListener();
    this.detectTouchDevice();
  }

  /**
   * Registra um listener para ações de entrada
   */
  public addListener(listener: InputListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove um listener
   */
  public removeListener(listener: InputListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifica todos os listeners sobre uma ação
   */
  private notify(action: InputAction, data?: any): void {
    this.listeners.forEach(listener => listener(action, data));
  }

  /**
   * Detecta se é um dispositivo touch
   */
  private detectTouchDevice(): void {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Configura listeners de teclado
   */
  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      const key = e.key;
      
      // Evita scroll com espaço
      if (key === ' ' || key === 'Space') {
        e.preventDefault();
      }

      // Pulo: Espaço, Seta pra cima, W
      if (key === ' ' || key === 'Space' || key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (!this.keys.has(key)) {
          this.keys.add(key);
          this.notify('jump');
        }
      }

      // Atalhos numéricos para opções (1-4)
      if (key >= '1' && key <= '4') {
        const index = parseInt(key) - 1;
        if (index < this.optionButtons.length) {
          this.notify('selectOption', index);
        }
      }

      // Tecla R para restart
      if (key === 'r' || key === 'R') {
        this.notify('restart');
      }
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key;
      if (key === ' ' || key === 'Space' || key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.keys.delete(key);
      }
    });
  }

  /**
   * Configura listeners de mouse
   */
  private setupMouseListeners(): void {
    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      // Se não for dispositivo touch, pular
      if (!this.isTouchDevice) {
        this.notify('jump');
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Configura listeners de touch
   */
  private setupTouchListeners(): void {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.notify('jump');
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  /**
   * Configura listeners para os botões de opção
   */
  private setupOptionListeners(): void {
    this.optionButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.notify('selectOption', index);
      });

      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.notify('selectOption', index);
      }, { passive: false });
    });
  }

  /**
   * Configura listener para o botão de restart
   */
  private setupRestartListener(): void {
    this.restartButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.notify('restart');
    });

    this.restartButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.notify('restart');
    }, { passive: false });
  }

  /**
   * Limpa todos os listeners
   */
  public destroy(): void {
    this.listeners = [];
    this.keys.clear();
    // Remove event listeners (implementação simplificada)
  }

  /**
   * Verifica se uma tecla está pressionada
   */
  public isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  /**
   * Habilita/desabilita os botões de opção
   */
  public setOptionsEnabled(enabled: boolean): void {
    this.optionButtons.forEach(button => {
      (button as HTMLButtonElement).disabled = !enabled;
    });
  }

  /**
   * Atualiza os textos dos botões de opção
   */
  public updateOptions(options: string[]): void {
    this.optionButtons.forEach((button, index) => {
      if (index < options.length) {
        button.textContent = options[index];
      } else {
        button.textContent = '—';
      }
    });
  }

  /**
   * Limpa as cores dos botões de opção
   */
  public clearOptionsStyles(): void {
    this.optionButtons.forEach(button => {
      button.className = 'opt-btn';
    });
  }

  /**
   * Marca um botão como correto
   */
  public markOptionCorrect(index: number): void {
    if (index >= 0 && index < this.optionButtons.length) {
      this.optionButtons[index].classList.add('correct');
    }
  }

  /**
   * Marca um botão como errado
   */
  public markOptionWrong(index: number): void {
    if (index >= 0 && index < this.optionButtons.length) {
      this.optionButtons[index].classList.add('wrong');
    }
  }
}
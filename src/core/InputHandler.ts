// src/core/InputHandler.ts
// Responsável por eventos de input, teclado e interações do usuário

import { InputController } from '../controllers/InputController';
import { UIController } from '../controllers/UIController';
import { InteractionSystem } from '../systems/InteractionSystem';
import { Player } from '../entities/Player';
import { randomInt, randomFloat, createParticle } from '../utils/helpers';
import { t } from '../utils/i18n';

export class InputHandler {
  private inputController: InputController;
  private interactionSystem: InteractionSystem;
  private canvas: HTMLCanvasElement;
  private uiController: UIController;

  constructor(
    inputController: InputController,
    interactionSystem: InteractionSystem,
    canvas: HTMLCanvasElement,
    uiController: UIController
  ) {
    this.inputController = inputController;
    this.interactionSystem = interactionSystem;
    this.canvas = canvas;
    this.uiController = uiController;
  }

  public setupListeners(
    state: { paused: boolean; gameOver: boolean; enigmaPaused: boolean },
    getHasStarted: () => boolean,
    player: Player,
    particles: any[],
    onJump: () => void,
    onRestart: () => void,
    onEnigmaAnswer: (index: number) => void,
    onStart: () => void
  ): void {
    this.inputController.addListener((action, data) => {
      switch (action) {
        case 'jump':
          onJump();
          break;
        case 'restart':
          onRestart();
          break;
        case 'selectOption':
          if (data !== undefined) {
            onEnigmaAnswer(data);
          }
          break;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        state.paused = !state.paused;
        this.uiController.setNotification(state.paused ? t('pause.paused') : t('pause.continue'));
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        onJump();
        if (!getHasStarted()) {
          onStart();
          const welcome = this.interactionSystem.getWelcome();
          if (welcome) {
            this.uiController.setNotification(`🌅 ${welcome.message}`, 'info');
            setTimeout(() => {
              this.uiController.setNotification(t('welcome.decipher'), 'warning');
              setTimeout(() => {
                this.uiController.clearNotification();
              }, 4000);
            }, 5000);
          } else {
            this.uiController.setNotification(t('welcome.decipher'), 'warning');
            setTimeout(() => {
              this.uiController.clearNotification();
            }, 4000);
          }
        }
      }
    });

    this.canvas.addEventListener('click', () => {
      if (!getHasStarted()) {
        onStart();
        this.uiController.setNotification(t('start.run'));
      }
    });
  }

  public handleJump(
    state: { gameOver: boolean; paused: boolean },
    enigmaPaused: boolean,
    player: Player,
    particles: any[]
  ): void {
    if (state.gameOver || state.paused) return;
    if (enigmaPaused) return;
    player.jump();

    if (player.getJumpType() === 'double') {
      for (let i = 0; i < 8; i++) {
        particles.push(createParticle(
          player.x + player.w/2 + randomFloat(-8, 8),
          player.y + player.h,
          `hsl(200, 100%, ${randomInt(60, 80)}%)`
        ));
      }
    }
  }
}
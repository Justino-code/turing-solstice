// src/main.ts

import './style.css';
import { UIController } from './controllers/UIController';
import { Game } from './core/Game';

document.addEventListener('DOMContentLoaded', () => {
  console.log('☀︎ Turing\'s Solstice');

  // Constroi a UI primeiro
  const uiController = new UIController('app');
  
  // Obtém o canvas criado pela UI
  const canvas = uiController.getCanvas();
  
  if (!canvas) {
    console.error('Canvas não encontrado!');
    return;
  }

  // Inicia o jogo passando o UIController
  const game = new Game(canvas, uiController);

  // Expõe para debug
  (window as any).game = game;

  console.log('✅ Jogo iniciado!');
});
// src/core/GameInitializer.ts
// Responsável pela inicialização e reset do jogo

import { GameState } from '../types';
import { Player } from '../entities/Player';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { EnergyOrb } from '../entities/EnergyOrb';
import { EnigmaSystem } from '../systems/EnigmaSystem';
import { UIController } from '../controllers/UIController';
import { SceneManager } from './SceneManager';
import { EffectsManager } from './EffectsManager';
import { randomInt } from '../utils/helpers';

export class GameInitializer {
  private config: { width: number; height: number; groundHeight: number };
  private groundY: number;

  constructor(config: { width: number; height: number; groundHeight: number }) {
    this.config = config;
    this.groundY = config.height - config.groundHeight;
  }

  public getInitialState(): GameState {
    return {
      cycle: 0,
      energy: 100,
      score: 0,
      speed: 3,
      baseSpeed: 3,
      isNight: false,
      nightProgress: 0,
      gameOver: false,
      paused: false,
      challengeActive: false,
      challengeData: null,
      answered: false,
      lastAnswerCorrect: null,
      shakeX: 0,
      shakeY: 0,
      frame: 0,
      prismMode: false,
      turingUnlocked: false,
      enigmaActive: false,
      enigmaData: null,
      enigmaAnswered: false,
      enigmaCorrect: null,
      enigmaTimeLeft: 0,
      hardMode: false,
      hardModeUnlocked: localStorage.getItem('turing-hardmode-unlocked') === 'true',
      turingVision: false,
      turingVisionUnlocked: localStorage.getItem('turing-vision-unlocked') === 'true',
      spectrumMode: false,
      spectrumModeUnlocked: localStorage.getItem('turing-spectrum-unlocked') === 'true'
    };
  }

  public init(resetGame: () => void, startLoop: () => void): void {
    resetGame();
    startLoop();
  }

  public resetGame(
    getState: () => GameState,
    setState: (state: GameState) => void,
    
    player: Player,
    
    // Mudança: Obstacle[] → BaseObstacle[]
    obstacles: BaseObstacle[],
    energyOrbs: EnergyOrb[],
    particles: any[],
    
    enigmaSystem: EnigmaSystem,
    effectsManager: EffectsManager,
    sceneManager: SceneManager,
    
    setScrollX: (v: number) => void,
    setObstacleTimer: (v: number) => void,
    setDifficultyLevel: (v: number) => void,
    setScoreCounter: (v: number) => void,
    setSpeedProgress: (v: number) => void,
    setGameTime: (v: number) => void,
    setHasStarted: (v: boolean) => void,
    setObstacleCooldown: (v: number) => void,
    setEnigmaCooldown: (v: number) => void,
    setHasShownWelcome: (v: boolean) => void,
    setEnigmasPerCycle: (v: number) => void,
    setEnigmasSpawnedThisCycle: (v: number) => void,
    setCycleEnigmaTimer: (v: number) => void,
    setEnigmaCooldownTimer: (v: number) => void,
    setIsEnigmaCooldown: (v: boolean) => void,
    setEnigmaOverlayAlpha: (v: number) => void,
    setEnigmaPaused: (v: boolean) => void,
    setEnigmaTimeLimit: (v: number) => void,
    
    uiController: UIController,
    updateUI: () => void
  ): void {
    const oldState = getState();
    const hardModeUnlocked = oldState.hardModeUnlocked || localStorage.getItem('turing-hardmode-unlocked') === 'true';
    const turingVisionUnlocked = oldState.turingVisionUnlocked || localStorage.getItem('turing-vision-unlocked') === 'true';
    const spectrumModeUnlocked = oldState.spectrumModeUnlocked || localStorage.getItem('turing-spectrum-unlocked') === 'true';

    const newState = this.getInitialState();
    setState(newState);

    const state = getState();
    state.hardModeUnlocked = hardModeUnlocked;
    state.turingVisionUnlocked = turingVisionUnlocked;
    state.spectrumModeUnlocked = spectrumModeUnlocked;

    const isMobile = this.config.width < 500;
    const playerX = isMobile ? 60 : 120;
    player.reset(playerX, this.groundY - 28);

    // Limpa os arrays (agora com BaseObstacle[])
    obstacles.length = 0;
    energyOrbs.length = 0;
    particles.length = 0;

    setScrollX(0);
    setObstacleTimer(0);
    setDifficultyLevel(0);
    setScoreCounter(0);
    setSpeedProgress(0);
    setGameTime(0);
    setHasStarted(false);
    setObstacleCooldown(0);
    setEnigmaCooldown(0);
    setHasShownWelcome(false);
    setEnigmasPerCycle(0);
    setEnigmasSpawnedThisCycle(0);
    setCycleEnigmaTimer(0);
    setEnigmaCooldownTimer(0);
    setIsEnigmaCooldown(false);
    setEnigmaOverlayAlpha(0);
    setEnigmaPaused(false);
    setEnigmaTimeLimit(10);

    state.shakeX = 0;
    state.shakeY = 0;
    state.speed = 3;
    state.baseSpeed = 3;

    enigmaSystem.reset();
    effectsManager.reset();

    sceneManager.initScene();
    sceneManager.initTerrain();

    for (let i = 0; i < 5; i++) {
      energyOrbs.push(EnergyOrb.createRandom(
        randomInt(300, 750),
        { min: this.groundY - 80, max: this.groundY - 30 }
      ));
    }

    updateUI();

    uiController.reset();
    uiController.setNotification('🏃 Pressione ESPAÇO para começar!');
    uiController.showStartScreen();
  }
}
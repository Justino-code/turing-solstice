// src/core/Game.ts - Versão final com pausa e BaseObstacle

import { GameState, GameConfig } from '../types';
import { GAME_CONFIG } from '../constants/game';
import { Player } from '../entities/Player';
import { EnergyOrb } from '../entities/EnergyOrb';
import { Platform } from '../entities/Platform';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { RenderSystem } from '../systems/RenderSystem';
import { InputController } from '../controllers/InputController';
import { UIController } from '../controllers/UIController';
import { EnigmaSystem } from '../systems/EnigmaSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { randomInt } from '../utils/helpers';
import { SceneManager } from './SceneManager';
import { GameRenderer } from './GameRenderer';
import { EnigmaHandler } from './EnigmaHandler';
import { EffectsManager } from './EffectsManager';
import { GameInitializer } from './GameInitializer';
import { GameUpdater } from './GameUpdater';
import { InputHandler } from './InputHandler';
import { CollisionHandler } from './CollisionHandler';
import { ModeManager } from './ModeManager';
import { RankingService } from '../services/RankingService';
import { GlobalRankingService } from '../services/GlobalRankingService';
import { t } from '../utils/i18n';

// ===== IMPORTAÇÕES DO SISTEMA DE OBSTÁCULOS =====
import { registerBaseObstacles } from '../registries/ObstacleRegistration';
import { ObstacleRegistry } from '../registries/ObstacleRegistry';

export class Game {
  private config: GameConfig;
  private state: GameState;
  private player: Player;
  private obstacles: BaseObstacle[] = [];
  private energyOrbs: EnergyOrb[];
  private platforms: Platform[];
  private particles: any[];

  private renderSystem: RenderSystem;
  private inputController: InputController;
  private uiController: UIController;
  private enigmaSystem: EnigmaSystem;
  private interactionSystem: InteractionSystem;

  private sceneManager: SceneManager;
  private gameRenderer: GameRenderer;
  private enigmaHandler: EnigmaHandler;
  private effectsManager: EffectsManager;
  private gameInitializer: GameInitializer;
  private gameUpdater: GameUpdater;
  private inputHandler: InputHandler;
  private collisionHandler: CollisionHandler;
  private modeManager: ModeManager;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private scrollX: number = 0;
  private obstacleTimer: number = 0;
  private groundY: number;
  private difficultyLevel: number = 0;
  private scoreCounter: number = 0;
  private speedProgress: number = 0;
  private gameTime: number = 0;
  private hasStarted: boolean = false;
  private obstacleCooldown: number = 0;
  private enigmaCooldown: number = 0;
  private hasShownWelcome: boolean = false;

  private enigmasPerCycle: number = 0;
  private enigmasSpawnedThisCycle: number = 0;
  private cycleEnigmaTimer: number = 0;
  private enigmaCooldownTimer: number = 0;
  private isEnigmaCooldown: boolean = false;
  private enigmaOverlayAlpha: number = 0;
  private enigmaPaused: boolean = false;
  private enigmaTimeLimit: number = 10;

  constructor(
    canvas: HTMLCanvasElement,
    uiController: UIController
  ) {
    // ===== REGISTRA OS OBSTÁCULOS BASE =====
    registerBaseObstacles();
    console.log('✅ Obstáculos registrados:', ObstacleRegistry.getAvailableTypes());

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = { ...GAME_CONFIG };
    this.uiController = uiController;
    
    this.resizeGame();
    
    this.groundY = this.config.height - this.config.groundHeight;

    this.renderSystem = new RenderSystem(this.ctx, this.config.width, this.config.height);
    this.inputController = new InputController(canvas, this.uiController.getOptionButtons(), this.uiController.getRestartButton());
    this.enigmaSystem = new EnigmaSystem();
    this.interactionSystem = new InteractionSystem();

    this.sceneManager = new SceneManager(this.config);
    this.effectsManager = new EffectsManager();
    this.gameInitializer = new GameInitializer(this.config);
    this.gameUpdater = new GameUpdater(this.config);
    this.inputHandler = new InputHandler(this.inputController, this.interactionSystem, this.canvas, this.uiController);
    this.collisionHandler = new CollisionHandler();
    this.modeManager = new ModeManager(this.ctx, this.config.width, this.config.height, this.uiController);

    this.gameRenderer = new GameRenderer(this.ctx, this.config, this.renderSystem, this.sceneManager);

    this.enigmaHandler = new EnigmaHandler(
      this.enigmaSystem, this.interactionSystem, this.config, this.uiController,
      {
        onStateChange: (partialState) => Object.assign(this.state, partialState),
        onShowCenterMessage: (message, color, duration) => this.effectsManager.showCenterMessage(message, color, duration),
        onCreateEffectExplosion: (x, y, color, count) => this.effectsManager.createEffectExplosion(x, y, color, count),
        onAddObstacle: (obstacle) => this.obstacles.push(obstacle),
        onRemoveObstacles: (count) => {
          const toRemove = Math.min(count, this.obstacles.length);
          for (let i = 0; i < toRemove; i++) {
            if (this.obstacles.length > 0) {
              const idx = Math.floor(Math.random() * this.obstacles.length);
              const obs = this.obstacles[idx];
              this.effectsManager.createEffectExplosion(obs.x + obs.w/2, obs.y + obs.h/2, '#2ecc71', 20);
              this.obstacles.splice(idx, 1);
            }
          }
        },
        onUpdateUI: () => this.updateUI(),
        onAddPlatform: (x, y, w, type) => {
          this.platforms.push(new Platform(x, y, w, 10, type as any));
        },
        onSetEnigmaState: (s) => {
          if (s.overlayAlpha !== undefined) this.enigmaOverlayAlpha = s.overlayAlpha;
          if (s.paused !== undefined) this.enigmaPaused = s.paused;
          if (s.timeLimit !== undefined) this.enigmaTimeLimit = s.timeLimit;
          if (s.cooldown !== undefined) this.isEnigmaCooldown = s.cooldown;
          if (s.cooldownTimer !== undefined) this.enigmaCooldownTimer = s.cooldownTimer;
          if (s.cycleTimer !== undefined) this.cycleEnigmaTimer = s.cycleTimer;
          if (s.answered !== undefined) this.state.answered = s.answered;
          if (s.message !== undefined) this.effectsManager.enigmaMessage = s.message;
          if (s.messageTimer !== undefined) this.effectsManager.enigmaMessageTimer = s.messageTimer;
          if (s.messageColor !== undefined) this.effectsManager.enigmaMessageColor = s.messageColor;
        }
      }
    );

    this.state = this.gameInitializer.getInitialState();
    
    const isMobile = this.config.width < 500;
    const playerX = isMobile ? 60 : 120;
    this.player = new Player(playerX, this.groundY - 28);
    
    this.obstacles = [];
    this.energyOrbs = [];
    this.platforms = [];
    this.particles = [];

    window.addEventListener('resize', () => this.resizeGame());

    this.setupListeners();
    this.setupEnigmaListeners();
    this.setupModeListeners();
    this.setupPauseListener();
    
    this.uiController.onStartClick(() => {
      if (!this.hasStarted) {
        this.hasStarted = true;
        this.uiController.hideStartScreen();
        this.uiController.updatePauseButtonVisibility(true);
      }
    });
    
    this.init();
  }

  private resizeGame(): void {
    const container = this.canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      this.config.width = rect.width;
      this.config.height = rect.height;
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      
      if (this.renderSystem) {
        this.renderSystem.resize(rect.width, rect.height);
      }
      
      this.groundY = this.config.height - this.config.groundHeight;
      
      if (this.player) {
        const isMobile = this.config.width < 500;
        this.player.x = isMobile ? 60 : 120;
        this.player.y = this.groundY - this.player.h;
      }
    }
  }

  private init(): void {
    this.gameInitializer.init(() => this.resetGame(), () => this.startLoop());
  }

  private resetGame(): void {
    this.gameInitializer.resetGame(
      () => this.state, (state) => { this.state = state; },
      this.player, this.obstacles, this.energyOrbs, this.particles,
      this.enigmaSystem, this.effectsManager, this.sceneManager,
      (v) => { this.scrollX = v; }, (v) => { this.obstacleTimer = v; },
      (v) => { this.difficultyLevel = v; }, (v) => { this.scoreCounter = v; },
      (v) => { this.speedProgress = v; }, (v) => { this.gameTime = v; },
      (v) => { this.hasStarted = v; }, (v) => { this.obstacleCooldown = v; },
      (v) => { this.enigmaCooldown = v; }, (v) => { this.hasShownWelcome = v; },
      (v) => { this.enigmasPerCycle = v; }, (v) => { this.enigmasSpawnedThisCycle = v; },
      (v) => { this.cycleEnigmaTimer = v; }, (v) => { this.enigmaCooldownTimer = v; },
      (v) => { this.isEnigmaCooldown = v; }, (v) => { this.enigmaOverlayAlpha = v; },
      (v) => { this.enigmaPaused = v; }, (v) => { this.enigmaTimeLimit = v; },
      this.uiController,
      () => this.updateUI()
    );
    this.platforms = [];
    this.uiController.showStartScreen();
    this.updateModeButtons();
    this.uiController.updatePauseButtonVisibility(false);
  }

  private setupListeners(): void {
    this.inputHandler.setupListeners(
     {paused: this.state.paused,
      gameOver: this.state.gameOver,
      enigmaPaused: this.enigmaPaused,
     },
      () => this.hasStarted,
      this.player, this.particles,
      () => this.inputHandler.handleJump(this.state, this.enigmaPaused, this.player, this.particles),
      () => this.restart(),
      (index) => this.enigmaHandler.handleEnigmaAnswer(index, () => this.state),
      () => { 
        this.hasStarted = true;
        this.uiController.hideStartScreen();
        this.uiController.updatePauseButtonVisibility(true);
      }
    );

    document.addEventListener('keydown', (e) => {
      this.modeManager.handleKeydown(e, this.state, this.hasStarted);
    });
  }

  private setupPauseListener(): void {
    this.uiController.setPauseCallback((paused: boolean) => {
      this.state.paused = paused;
    });
  }

  private setupEnigmaListeners(): void {
    this.enigmaHandler.setupEnigmaListeners(
      () => this.state,
      () => this.difficultyLevel, () => this.enigmasPerCycle, () => this.enigmasSpawnedThisCycle
    );
  }

  private setupModeListeners(): void {
    this.uiController.setupModeButtonListeners(
      () => this.modeManager.toggleHardMode(this.state),
      () => this.modeManager.toggleTuringVision(this.state),
      () => this.modeManager.toggleSpectrumMode(this.state)
    );
  }

  private update(): void {
    // Se o jogo estiver pausado, não atualiza
    if (this.state.paused) {
      return;
    }

    this.gameUpdater.updateSpeed(
      this.hasStarted, () => this.gameTime, (v) => { this.gameTime = v; },
      this.state, (v) => { this.speedProgress = v; }
    );

    this.gameUpdater.update(
      this.state, this.player, this.obstacles, this.energyOrbs, this.particles,
      this.sceneManager, this.effectsManager, this.enigmaSystem,
      this.interactionSystem,
      () => this.scrollX, (v) => { this.scrollX = v; },
      () => this.difficultyLevel, (v) => { this.difficultyLevel = v; },
      () => this.gameTime,
      () => this.hasStarted, () => this.enigmaPaused,
      () => this.scoreCounter, (v) => { this.scoreCounter = v; },
      () => this.enigmasPerCycle, (v) => { this.enigmasPerCycle = v; },
      () => this.enigmasSpawnedThisCycle, (v) => { this.enigmasSpawnedThisCycle = v; },
      () => this.cycleEnigmaTimer, (v) => { this.cycleEnigmaTimer = v; },
      () => this.isEnigmaCooldown, (v) => { this.isEnigmaCooldown = v; },
      () => this.enigmaCooldownTimer, (v) => { this.enigmaCooldownTimer = v; },
      this.uiController,
      (m, c, d) => this.effectsManager.showCenterMessage(m, c, d),
      (x, y, c, n) => this.effectsManager.createEffectExplosion(x, y, c, n),
      () => this.collisionHandler.checkCollisions(
        this.player, this.obstacles, this.energyOrbs, this.particles,
        this.difficultyLevel, this.state,
        (baseHeal) => this.modeManager.getHealAmount(baseHeal, this.state),
        () => this.updateUI(),
        () => this.updateUI(),
        async () => {
          const msg = `${t('gameover.message')} ${t('gameover.level')} ${this.difficultyLevel + 1}`;
          this.uiController.setNotification(msg, 'fail');
          this.uiController.updatePauseButtonVisibility(false);
          
          const mode = this.state.hardMode ? 'hard' : 
                       this.state.turingVision ? 'vision' : 
                       this.state.spectrumMode ? 'spectrum' : 'normal';
          const finalScore = Math.floor(this.state.score);
          
          RankingService.addScore(finalScore, this.state.cycle, mode);
          
          if (GlobalRankingService.isConfigured()) {
            const qualifies = await GlobalRankingService.qualifiesForGlobal(finalScore);
            
            if (qualifies) {
              if (!RankingService.hasCustomName()) {
                const currentName = RankingService.getPlayerName();
                const newName = await this.uiController.promptPlayerName(currentName);
                if (newName !== null && newName.trim() !== '') {
                  RankingService.setPlayerName(newName.trim());
                } else if (newName !== null) {
                  RankingService.setPlayerName('Anônimo');
                }
              }
              
              if (RankingService.hasCustomName()) {
                GlobalRankingService.submitScore(finalScore, this.state.cycle, mode);
              }
            }
          }
        }
      ),
      () => this.spawnObstacles(),
      () => this.spawnOrbs(),
      () => this.updateUI(),
      () => this.render()
    );

    this.modeManager.checkUnlocks(this.state);
    this.updateModeButtons();

    for (const platform of this.platforms) {
      platform.update(this.state.speed);
    }
    this.platforms = this.platforms.filter(p => p.isActive() && !p.isOffScreen(this.config.width));

    for (const platform of this.platforms) {
      if (platform.isPlayerOn(this.player) && this.player.vy >= 0) {
        this.player.y = platform.y - this.player.h;
        this.player.vy = 0;
        this.player.grounded = true;
        
        if (platform.type === 'fragile') {
          const destroyed = platform.takeDamage(1);
          if (destroyed) {
            this.effectsManager.createEffectExplosion(platform.x + platform.w/2, platform.y, '#e67e22', 15);
          }
        }
        break;
      }
    }
  }

  private spawnObstacles(): void {
    if (!this.hasStarted) return;
    if (this.obstacleCooldown > 0) { this.obstacleCooldown--; return; }

    const baseInterval = Math.max(18, 50 - this.difficultyLevel * 2 - this.state.speed * 0.2);
    this.obstacleTimer++;
    if (this.obstacleTimer >= baseInterval) {
      this.obstacleTimer = 0;
      const chance = 0.4 + this.difficultyLevel * 0.03 + this.state.speed * 0.005;
      const chanceMultiplier = this.modeManager.getObstacleChanceMultiplier(this.state);
      
      if (Math.random() < chance * chanceMultiplier) {
        const isMobile = this.config.width < 500;
        const spawnDistance = isMobile ? this.config.width + 100 : this.config.width + 20;
        
        const heightOptions = [
          this.groundY - randomInt(20, 30),
          this.groundY - randomInt(35, 50),
          this.groundY - randomInt(55, 75),
          this.groundY - randomInt(80, 100)
        ];
        
        const maxIndex = Math.min(Math.floor(this.difficultyLevel / 2) + 1, heightOptions.length - 1);
        const y = heightOptions[randomInt(0, maxIndex)];
        
        const obstacle = ObstacleRegistry.createRandom(
          spawnDistance, 
          { min: y - 10, max: y + 10 }, 
          this.difficultyLevel
        );
        
        obstacle.active = true;
        this.obstacles.push(obstacle);
        this.obstacleCooldown = 8;

        if (this.difficultyLevel > 2 && this.modeManager.shouldSpawnDouble(this.state)) {
          const y2 = heightOptions[randomInt(0, maxIndex)];
          const spawnDistance2 = isMobile ? spawnDistance + 100 : spawnDistance + 50 + randomInt(10, 20);
          
          const obstacle2 = ObstacleRegistry.createRandom(
            spawnDistance2, 
            { min: y2 - 10, max: y2 + 10 }, 
            this.difficultyLevel
          );
          obstacle2.active = true;
          this.obstacles.push(obstacle2);
          this.obstacleCooldown = 12;
        }
      }
    }
  }

  private spawnOrbs(): void {
    if (!this.hasStarted) return;
    const interval = Math.max(40, 70 - this.difficultyLevel * 2);
    if (this.state.frame % interval === 0 && Math.random() < 0.25) {
      this.energyOrbs.push(EnergyOrb.createRandom(this.config.width + 20, { min: this.groundY - 70, max: this.groundY - 25 }));
    }
  }

  private render(): void {
    this.gameRenderer.render(
      this.state, this.player, this.obstacles, this.energyOrbs, this.platforms,
      this.particles, this.effectsManager.getParticles(),
      this.scrollX, this.hasStarted,
      this.enigmaOverlayAlpha, this.effectsManager.enigmaMessage,
      this.effectsManager.enigmaMessageTimer, this.effectsManager.enigmaMessageColor,
      this.speedProgress, this.difficultyLevel
    );
    this.modeManager.renderEffects(this.state);
  }

  private gameLoop(timestamp: number): void {
    this.lastTime = timestamp;
    if (!this.state.gameOver && !this.state.paused) this.update();
    this.render();
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  private startLoop(): void { 
    if (this.isRunning) return; 
    this.isRunning = true; 
    this.lastTime = performance.now(); 
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t)); 
  }
  
  private stopLoop(): void { 
    if (this.animationId !== null) { 
      cancelAnimationFrame(this.animationId); 
      this.animationId = null; 
    } 
    this.isRunning = false; 
  }

  public restart(): void { 
    this.stopLoop(); 
    this.resetGame(); 
    this.startLoop(); 
  }

  private updateUI(): void { 
    this.uiController.updateStats(this.state.cycle, this.state.energy, this.state.score); 
  }

  private updateModeButtons(): void {
    this.uiController.updateModeButtons({
      hardModeUnlocked: this.state.hardModeUnlocked,
      turingVisionUnlocked: this.state.turingVisionUnlocked,
      spectrumModeUnlocked: this.state.spectrumModeUnlocked,
      hardMode: this.state.hardMode,
      turingVision: this.state.turingVision,
      spectrumMode: this.state.spectrumMode
    });
  }

  public destroy(): void { 
    this.stopLoop(); 
    this.inputController.destroy(); 
  }
}
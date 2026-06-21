// src/core/GameRenderer.ts
// Adapter entre Game e RenderSystem

import { GameState } from '../types';
import { RenderSystem } from '../systems/RenderSystem';
import { Player } from '../entities/Player';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { Platform } from '../entities/Platform';
import { SceneManager } from './SceneManager';
import { t } from '../utils/i18n';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: { width: number; height: number; groundHeight: number };
  private groundY: number;
  private renderSystem: RenderSystem;
  private sceneManager: SceneManager;

  constructor(
    ctx: CanvasRenderingContext2D,
    config: { width: number; height: number; groundHeight: number },
    renderSystem: RenderSystem,
    sceneManager: SceneManager
  ) {
    this.ctx = ctx;
    this.config = config;
    this.groundY = config.height - config.groundHeight;
    this.renderSystem = renderSystem;
    this.sceneManager = sceneManager;
  }

  public render(
    state: GameState,
    player: Player,
    obstacles: BaseObstacle[], // Mudança: any[] → BaseObstacle[]
    energyOrbs: any[],
    platforms: Platform[],
    particles: any[],
    effectParticles: any[],
    scrollX: number,
    hasStarted: boolean,
    enigmaOverlayAlpha: number,
    enigmaMessage: string,
    enigmaMessageTimer: number,
    enigmaMessageColor: string,
    speedProgress: number,
    difficultyLevel: number
  ): void {
    const ctx = this.ctx;

    this.renderSystem.clear();

    ctx.save();
    ctx.translate(state.shakeX, state.shakeY);

    // Fundo
    this.renderSystem.renderBackground(state, scrollX);
    this.renderSystem.renderBackgroundElements(
      this.sceneManager.backgroundElements,
      state.isNight,
      this.groundY
    );
    this.renderSystem.renderBuildings(
      this.sceneManager.buildings,
      state.isNight,
      this.groundY
    );
    this.renderSystem.renderClouds(
      this.sceneManager.clouds,
      state.isNight
    );
    this.renderSystem.renderTerrain(
      this.sceneManager.terrainSegments,
      this.groundY
    );
    this.renderSystem.renderGroundDetails(
      this.sceneManager.groundDetails,
      state.isNight,
      this.groundY
    );

    // Obstáculos (agora BaseObstacle[])
    for (const obstacle of obstacles) {
      this.renderSystem.renderObstacle(obstacle);
    }

    // Plataformas
    for (const platform of platforms) {
      this.renderSystem.renderPlatform(platform, state.isNight);
    }

    // Orbs
    for (const orb of energyOrbs) {
      this.renderSystem.renderEnergyOrb(orb);
    }

    this.renderSystem.renderParticles(particles);

    // Partículas de efeito
    for (const particle of effectParticles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * particle.alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Jogador
    this.renderSystem.renderPlayer(player, state.isNight, 0, 0);
    this.renderSystem.renderJumpIndicator(player, hasStarted);
    this.renderSystem.renderHUD(state, speedProgress, difficultyLevel, hasStarted);

    // Overlay do enigma
    this.renderSystem.renderEnigmaOverlay(
      state,
      enigmaOverlayAlpha,
      enigmaMessage,
      enigmaMessageTimer,
      enigmaMessageColor
    );

    // Tela inicial
    if (!hasStarted && !state.gameOver) {
      this.renderSystem.renderStartScreen();
    }

    // Game over
    if (state.gameOver) {
      this.renderSystem.renderGameOver(state);
    }

    ctx.restore();
  }
}
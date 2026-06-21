// src/systems/RenderSystem.ts - Versão refatorada (coordenador)
// Coordena todos os renderers especializados

import { Player, Platform, EnergyOrb, Particle, GameState, Challenge } from '../types';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { BackgroundRenderer } from './BackgroundRenderer';
import { EntityRenderer } from './EntityRenderer';
import { EffectRenderer } from './EffectRenderer';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private backgroundRenderer: BackgroundRenderer;
  private entityRenderer: EntityRenderer;
  private effectRenderer: EffectRenderer;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.backgroundRenderer = new BackgroundRenderer(ctx, width, height);
    this.entityRenderer = new EntityRenderer(ctx, width, height);
    this.effectRenderer = new EffectRenderer(ctx, width, height);
  }

  // ===== UTILITÁRIOS =====

  public clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  public applyShake(intensity: number): { x: number; y: number } {
    return {
      x: (Math.random() - 0.5) * Math.min(intensity, 15),
      y: (Math.random() - 0.5) * Math.min(intensity, 15)
    };
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.backgroundRenderer.resize(width, height);
    this.entityRenderer.resize(width, height);
    this.effectRenderer.resize(width, height);
  }

  // ===== FUNDO E AMBIENTE (BackgroundRenderer) =====

  public renderBackground(state: GameState, scrollX: number): void {
    this.backgroundRenderer.renderBackground(state, scrollX);
  }

  public renderGround(isNight: boolean, scrollX: number): void {
    this.backgroundRenderer.renderGround(isNight, scrollX);
  }

  public renderBackgroundElements(backgroundElements: any[], isNight: boolean, groundY: number): void {
    this.backgroundRenderer.renderBackgroundElements(backgroundElements, isNight, groundY);
  }

  public renderClouds(clouds: any[], isNight: boolean): void {
    this.backgroundRenderer.renderClouds(clouds, isNight);
  }

  public renderBuildings(buildings: any[], isNight: boolean, groundY: number): void {
    this.backgroundRenderer.renderBuildings(buildings, isNight, groundY);
  }

  public renderTerrain(terrainSegments: any[], groundY: number): void {
    this.backgroundRenderer.renderTerrain(terrainSegments, groundY);
  }

  public renderGroundDetails(groundDetails: any[], isNight: boolean, groundY: number): void {
    this.backgroundRenderer.renderGroundDetails(groundDetails, isNight, groundY);
  }

  // ===== ENTIDADES (EntityRenderer) =====

  public setState(state: GameState): void {
    this.entityRenderer.setState(state);
  }

  public renderPlayer(player: Player, isNight: boolean, shakeX: number = 0, shakeY: number = 0): void {
    this.entityRenderer.renderPlayer(player, isNight, shakeX, shakeY);
  }

  public renderPlatform(platform: Platform, isNight: boolean): void {
    this.entityRenderer.renderPlatform(platform, isNight);
  }

  // Mudança: Obstacle → BaseObstacle
  public renderObstacle(obstacle: BaseObstacle): void {
    this.entityRenderer.renderObstacle(obstacle);
  }

  public renderEnergyOrb(orb: EnergyOrb): void {
    this.entityRenderer.renderEnergyOrb(orb);
  }

  public renderJumpIndicator(player: Player, hasStarted: boolean): void {
    this.entityRenderer.renderJumpIndicator(player, hasStarted);
  }

  public renderHUD(state: GameState, speedProgress: number, difficultyLevel: number, hasStarted: boolean): void {
    this.entityRenderer.renderHUD(state, speedProgress, difficultyLevel, hasStarted);
  }

  // ===== EFEITOS E UI (EffectRenderer) =====

  public renderParticles(particles: Particle[]): void {
    this.effectRenderer.renderParticles(particles);
  }

  public renderChallengeOverlay(challenge: Challenge, answered: boolean, isCorrect: boolean | null): void {
    this.effectRenderer.renderChallengeOverlay(challenge, answered, isCorrect);
  }

  public renderGameOver(state: GameState): void {
    this.effectRenderer.renderGameOver(state);
  }

  public renderPrismEffect(progress: number): void {
    this.effectRenderer.renderPrismEffect(progress);
  }

  public renderStartScreen(): void {
    this.effectRenderer.renderStartScreen();
  }

  public renderEnigmaOverlay(
    state: GameState,
    enigmaOverlayAlpha: number,
    enigmaMessage: string,
    enigmaMessageTimer: number,
    enigmaMessageColor: string
  ): void {
    this.effectRenderer.renderEnigmaOverlay(state, enigmaOverlayAlpha, enigmaMessage, enigmaMessageTimer, enigmaMessageColor);
  }
}
// src/core/GameUpdater.ts
// Responsável pela lógica de update do jogo

import { GameState } from '../types';
import { Player } from '../entities/Player';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { EnergyOrb } from '../entities/EnergyOrb';
import { EnigmaSystem } from '../systems/EnigmaSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { UIController } from '../controllers/UIController';
import { SceneManager } from './SceneManager';
import { EffectsManager } from './EffectsManager';
import { randomInt } from '../utils/helpers';
import { t } from '../utils/i18n';
import { UNLOCK_CYCLES } from '@/constants/game';

export class GameUpdater {
  private config: { width: number; height: number; groundHeight: number };
  private groundY: number;

  constructor(config: { width: number; height: number; groundHeight: number }) {
    this.config = config;
    this.groundY = config.height - config.groundHeight;
  }

  public updateSpeed(
    hasStarted: boolean,
    getGameTime: () => number,
    setGameTime: (v: number) => void,
    state: GameState,
    setSpeedProgress: (v: number) => void
  ): void {
    if (!hasStarted) return;

    let gameTime = getGameTime();
    gameTime += 0.016;
    setGameTime(gameTime);

    const minSpeed = 3;
    const maxSpeed = 13;
    const progress = Math.min(gameTime / 40, 1);
    const accelerationCurve = progress * progress * (3 - 2 * progress);

    state.speed = minSpeed + (maxSpeed - minSpeed) * accelerationCurve;
    state.baseSpeed = state.speed;
    setSpeedProgress(accelerationCurve);
  }

  public update(
    state: GameState,
    player: Player,
    obstacles: BaseObstacle[], // Mudança: Obstacle[] → BaseObstacle[]
    energyOrbs: EnergyOrb[],
    particles: any[],
    sceneManager: SceneManager,
    effectsManager: EffectsManager,
    enigmaSystem: EnigmaSystem,
    interactionSystem: InteractionSystem,
    
    getScrollX: () => number,
    setScrollX: (v: number) => void,
    getDifficultyLevel: () => number,
    setDifficultyLevel: (v: number) => void,
    getGameTime: () => number,
    getHasStarted: () => boolean,
    getEnigmaPaused: () => boolean,
    getScoreCounter: () => number,
    setScoreCounter: (v: number) => void,
    getEnigmasPerCycle: () => number,
    setEnigmasPerCycle: (v: number) => void,
    getEnigmasSpawnedThisCycle: () => number,
    setEnigmasSpawnedThisCycle: (v: number) => void,
    getCycleEnigmaTimer: () => number,
    setCycleEnigmaTimer: (v: number) => void,
    getIsEnigmaCooldown: () => boolean,
    setIsEnigmaCooldown: (v: boolean) => void,
    getEnigmaCooldownTimer: () => number,
    setEnigmaCooldownTimer: (v: number) => void,
    
    uiController: UIController,
    
    showCenterMessage: (message: string, color: string, duration: number) => void,
    createEffectExplosion: (x: number, y: number, color: string, count: number) => void,
    checkCollisions: () => void,
    spawnObstacles: () => void,
    spawnOrbs: () => void,
    updateUI: () => void,
    render: () => void
  ): void {
    if (state.gameOver || state.paused) return;

    if (getEnigmaPaused()) {
      render();
      return;
    }

    const newDifficulty = Math.floor(getGameTime() / 15);
    let difficultyLevel = getDifficultyLevel();
    if (newDifficulty > difficultyLevel) {
      difficultyLevel = newDifficulty;
      setDifficultyLevel(difficultyLevel);
      if (difficultyLevel > 0) {
        uiController.showTimedNotification(`${t('level.new')} ${difficultyLevel + 1}`, 'warning', 3000);
      }
    }

    let scrollX = getScrollX();
    scrollX += state.speed;
    setScrollX(scrollX);

    player.update(this.groundY, []);

    if (player.y + player.h > this.groundY) {
      player.y = this.groundY - player.h;
      player.vy = 0;
      player.grounded = true;
    }

    // Atualiza obstáculos (agora BaseObstacle[])
    for (const obstacle of obstacles) {
      obstacle.update(state.speed);
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      if (obstacles[i].x + obstacles[i].w <= -50) {
        obstacles.splice(i, 1);
      }
    }

    for (const orb of energyOrbs) {
      orb.update(state.speed);
    }
    for (let i = energyOrbs.length - 1; i >= 0; i--) {
      if (energyOrbs[i].x + energyOrbs[i].radius <= -30 || energyOrbs[i].collected) {
        energyOrbs.splice(i, 1);
      }
    }

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.08;
      particle.life--;
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    effectsManager.update();
    effectsManager.updateMessage();

    sceneManager.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * 0.3;
      if (cloud.x + cloud.w < -50) {
        cloud.x = this.config.width + randomInt(20, 100);
        cloud.y = randomInt(20, 150);
        cloud.w = randomInt(80, 200);
      }
    });

    sceneManager.buildings.forEach(building => {
      building.x -= state.speed * 0.1;
      if (building.x + building.w < -50) {
        building.x = this.config.width + randomInt(20, 100);
        building.w = randomInt(30, 70);
        building.h = randomInt(60, 180);
      }
    });

    sceneManager.backgroundElements.forEach(element => {
      element.x -= state.speed * 0.05;
      if (element.x + element.w < -50) {
        element.x = this.config.width + randomInt(20, 100);
      }
    });

    sceneManager.groundDetails.forEach(detail => {
      detail.x -= state.speed;
      if (detail.x < -10) {
        detail.x = this.config.width + randomInt(10, 50);
        detail.type = randomInt(0, 2) === 0 ? 'grass' : 'flower';
        detail.size = randomInt(3, 10);
      }
    });

    sceneManager.terrainSegments.forEach(segment => {
      segment.x -= state.speed;
    });

    if (sceneManager.terrainSegments[0] && 
        sceneManager.terrainSegments[0].x + sceneManager.terrainSegments[0].width < -100) {
      sceneManager.terrainSegments.shift();
      const lastSegment = sceneManager.terrainSegments[sceneManager.terrainSegments.length - 1];
      const types = ['flat', 'desert', 'dirt', 'asphalt', 'grass'];
      const type = types[randomInt(0, types.length - 1)];
      sceneManager.terrainSegments.push({
        x: lastSegment.x + lastSegment.width,
        width: randomInt(250, 500),
        type: type,
        heightOffset: randomInt(-15, 15),
        color: sceneManager.getTerrainColor(type)
      });
    }

    checkCollisions();
    spawnObstacles();
    spawnOrbs();

    // ===== SISTEMA DE ENIGMAS =====
    const currentCycle = Math.floor(state.score / 150);

    if (currentCycle > state.cycle) {
      state.cycle = currentCycle;
      
      if (Math.random() < 0.7 && currentCycle >= 1) {
        setEnigmasPerCycle(1 + Math.floor(Math.random() * 2));
      } else {
        setEnigmasPerCycle(0);
      }
      
      setEnigmasSpawnedThisCycle(0);
      setCycleEnigmaTimer(0);
      
      console.log(`🔄 Ciclo ${currentCycle}: ${getEnigmasPerCycle()} enigma(s)`);
    }

    const canSpawnEnigma = 
      getHasStarted() &&
      !state.challengeActive &&
      !state.answered &&
      getEnigmasSpawnedThisCycle() < getEnigmasPerCycle() &&
      getEnigmasPerCycle() > 0 &&
      !state.gameOver;

    if (canSpawnEnigma) {
      if (!getIsEnigmaCooldown()) {
        let cycleEnigmaTimer = getCycleEnigmaTimer();
        cycleEnigmaTimer++;
        setCycleEnigmaTimer(cycleEnigmaTimer);
        
        const minDelay = 600;
        const maxDelay = 1200;
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        
        if (cycleEnigmaTimer > delay) {
          setCycleEnigmaTimer(0);
          setEnigmasSpawnedThisCycle(getEnigmasSpawnedThisCycle() + 1);
          
          console.log(`⚡ SPAWN ENIGMA! Ciclo ${state.cycle}`);
          
          showCenterMessage(t('enigma.new_code'), '#f1c40f', 30);
          createEffectExplosion(this.config.width / 2, this.config.height / 2, '#f1c40f', 15);
          
          setTimeout(async () => {
            await enigmaSystem.startEnigma(difficultyLevel);
          }, 500);
          
          setIsEnigmaCooldown(true);
          setEnigmaCooldownTimer(0);
        }
      }
    }

    if (getIsEnigmaCooldown()) {
      let enigmaCooldownTimer = getEnigmaCooldownTimer();
      enigmaCooldownTimer++;
      setEnigmaCooldownTimer(enigmaCooldownTimer);
      
      const cooldownDuration = 1500 + Math.random() * 900;
      
      if (enigmaCooldownTimer > cooldownDuration) {
        setIsEnigmaCooldown(false);
        setEnigmaCooldownTimer(0);
        console.log('✅ Cooldown terminado');
      }
    }

    // ===== O ÚLTIMO CÓDIGO - TURING TEST =====
    if (state.cycle >= UNLOCK_CYCLES.TURING_TEST && !state.turingUnlocked && !state.challengeActive && !getEnigmaPaused()) {
      state.turingUnlocked = true;
      
      showCenterMessage(t('turing.title'), '#9C27B0', 300);
      createEffectExplosion(this.config.width / 2, this.config.height / 2, '#9C27B0', 60);
      
      setTimeout(async () => {
        await enigmaSystem.startEnigmaMachine();
      }, 3000);
    }

    // ===== INTERAÇÕES DA IA =====
    if (getHasStarted() && !state.gameOver && !state.challengeActive && !getEnigmaPaused()) {
      if (state.frame % 1500 === 0) {
        const narrative = interactionSystem.getNarrative();
        if (narrative) {
          showCenterMessage(`🌐 ${narrative.message}`, '#b7cdff', 250);
          uiController.setNotification(`🌐 ${narrative.message}`, 'info');
        }
      }
      
      if (state.frame % 3000 === 0) {
        const hint = interactionSystem.getHint();
        if (hint) {
          showCenterMessage(`💡 ${hint.message}`, '#f1c40f', 200);
          uiController.setNotification(`💡 ${hint.message}`, 'info');
        }
      }
      
      if (state.frame % 3600 === 0) {
        const challenge = interactionSystem.getChallenge();
        if (challenge) {
          showCenterMessage(`🔥 ${challenge.message}`, '#e74c3c', 200);
          uiController.setNotification(`🔥 ${challenge.message}`, 'warning');
        }
      }
    }

    state.nightProgress = (state.nightProgress + 0.0005) % 1;
    state.isNight = state.nightProgress > 0.5;

    if (getHasStarted()) {
      let scoreCounter = getScoreCounter();
      scoreCounter += 0.1 + state.speed * 0.006;
      if (scoreCounter >= 1) {
        state.score += 1;
        scoreCounter = 0;
      }
      setScoreCounter(scoreCounter);
    }

    sceneManager.sceneChangeTimer++;
    if (state.score > 300 && sceneManager.sceneChangeTimer > 800) {
      const sceneName = sceneManager.changeScene();
      uiController.showTimedNotification(`📍 ${sceneName}`, 'success', 4000);
      setTimeout(() => {
        if (!state.gameOver) {
          uiController.setNotification(t('scene.continue'));
        }
      }, 4000);
    }

    state.shakeX *= 0.9;
    state.shakeY *= 0.9;
    if (Math.abs(state.shakeX) < 0.05) state.shakeX = 0;
    if (Math.abs(state.shakeY) < 0.05) state.shakeY = 0;

    state.frame++;
    updateUI();
  }
}
// src/core/CollisionHandler.ts
// Responsável por detecção e tratamento de colisões

import { Player } from '../entities/Player';
import { BaseObstacle } from '../entities/obstacles/BaseObstacle';
import { EnergyOrb } from '../entities/EnergyOrb';
import { randomFloat, randomInt, createParticle } from '../utils/helpers';

export class CollisionHandler {
  public checkCollisions(
    player: Player,
    obstacles: BaseObstacle[],
    energyOrbs: EnergyOrb[],
    particles: any[],
    difficultyLevel: number,
    state: { energy: number; score: number; shakeX: number; shakeY: number; gameOver: boolean },
    getHealAmount: (baseHeal: number) => number,
    onDamage: () => void,
    onHeal: () => void,
    onGameOver: () => void
  ): void {
    // ===== COLISÃO COM OBSTÁCULOS (USANDO CÍRCULO PARA MAIOR PRECISÃO) =====
    const playerCenterX = player.x + player.w / 2;
    const playerCenterY = player.y + player.h / 2;
    const playerRadius = Math.min(player.w, player.h) / 2 * 0.85;
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      
      if (!obstacle.active) continue;
      
      // Usa colisão por círculo para maior precisão
      const collides = obstacle.collidesWithCircle(playerCenterX, playerCenterY, playerRadius);
      
      if (collides) {
        // Calcula o dano baseado no tipo
        let damage = 8 + difficultyLevel * 2;
        if (obstacle.type === 'void') damage += 5;
        if (obstacle.type === 'storm') damage += 3;
        if (obstacle.type === 'watcher') damage += 2;
        
        state.energy = Math.max(0, state.energy - damage);
        
        // Efeito de tela
        state.shakeX = (Math.random() - 0.5) * 15;
        state.shakeY = (Math.random() - 0.5) * 15;

        // Cria explosão de partículas
        const particleColor = obstacle.getColor();
        for (let j = 0; j < 30; j++) {
          particles.push(createParticle(
            obstacle.x + obstacle.w/2 + randomFloat(-12, 12),
            obstacle.y + obstacle.h/2 + randomFloat(-12, 12),
            particleColor
          ));
        }

        // Remove o obstáculo
        obstacles.splice(i, 1);
        
        // Notifica dano
        onDamage();

        // Verifica game over
        if (state.energy <= 0) {
          state.gameOver = true;
          onGameOver();
          return;
        }
      }
    }

    // ===== COLISÃO COM ORBS DE ENERGIA =====
    for (let i = energyOrbs.length - 1; i >= 0; i--) {
      const orb = energyOrbs[i];
      
      if (orb.collected) continue;
      
      const dx = playerCenterX - orb.x;
      const dy = playerCenterY - orb.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const collisionDistance = playerRadius + orb.radius * 0.8;
      
      if (distance < collisionDistance) {
        orb.collect();
        
        const baseHeal = Math.max(3, 10 - Math.floor(difficultyLevel / 2));
        const heal = getHealAmount(baseHeal);
        state.energy = Math.min(100, state.energy + heal);
        state.score += 15;

        // Efeito de partículas para a orb
        for (let j = 0; j < 20; j++) {
          particles.push(createParticle(
            orb.x + randomFloat(-10, 10),
            orb.y + randomFloat(-10, 10),
            `hsl(50, 100%, ${randomInt(60, 80)}%)`
          ));
        }

        energyOrbs.splice(i, 1);
        onHeal();
      }
    }
  }
}
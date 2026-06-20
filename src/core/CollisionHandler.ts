// src/core/CollisionHandler.ts
// Responsável por detecção e tratamento de colisões

import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { EnergyOrb } from '../entities/EnergyOrb';
import { randomFloat, randomInt, createParticle } from '../utils/helpers';

export class CollisionHandler {
  public checkCollisions(
    player: Player,
    obstacles: Obstacle[],
    energyOrbs: EnergyOrb[],
    particles: any[],
    difficultyLevel: number,
    state: { energy: number; score: number; shakeX: number; shakeY: number; gameOver: boolean },
    getHealAmount: (baseHeal: number) => number,
    onDamage: () => void,
    onHeal: () => void,
    onGameOver: () => void
  ): void {
    // Colisão com obstáculos
    for (const obstacle of obstacles) {
      if (player.collidesWith(obstacle)) {
        const damage = 8 + difficultyLevel * 2;
        state.energy = Math.max(0, state.energy - damage);
        state.shakeX = (Math.random() - 0.5) * 10;
        state.shakeY = (Math.random() - 0.5) * 10;

        for (let i = 0; i < 20; i++) {
          particles.push(createParticle(
            obstacle.x + obstacle.w/2 + randomFloat(-8, 8),
            obstacle.y + obstacle.h/2 + randomFloat(-8, 8),
            `hsl(0, 100%, ${randomInt(40, 70)}%)`
          ));
        }

        const idx = obstacles.indexOf(obstacle);
        if (idx > -1) obstacles.splice(idx, 1);

        onDamage();

        if (state.energy <= 0) {
          state.gameOver = true;
          onGameOver();
          return;
        }
        break;
      }
    }

    // Colisão com orbs de energia
    for (const orb of energyOrbs) {
      if (!orb.collected && player.collidesWithCircle(orb)) {
        orb.collect();
        const baseHeal = Math.max(3, 10 - Math.floor(difficultyLevel / 2));
        const heal = getHealAmount(baseHeal);
        state.energy = Math.min(100, state.energy + heal);
        state.score += 15;

        for (let i = 0; i < 12; i++) {
          particles.push(createParticle(orb.x, orb.y, `hsl(50, 100%, ${randomInt(60, 80)}%)`));
        }

        onHeal();
      }
    }
  }
}
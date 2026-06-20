// src/constants/game.ts

import { GameConfig } from '../types';

export const GAME_CONFIG: GameConfig = {
  width: 800,
  height: 450,
  gravity: 0.55,
  jumpForce: -9.5,
  playerWidth: 20,
  playerHeight: 28,
  groundHeight: 30,
  initialEnergy: 30
};

export const PLAYER = {
  WIDTH: 20,
  HEIGHT: 28,
  JUMP_FORCE: -9.5,
  GRAVITY: 0.55,
  MAX_FALL_SPEED: 12,
  X_POSITION: 120
};

export const PHYSICS = {
  GRAVITY: 0.55,
  FRICTION: 0.98,
  BOUNCE: 0.3,
  MAX_SPEED: 15
};

export const SCORING = {
  CORRECT_ANSWER_BONUS: 20,
  ENERGY_ORB_VALUE: 3,
  CYCLE_BONUS_MULTIPLIER: 2,
  WRONG_ANSWER_PENALTY: 8,
  OBSTACLE_DAMAGE: 12,
  BASE_CYCLE_SCORE: 20
};

export const SPAWN_RATES = {
  OBSTACLE_BASE_INTERVAL: 90,
  OBSTACLE_MIN_INTERVAL: 30,
  ENERGY_ORB_INTERVAL: 120,
  PLATFORM_SPAWN_CHANCE: 0.3
};

export const CHALLENGE = {
  INITIAL_DELAY: 600,
  CORRECT_DELAY: 1800,
  WRONG_DELAY: 2600,
  MAX_OPTIONS: 4
};

export const RENDER = {
  NIGHT_ALPHA: 0.35,
  DAY_ALPHA: 0.05,
  SHAKE_DECAY: 0.88,
  SHAKE_MAX: 10
};

export const COLORS = {
  // Dia
  DAY_BG_TOP: '#2a3a5a',
  DAY_BG_BOTTOM: '#4a6a8a',
  DAY_GROUND: '#2d4055',
  DAY_GROUND_TOP: '#3e5a78',
  DAY_PLATFORM: '#6a8aaa',
  
  // Noite
  NIGHT_BG_TOP: '#0b0e1a',
  NIGHT_BG_BOTTOM: '#151d2b',
  NIGHT_GROUND: '#1a2332',
  NIGHT_GROUND_TOP: '#2a3346',
  NIGHT_PLATFORM: '#3a4a6a',
  
  // Elementos
  OBSTACLE: '#e74c3c',
  OBSTACLE_GLOW: '#ff4444',
  ENERGY_ORB: '#f1c40f',
  ENERGY_ORB_GLOW: 'rgba(247,220,111,0.3)',
  PLAYER_DAY: '#ffcc44',
  PLAYER_NIGHT: '#66ccff',
  PLAYER_HEAD_DAY: '#ffdd55',
  PLAYER_HEAD_NIGHT: '#88ddff',
  PLAYER_EYE: '#222222',
  
  // UI
  TEXT_PRIMARY: '#e0e6ed',
  TEXT_SECONDARY: '#8e9bb5',
  SUCCESS: '#2ecc71',
  ERROR: '#e74c3c',
  WARNING: '#f39c12'
};

export const DIFFICULTY = {
  SPEED_INCREASE: 0.15,
  CYCLE_PER_DIFFICULTY: 3,
  MAX_DIFFICULTY_LEVELS: 5
};

export const TURING = {
  UNLOCK_CYCLE: 10,
  PRISM_UNLOCK_CYCLE: 15,
  SECRET_MESSAGE: '01010100 01110101 01110010 01101001 01101110 01100111 00100000 01101001 01110011 00100000 01110100 01101000 01100101 00100000 01101011 01100101 01111001'
};

export const UI = {
  NOTIFICATION_DURATION: 2000,
  SCORE_UPDATE_INTERVAL: 100
};

export const UNLOCK_CYCLES = {
  HARD_MODE: 10,        // Teste: 1 (original: 10)
  TURING_VISION: 15,    // Teste: 2 (original: 15)
  SPECTRUM_MODE: 20,    // Teste: 3 (original: 20)
  TURING_TEST: 25,      // Teste: 5 (original: 15)
};
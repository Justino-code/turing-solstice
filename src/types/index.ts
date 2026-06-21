// src/types/index.ts

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector2D extends Vector2 {
  w: number;
  h: number;
}

export interface Player extends Vector2D {
  vy: number;
  grounded: boolean;
  jumpForce: number;
  gravity: number;
  jumpCount: number;
  isInvincible: boolean;
  update(groundY: number, platforms: any[]): void;
  jump(): void;
  reset(x: number, y: number): void;
  getJumpType(): string;
  collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean;
  collidesWithCircle(circle: { x: number; y: number; radius: number }): boolean;
}

export type ObstacleType = 'spike' | 'block' | 'crystal' | 'pillar' | 'watcher' | 'void' | 'storm';

export interface Obstacle extends Vector2D {
  type: ObstacleType;
  active: boolean;
  update(speed: number): void;
  getVertices(): { x: number; y: number }[];
  getColor(): string;
  getGlowColor(): string;
}

export interface Platform extends Vector2D {
  life: number;
  maxLife: number;
  type: 'normal' | 'glowing' | 'fragile' | 'moving';
  pulsePhase: number;
  originalX: number;
  originalY: number;
  moveRange: number;
  moveSpeed: number;
  moveDirection: number;
  update(speed: number): void;
  isActive(): boolean;
  isOffScreen(width: number): boolean;
  isPlayerOn(rect: { x: number; y: number; w: number; h: number }): boolean;
  takeDamage(damage: number): boolean;
  getColor(isNight: boolean): string;
  getAlpha(): number;
}

export interface EnergyOrb {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulsePhase: number;
  update(speed: number): void;
  collect(): void;
  getAlpha(): number;
  getGlowSize(): number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  alpha: number;
}

export interface Challenge {
  question: string;
  options: string[];
  correctIndex: number;
  pattern: string;
  type: 'binary' | 'sequence' | 'logic' | 'crypto' | 'final' | 'turing' | 'enigma';
  difficulty: number;
  id?: string;
  timeLimit?: number;
  hint?: string;
  rule?: string;
}

export interface GameState {
  cycle: number;
  energy: number;
  score: number;
  speed: number;
  baseSpeed: number;
  isNight: boolean;
  nightProgress: number;
  gameOver: boolean;
  paused: boolean;
  challengeActive: boolean;
  challengeData: any;
  answered: boolean;
  lastAnswerCorrect: boolean | null;
  shakeX: number;
  shakeY: number;
  frame: number;
  prismMode: boolean;
  turingUnlocked: boolean;
  enigmaActive: boolean;
  enigmaData: any;
  enigmaAnswered: boolean;
  enigmaCorrect: boolean | null;
  enigmaTimeLeft: number;
  hardMode: boolean;
  hardModeUnlocked: boolean;
  turingVision: boolean;
  turingVisionUnlocked: boolean;
  spectrumMode: boolean;
  spectrumModeUnlocked: boolean;
}

export interface GameConfig {
  width: number;
  height: number;
  gravity: number;
  jumpForce: number;
  playerWidth: number;
  playerHeight: number;
  groundHeight: number;
  initialEnergy: number;
}

export type GameEvent = 
  | { type: 'CHALLENGE_START'; data: Challenge }
  | { type: 'CHALLENGE_ANSWER'; correct: boolean; index: number }
  | { type: 'ENERGY_CHANGED'; value: number }
  | { type: 'CYCLE_ADVANCED'; cycle: number }
  | { type: 'GAME_OVER'; reason: string }
  | { type: 'GAME_RESTART' }
  | { type: 'PRISM_UNLOCKED' }
  | { type: 'TURING_UNLOCKED' };

export type EventListener = (event: GameEvent) => void;
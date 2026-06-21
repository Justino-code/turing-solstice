// src/types/audio.ts
// Tipos para o sistema de áudio

export interface AudioEvents {
  jump: () => void;
  doubleJump: () => void;
  collectOrb: () => void;
  hit: () => void;
  gameOver: () => void;
  enigmaCorrect: () => void;
  enigmaWrong: () => void;
  pause: () => void;
  unpause: () => void;
  levelUp: () => void;
  gameStart: () => void;
}

export type AudioEventName = keyof AudioEvents;
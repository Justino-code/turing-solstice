// src/interfaces/IObstacle.ts
export interface IObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  active: boolean;
  rotation: number;
  
  update(speed: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean;
  isOffScreen(width: number): boolean;
  getBoundingBox(): { x: number; y: number; w: number; h: number };
  getColor(): string;
  getGlowColor(): string;
  getVertices(): { x: number; y: number }[];
  reset(x: number, y: number): void;
  takeDamage(damage: number): boolean;
}
// src/entities/Player.ts - Pulo mais alto e duplo funcionando

import { Player as PlayerType } from '../types';
import { PLAYER } from '../constants/game';

export class Player implements PlayerType {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  grounded: boolean;
  jumpForce: number;
  gravity: number;
  maxFallSpeed: number;
  isInvincible: boolean;
  invincibleTimer: number;
  jumpBuffer: boolean;
  jumpBufferTimer: number;
  doubleJumpUsed: boolean;
  canDoubleJump: boolean;
  jumpCount: number;
  maxJumps: number;
  coyoteTime: number;
  coyoteTimer: number;
  jumpPressed: boolean;

  constructor(x: number = PLAYER.X_POSITION, y: number = 300) {
    this.x = x;
    this.y = y;
    this.w = PLAYER.WIDTH;
    this.h = PLAYER.HEIGHT;
    this.vy = 0;
    this.grounded = false;
    this.jumpForce = -12.5; // Aumentado de -11 para -12.5
    this.gravity = 0.55; // Reduzido de 0.6 para 0.55
    this.maxFallSpeed = 14;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.jumpBuffer = false;
    this.jumpBufferTimer = 0;
    this.doubleJumpUsed = false;
    this.canDoubleJump = true;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.coyoteTime = 8; // Aumentado de 6 para 8
    this.coyoteTimer = 0;
    this.jumpPressed = false;
  }

  public update(groundY: number, platforms: Array<{ x: number; y: number; w: number; h: number }>): void {
    // Aplica gravidade
    this.vy += this.gravity;
    if (this.vy > this.maxFallSpeed) {
      this.vy = this.maxFallSpeed;
    }
    this.y += this.vy;

    // Coyote time (permite pular por alguns frames após sair da plataforma)
    if (this.grounded) {
      this.coyoteTimer = this.coyoteTime;
    } else {
      this.coyoteTimer--;
    }

    // Buffer de pulo
    if (this.jumpBuffer) {
      this.jumpBufferTimer--;
      if (this.jumpBufferTimer <= 0) {
        this.jumpBuffer = false;
      }
    }

    // Verifica colisão com o chão
    this.grounded = false;
    if (this.y + this.h >= groundY) {
      this.y = groundY - this.h;
      this.vy = 0;
      this.grounded = true;
      this.jumpCount = 0;
      this.doubleJumpUsed = false;
      
      if (this.jumpBuffer) {
        this.jump();
        this.jumpBuffer = false;
      }
    }

    // Verifica colisão com plataformas
    for (const platform of platforms) {
      if (this.isCollidingWithPlatform(platform)) {
        if (this.vy >= 0 && this.y + this.h - this.vy <= platform.y + 5) {
          this.y = platform.y - this.h;
          this.vy = 0;
          this.grounded = true;
          this.jumpCount = 0;
          this.doubleJumpUsed = false;
          
          if (this.jumpBuffer) {
            this.jump();
            this.jumpBuffer = false;
          }
        }
      }
    }

    // Atualiza invencibilidade
    if (this.isInvincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }

    this.jumpPressed = false;
  }

  private isCollidingWithPlatform(platform: { x: number; y: number; w: number; h: number }): boolean {
    const margin = 2;
    return this.x + this.w > platform.x + margin &&
           this.x < platform.x + platform.w - margin &&
           this.y + this.h > platform.y + margin &&
           this.y + this.h < platform.y + platform.h + 12;
  }

  public jump(): void {
    if (this.jumpCount < this.maxJumps) {
      // Primeiro pulo
      if (this.jumpCount === 0) {
        // Verifica se está no chão ou coyote time
        if (this.grounded || this.coyoteTimer > 0) {
          this.vy = this.jumpForce;
          this.grounded = false;
          this.jumpCount = 1;
          this.coyoteTimer = 0;
          this.jumpPressed = true;
        }
      } 
      // Pulo duplo
      else if (this.jumpCount === 1 && !this.grounded) {
        this.vy = this.jumpForce * 0.85; // 85% da força do pulo normal
        this.jumpCount = 2;
        this.jumpPressed = true;
        this.doubleJumpUsed = true;
      }
    }
  }

  public canJump(): boolean {
    return this.jumpCount < this.maxJumps || this.coyoteTimer > 0;
  }

  public getJumpType(): 'normal' | 'double' | 'none' {
    if (this.jumpCount === 0 && (this.grounded || this.coyoteTimer > 0)) return 'normal';
    if (this.jumpCount === 1 && this.doubleJumpUsed) return 'double';
    if (this.jumpCount === 1 && this.jumpPressed) return 'double';
    return 'none';
  }

  public takeDamage(damage: number): void {
    if (this.isInvincible) return;
    this.isInvincible = true;
    this.invincibleTimer = 60;
  }

  public reset(x: number = PLAYER.X_POSITION, y: number = 300): void {
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.grounded = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.jumpBuffer = false;
    this.jumpBufferTimer = 0;
    this.doubleJumpUsed = false;
    this.canDoubleJump = true;
    this.jumpCount = 0;
    this.coyoteTimer = 0;
    this.jumpPressed = false;
  }

  public isGrounded(): boolean {
    return this.grounded;
  }

  public getCenter(): { x: number; y: number } {
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2
    };
  }

  public collidesWith(rect: { x: number; y: number; w: number; h: number }): boolean {
    // Margem de colisão mais generosa para evitar frustração
    const margin = 2;
    return this.x + margin < rect.x + rect.w &&
           this.x + this.w - margin > rect.x &&
           this.y + margin < rect.y + rect.h &&
           this.y + this.h - margin > rect.y;
  }

  public collidesWithCircle(circle: { x: number; y: number; radius: number }): boolean {
    const center = this.getCenter();
    const dx = center.x - circle.x;
    const dy = center.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle.radius + Math.min(this.w, this.h) / 2;
  }

  public move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
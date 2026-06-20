// src/systems/BackgroundRenderer.ts
// Responsável por renderizar fundo, céu, montanhas, árvores, estrelas, sol/lua, chão,
// nuvens, prédios, terreno e detalhes do chão

import { GameState } from '../types';

export class BackgroundRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  // ===== FUNDO PRINCIPAL =====

  // Movido de: RenderSystem.renderBackground()
  public renderBackground(state: GameState, scrollX: number): void {
    const { nightProgress } = state;
    const ctx = this.ctx;

    // Transição suave entre dia e noite
    const smoothProgress = Math.sin(nightProgress * Math.PI);
    const dayFactor = 1 - smoothProgress;
    const nightFactor = smoothProgress;

    // Cores de dia
    const dayTop = [42, 58, 90];
    const dayBottom = [74, 106, 138];

    // Cores de noite
    const nightTop = [11, 14, 26];
    const nightBottom = [21, 29, 43];

    // Interpolação linear suave
    const r1 = Math.round(dayTop[0] * dayFactor + nightTop[0] * nightFactor);
    const g1 = Math.round(dayTop[1] * dayFactor + nightTop[1] * nightFactor);
    const b1 = Math.round(dayTop[2] * dayFactor + nightTop[2] * nightFactor);

    const r2 = Math.round(dayBottom[0] * dayFactor + nightBottom[0] * nightFactor);
    const g2 = Math.round(dayBottom[1] * dayFactor + nightBottom[1] * nightFactor);
    const b2 = Math.round(dayBottom[2] * dayFactor + nightBottom[2] * nightFactor);

    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
    grad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Montanhas com transição
    this.renderMountains(scrollX * 0.1, nightFactor);

    // Árvores
    this.renderTrees(scrollX * 0.3, nightFactor);

    // Estrelas (aparecem gradualmente na noite)
    if (nightFactor > 0.2) {
      const starAlpha = (nightFactor - 0.2) / 0.8;
      this.renderStars(starAlpha);
    }

    // Sol/Lua com transição suave
    this.renderCelestialBody(nightProgress);
  }

  // Movido de: RenderSystem.renderMountains()
  private renderMountains(offset: number, nightFactor: number): void {
    const ctx = this.ctx;
    const alpha = 0.15 + nightFactor * 0.15;
    const color = `rgba(60,80,120,${alpha})`;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, this.height - 30);

    // Montanha 1
    const baseX1 = 100 - offset % 400;
    ctx.quadraticCurveTo(baseX1 + 50, this.height - 180 - nightFactor * 30, baseX1 + 100, this.height - 30);
    ctx.quadraticCurveTo(baseX1 + 150, this.height - 220 - nightFactor * 30, baseX1 + 200, this.height - 30);

    // Montanha 2
    const baseX2 = 300 - offset % 500;
    ctx.quadraticCurveTo(baseX2 + 60, this.height - 160 - nightFactor * 25, baseX2 + 120, this.height - 30);
    ctx.quadraticCurveTo(baseX2 + 180, this.height - 200 - nightFactor * 25, baseX2 + 240, this.height - 30);

    // Montanha 3
    const baseX3 = 600 - offset % 600;
    ctx.quadraticCurveTo(baseX3 + 70, this.height - 210 - nightFactor * 35, baseX3 + 140, this.height - 30);
    ctx.quadraticCurveTo(baseX3 + 210, this.height - 240 - nightFactor * 35, baseX3 + 280, this.height - 30);

    ctx.fill();
  }

  // Movido de: RenderSystem.renderTrees()
  private renderTrees(offset: number, nightFactor: number): void {
    const ctx = this.ctx;
    const alpha = 0.15 + nightFactor * 0.15;
    const color = `rgba(80,120,80,${alpha})`;

    ctx.fillStyle = color;
    const treePositions = [50, 200, 350, 500, 650, 780];

    for (let i = 0; i < treePositions.length; i++) {
      const x = (treePositions[i] - offset % 800 + 800) % 800;
      const height = 20 + (i % 3) * 10;
      const width = 15 + (i % 2) * 5;

      // Tronco
      ctx.fillRect(x - 2, this.height - 30 - height, 4, height);

      // Copa
      ctx.beginPath();
      ctx.arc(x, this.height - 30 - height - 10, width, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Movido de: RenderSystem.renderStars()
  private renderStars(alpha: number): void {
    const ctx = this.ctx;
    const time = Date.now() / 2000;

    for (let i = 0; i < 50; i++) {
      const sx = (i * 137 + 50) % this.width;
      const sy = (i * 251 + 30) % (this.height - 30);
      const size = 0.5 + (i % 3);
      const starAlpha = (0.3 + Math.sin(time + i) * 0.3) * alpha;

      ctx.globalAlpha = starAlpha;
      ctx.fillStyle = 'rgba(255,255,240,1)';
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      // Brilho das estrelas
      if (size > 1.5) {
        ctx.fillStyle = `rgba(255,255,255,${0.1 * alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Movido de: RenderSystem.renderCelestialBody()
  private renderCelestialBody(nightProgress: number): void {
    const ctx = this.ctx;
    const cx = 700;
    const cy = 80;
    const radius = 45;

    // Suaviza a transição (curva mais lenta)
    const smoothProgress = Math.sin(nightProgress * Math.PI);
    const isDay = nightProgress < 0.5;
    const dayFactor = 1 - smoothProgress;
    const nightFactor = smoothProgress;

    // Brilho externo (transição suave)
    const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 2.5);

    // Cor do brilho - dia: amarelo, noite: azul
    const r = Math.round(255 * dayFactor + 180 * nightFactor);
    const g = Math.round(230 * dayFactor + 200 * nightFactor);
    const b = Math.round(150 * dayFactor + 240 * nightFactor);

    const glowAlpha = 0.3 * (1 - Math.abs(nightProgress - 0.5) * 2);
    glowGrad.addColorStop(0, `rgba(${r},${g},${b},${glowAlpha})`);
    glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Corpo celeste
    const bodyGrad = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, radius);

    if (dayFactor > 0.5) {
      // SOL (dia)
      bodyGrad.addColorStop(0, '#fff8e0');
      bodyGrad.addColorStop(0.6, '#ffdd44');
      bodyGrad.addColorStop(1, '#f0a030');
    } else {
      // LUA (noite)
      bodyGrad.addColorStop(0, '#f0f4ff');
      bodyGrad.addColorStop(0.6, '#d0d8e8');
      bodyGrad.addColorStop(1, '#a0a8b8');
    }

    ctx.shadowColor = isDay ? 'rgba(255,200,50,0.3)' : 'rgba(150,180,255,0.3)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Características específicas
    if (dayFactor > 0.5) {
      // RAIOS SOLARES (giram lentamente)
      const time = Date.now() / 8000;
      const rayAlpha = 0.3 * dayFactor;

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + time;
        const r1 = radius * 1.1;
        const r2 = radius * 1.4 + Math.sin(time * 2 + i) * 4;

        ctx.strokeStyle = `rgba(255,200,50,${rayAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx.stroke();
      }

      // Brilho central do sol
      ctx.fillStyle = `rgba(255,255,200,${0.1 * dayFactor})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // CRATERAS DA LUA
      ctx.fillStyle = `rgba(180,190,210,${0.2 * nightFactor})`;

      // Cratera 1
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Cratera 2
      ctx.beginPath();
      ctx.arc(cx + 14, cy + 12, 4, 0, Math.PI * 2);
      ctx.fill();

      // Cratera 3
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 16, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cratera 4
      ctx.beginPath();
      ctx.arc(cx - 8, cy + 16, 5, 0, Math.PI * 2);
      ctx.fill();

      // Cratera 5 (pequena)
      ctx.beginPath();
      ctx.arc(cx + 18, cy - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Brilho da lua
      ctx.fillStyle = `rgba(255,255,255,${0.05 * nightFactor})`;
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Halo da lua
      ctx.fillStyle = `rgba(200,210,255,${0.03 * nightFactor})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Movido de: RenderSystem.renderGround()
  public renderGround(isNight: boolean, scrollX: number): void {
    const ctx = this.ctx;
    const groundY = this.height - 30;

    // Chão principal
    ctx.fillStyle = isNight ? '#1a2a4a' : '#3a5a8a';
    ctx.fillRect(0, groundY, this.width, 30);

    // Linha superior com efeito de movimento
    ctx.fillStyle = isNight ? '#2a3a5a' : '#4a6a9a';
    ctx.fillRect(0, groundY - 2, this.width, 4);

    // Linhas de velocidade (efeito de corrida)
    ctx.strokeStyle = isNight ? 'rgba(100,150,255,0.1)' : 'rgba(200,220,255,0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const x = (i * 80 + (scrollX * 2) % 80) % this.width;
      const y = groundY + 5 + (i % 3) * 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20 + (i % 5) * 5, y);
      ctx.stroke();
    }

    // Marcas de velocidade no chão
    ctx.fillStyle = isNight ? 'rgba(100,150,255,0.05)' : 'rgba(200,220,255,0.05)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 40 + (scrollX * 3) % 40) % this.width;
      ctx.fillRect(x, groundY + 3, 2, 4);
    }
  }

  // ===== ELEMENTOS DA CENA (DO Game.ts) =====

  // Movido de: Game.renderBackgroundElements()
  public renderBackgroundElements(
    backgroundElements: any[],
    isNight: boolean,
    groundY: number
  ): void {
    const ctx = this.ctx;
    for (const element of backgroundElements) {
      const alpha = isNight ? 0.15 : 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = element.color;

      if (element.type === 'mountain') {
        ctx.beginPath();
        ctx.moveTo(element.x, groundY);
        ctx.lineTo(element.x + element.w/2, groundY - element.h);
        ctx.lineTo(element.x + element.w, groundY);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(element.x + element.w/2 - 3, groundY - 20, 6, 20);
        ctx.beginPath();
        ctx.arc(element.x + element.w/2, groundY - 25, element.w/2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }
  }

  // Movido de: Game.renderClouds()
  public renderClouds(clouds: any[], isNight: boolean): void {
    const ctx = this.ctx;
    for (const cloud of clouds) {
      const alpha = cloud.opacity * (isNight ? 0.2 : 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = cloud.color || (isNight ? 'rgba(150,180,220,0.3)' : 'rgba(255,255,255,0.7)');

      const cx = cloud.x + cloud.w / 2;
      const cy = cloud.y;
      const r = cloud.w / 3.5;

      ctx.beginPath();
      ctx.arc(cx - r * 0.8, cy + r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.8, cy + r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  // Movido de: Game.renderBuildings()
  public renderBuildings(buildings: any[], isNight: boolean, groundY: number): void {
    const ctx = this.ctx;
    for (const building of buildings) {
      const alpha = isNight ? 0.15 : 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = building.color;
      ctx.fillRect(building.x, groundY - building.h, building.w, building.h);

      const windowColor = isNight ? 'rgba(255,220,100,0.3)' : 'rgba(200,230,255,0.2)';
      ctx.fillStyle = windowColor;
      const cols = Math.floor((building.w - 6) / 10);
      const rows = Math.floor((building.h - 6) / 15);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(
              building.x + 3 + c * 10,
              groundY - building.h + 3 + r * 15,
              5, 8
            );
          }
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  // Movido de: Game.renderTerrain()
  public renderTerrain(terrainSegments: any[], groundY: number): void {
    const ctx = this.ctx;

    for (const segment of terrainSegments) {
      const yOffset = segment.heightOffset || 0;
      const y = groundY + yOffset;

      ctx.fillStyle = segment.color;
      ctx.fillRect(segment.x, y - 2, segment.width, 32);

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(segment.x, y - 2, segment.width, 2);

      this.renderTerrainTexture(segment, y);
    }
  }

  // Movido de: Game.renderTerrainTexture()
  private renderTerrainTexture(segment: any, y: number): void {
    const ctx = this.ctx;

    switch(segment.type) {
      case 'desert':
        ctx.fillStyle = 'rgba(200,180,100,0.3)';
        for (let i = 0; i < 20; i++) {
          const x = segment.x + (i * 37 + 13) % segment.width;
          const yOff = (i * 23 + 7) % 15;
          ctx.fillRect(x, y + 5 + yOff, 2, 2);
        }
        break;

      case 'dirt':
        ctx.fillStyle = 'rgba(100,70,50,0.3)';
        for (let i = 0; i < 15; i++) {
          const x = segment.x + (i * 53 + 11) % segment.width;
          const yOff = (i * 31 + 5) % 12;
          ctx.fillRect(x, y + 3 + yOff, 3, 2);
        }
        break;

      case 'asphalt':
        ctx.fillStyle = 'rgba(100,100,100,0.2)';
        for (let i = 0; i < 10; i++) {
          const x = segment.x + (i * 67 + 19) % segment.width;
          ctx.fillRect(x, y + 8, 20, 2);
          ctx.fillRect(x + 30, y + 16, 20, 2);
        }
        break;

      case 'grass':
        ctx.fillStyle = 'rgba(50,150,70,0.3)';
        for (let i = 0; i < 25; i++) {
          const x = segment.x + (i * 29 + 7) % segment.width;
          const height = 3 + (i % 5);
          ctx.fillRect(x, y - height, 1, height);
        }
        break;

      default:
        break;
    }
  }

  // Movido de: Game.renderGroundDetails()
  public renderGroundDetails(groundDetails: any[], isNight: boolean, groundY: number): void {
    const ctx = this.ctx;
    for (const detail of groundDetails) {
      const alpha = isNight ? 0.2 : 1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = detail.color;

      if (detail.type === 'grass') {
        ctx.beginPath();
        ctx.moveTo(detail.x, groundY);
        ctx.lineTo(detail.x + detail.size/2, groundY - detail.size);
        ctx.lineTo(detail.x + detail.size, groundY);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(detail.x, groundY - detail.size/2, detail.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,200,0.4)';
        ctx.beginPath();
        ctx.arc(detail.x, groundY - detail.size/2, detail.size/4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
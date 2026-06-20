// src/core/SceneManager.ts

import { randomInt, randomFloat } from '../utils/helpers';

export class SceneManager {
  private config: { width: number; height: number; groundHeight: number };
  private groundY: number;
  
  public clouds: any[];
  public buildings: any[];
  public groundDetails: any[];
  public backgroundElements: any[];
  public terrainSegments: any[];
  public currentScene: number;
  public sceneChangeTimer: number;

  constructor(config: { width: number; height: number; groundHeight: number }) {
    this.config = config;
    this.groundY = config.height - config.groundHeight;
    this.clouds = [];
    this.buildings = [];
    this.groundDetails = [];
    this.backgroundElements = [];
    this.terrainSegments = [];
    this.currentScene = 0;
    this.sceneChangeTimer = 0;
  }

  // Movido de: private initScene(): void
  public initScene(): void {
    const sceneColors = this.getSceneColors(this.currentScene);

    this.clouds = [];
    for (let i = 0; i < 10; i++) {
      this.clouds.push({
        x: randomInt(0, this.config.width),
        y: randomInt(20, 150),
        w: randomInt(80, 200),
        speed: randomFloat(0.1, 0.4),
        opacity: randomFloat(0.3, 0.8),
        color: sceneColors.cloud
      });
    }

    this.buildings = [];
    for (let i = 0; i < 8; i++) {
      this.buildings.push({
        x: randomInt(0, this.config.width * 1.5),
        w: randomInt(30, 70),
        h: randomInt(60, 180),
        color: sceneColors.building,
        windows: randomInt(2, 5)
      });
    }

    this.groundDetails = [];
    for (let i = 0; i < 40; i++) {
      this.groundDetails.push({
        x: randomInt(0, this.config.width * 2),
        type: randomInt(0, 2) === 0 ? 'grass' : 'flower',
        size: randomInt(3, 10),
        color: sceneColors.groundDetail
      });
    }

    this.backgroundElements = [];
    for (let i = 0; i < 5; i++) {
      this.backgroundElements.push({
        x: randomInt(0, this.config.width),
        y: this.groundY - randomInt(40, 120),
        w: randomInt(60, 150),
        h: randomInt(40, 100),
        type: randomInt(0, 2) === 0 ? 'mountain' : 'tree',
        color: sceneColors.background
      });
    }
  }

  // Movido de: private initTerrain(): void
  public initTerrain(): void {
    this.terrainSegments = [];
    const terrainTypes = ['flat', 'desert', 'dirt', 'asphalt', 'grass'];
    let x = 0;

    for (let i = 0; i < 12; i++) {
      const type = terrainTypes[randomInt(0, terrainTypes.length - 1)];
      const width = randomInt(250, 500);
      const heightOffset = randomInt(-15, 15);

      this.terrainSegments.push({
        x: x,
        width: width,
        type: type,
        heightOffset: heightOffset,
        color: this.getTerrainColor(type)
      });
      x += width;
    }
  }

  // Movido de: private getTerrainColor(type: string): string
  public getTerrainColor(type: string): string {
    const colors: {[key: string]: string} = {
      'flat': '#2d4055',
      'desert': '#c4a35a',
      'dirt': '#6b4c3b',
      'asphalt': '#3a3a3a',
      'grass': '#4a8a5a'
    };
    return colors[type] || '#2d4055';
  }

  // Movido de: private getSceneColors(scene: number): any
  public getSceneColors(scene: number): any {
    const scenes = [
      {
        cloud: 'rgba(255,255,255,0.7)',
        building: 'hsl(220, 20%, 45%)',
        groundDetail: 'hsl(120, 60%, 40%)',
        background: 'hsl(200, 30%, 35%)',
        name: '🏙️ Cidade'
      },
      {
        cloud: 'rgba(200,230,255,0.6)',
        building: 'hsl(140, 30%, 30%)',
        groundDetail: 'hsl(130, 70%, 35%)',
        background: 'hsl(140, 40%, 25%)',
        name: '🌳 Floresta'
      },
      {
        cloud: 'rgba(255,220,180,0.5)',
        building: 'hsl(40, 30%, 45%)',
        groundDetail: 'hsl(50, 60%, 50%)',
        background: 'hsl(30, 40%, 40%)',
        name: '🏜️ Deserto'
      },
      {
        cloud: 'rgba(255,255,255,0.9)',
        building: 'hsl(200, 20%, 70%)',
        groundDetail: 'hsl(200, 30%, 80%)',
        background: 'hsl(210, 40%, 75%)',
        name: '❄️ Neve'
      },
      {
        cloud: 'rgba(100,50,50,0.6)',
        building: 'hsl(20, 40%, 25%)',
        groundDetail: 'hsl(30, 60%, 30%)',
        background: 'hsl(10, 40%, 20%)',
        name: '🌋 Vulcão'
      }
    ];

    return scenes[scene % scenes.length];
  }

  // Movido de: private changeScene(): void
  public changeScene(): string {
    this.currentScene++;
    this.sceneChangeTimer = 0;

    const sceneColors = this.getSceneColors(this.currentScene);
    this.initScene();

    return sceneColors.name;
  }
}
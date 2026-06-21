// src/systems/AudioSystem.ts
// Sistema de áudio para o jogo - sons usando Web Audio API

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;
  private isInitialized: boolean = false;

  constructor() {
    // Não cria o AudioContext automaticamente
    // Será criado na primeira interação do usuário
  }

  private initAudioContext(): void {
    if (this.isInitialized) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
      console.log('🎵 AudioSystem initialized');
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private connectToMaster(source: AudioNode): void {
    if (this.masterGain) {
      source.connect(this.masterGain);
    }
  }

  public resume(): void {
    this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
      console.log('🎵 AudioContext resumed');
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public isAudioEnabled(): boolean {
    return this.enabled && this.isInitialized;
  }

  // ===== SONS =====

  private playSound(createSound: () => void): void {
    this.initAudioContext();
    this.resume();
    if (!this.enabled || !this.ctx || this.isMuted) return;
    createSound();
  }

  // Pulo
  public playJump(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    });
  }

  // Pulo duplo
  public playDoubleJump(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    });
  }

  // Coletar orb
  public playCollectOrb(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const notes = [523, 659, 784];
      const startTime = this.ctx.currentTime;

      for (let i = 0; i < notes.length; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[i], startTime + i * 0.08);
        
        gain.gain.setValueAtTime(0, startTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, startTime + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.08 + 0.12);
        
        osc.connect(gain);
        this.connectToMaster(gain);
        
        osc.start(startTime + i * 0.08);
        osc.stop(startTime + i * 0.08 + 0.12);
      }
    });
  }

  // Colisão
  public playHit(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noise = this.ctx.createBufferSource();
      
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 3);
      }
      
      noise.buffer = buffer;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      noise.connect(noiseGain);
      this.connectToMaster(noiseGain);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.15);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    });
  }

  // Game Over
  public playGameOver(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const notes = [523, 392, 330, 262];
      const startTime = this.ctx.currentTime;

      for (let i = 0; i < notes.length; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(notes[i], startTime + i * 0.2);
        
        gain.gain.setValueAtTime(0, startTime + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.08, startTime + i * 0.2 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.2 + 0.3);
        
        osc.connect(gain);
        this.connectToMaster(gain);
        
        osc.start(startTime + i * 0.2);
        osc.stop(startTime + i * 0.2 + 0.3);
      }
    });
  }

  // Enigma correto
  public playEnigmaCorrect(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const notes = [523, 659, 784, 1047];
      const startTime = this.ctx.currentTime;

      for (let i = 0; i < notes.length; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[i], startTime + i * 0.1);
        
        gain.gain.setValueAtTime(0, startTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.12, startTime + i * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.1 + 0.15);
        
        osc.connect(gain);
        this.connectToMaster(gain);
        
        osc.start(startTime + i * 0.1);
        osc.stop(startTime + i * 0.1 + 0.15);
      }
    });
  }

  // Enigma errado
  public playEnigmaWrong(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    });
  }

  // Pausa
  public playPause(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    });
  }

  // Despausa
  public playUnpause(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    });
  }

  // Nível up
  public playLevelUp(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const notes = [523, 587, 659, 784];
      const startTime = this.ctx.currentTime;

      for (let i = 0; i < notes.length; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[i], startTime + i * 0.1);
        
        gain.gain.setValueAtTime(0, startTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, startTime + i * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.1 + 0.15);
        
        osc.connect(gain);
        this.connectToMaster(gain);
        
        osc.start(startTime + i * 0.1);
        osc.stop(startTime + i * 0.1 + 0.15);
      }
    });
  }

  // Som de início de jogo
  public playGameStart(): void {
    this.playSound(() => {
      if (!this.ctx) return;
      const notes = [262, 330, 392, 523];
      const startTime = this.ctx.currentTime;

      for (let i = 0; i < notes.length; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[i], startTime + i * 0.12);
        
        gain.gain.setValueAtTime(0, startTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.1, startTime + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.12 + 0.2);
        
        osc.connect(gain);
        this.connectToMaster(gain);
        
        osc.start(startTime + i * 0.12);
        osc.stop(startTime + i * 0.12 + 0.2);
      }
    });
  }

  // ===== MÚSICA DE FUNDO =====
  private bgInterval: number | null = null;

  public startBackgroundMusic(): void {
    this.initAudioContext();
    this.resume();
    if (!this.enabled || !this.ctx || this.isMuted) return;

    if (this.bgInterval) return;

    let noteIndex = 0;
    const notes = [130, 155, 196, 130, 155, 196, 130, 196];
    const durations = [0.3, 0.3, 0.6, 0.3, 0.3, 0.6, 0.3, 0.8];

    const playNote = () => {
      if (!this.enabled || !this.ctx || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex % notes.length], this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + durations[noteIndex % durations.length]);
      
      osc.connect(gain);
      this.connectToMaster(gain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + durations[noteIndex % durations.length]);

      noteIndex++;
    };

    playNote();

    let time = 0;
    for (let i = 1; i < 50; i++) {
      time += durations[(i - 1) % durations.length];
      setTimeout(() => {
        if (this.bgInterval !== null && !this.isMuted) {
          playNote();
        }
      }, time * 1000);
    }

    this.bgInterval = setInterval(() => {
      if (this.bgInterval !== null && !this.isMuted) {
        playNote();
      }
    }, 5000) as unknown as number;
  }

  public stopBackgroundMusic(): void {
    if (this.bgInterval !== null) {
      clearInterval(this.bgInterval);
      this.bgInterval = null;
    }
  }

  public toggleBackgroundMusic(enabled: boolean): void {
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  // ===== DESTRUIR =====
  public destroy(): void {
    this.stopBackgroundMusic();
    if (this.ctx) {
      this.ctx.close();
    }
  }
}
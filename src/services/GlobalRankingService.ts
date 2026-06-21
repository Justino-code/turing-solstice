// src/services/GlobalRankingService.ts
// Serviço de ranking global (JSONBin.io)

import { JSONBin } from '@/constants/env';
import { RankingService } from './RankingService';

export interface GlobalScoreEntry {
  score: number;
  cycle: number;
  date: string;
  mode: string;
  player: string;
  fingerprint: string;
}

interface CacheEntry {
  data: GlobalScoreEntry[];
  timestamp: number;
}

export class GlobalRankingService {
  private static API_KEY = JSONBin.API_KEY;
  private static BIN_ID = JSONBin.BIN_ID;
  private static BASE_URL = JSONBin.BASE_URL;
  private static MAX_ENTRIES = JSONBin.MAX_ENTRIES;
  
  private static CACHE_KEY = 'turing-global-scores-cache';
  private static CACHE_DURATION = 5 * 60 * 1000;

  /**
   * Obtém os scores globais (com cache)
   */
  public static async getGlobalScores(): Promise<GlobalScoreEntry[]> {
    if (!this.isConfigured()) {
      console.warn('🌍 Ranking global não configurado');
      return [];
    }

    const cached = this.getCache();
    if (cached) {
      console.log('📦 Ranking global carregado do cache');
      return cached;
    }

    try {
      console.log('🌍 Buscando ranking global da API...');
      const response = await fetch(`${this.BASE_URL}/${this.BIN_ID}/latest`, {
        headers: { 'X-Master-Key': this.API_KEY }
      });
      
      if (!response.ok) {
        console.warn('🌍 Ranking global indisponível');
        return this.getCache() || [];
      }
      
      const data = await response.json();
      const scores = Array.isArray(data.record) ? data.record : [];
      this.setCache(scores);
      return scores;
    } catch (error) {
      console.warn('🌍 Erro ao carregar ranking global:', error);
      return this.getCache() || [];
    }
  }

  /**
   * Envia um score para o ranking global
   * - Mesmo fingerprint: atualiza apenas se score for maior
   * - Fingerprint novo: adiciona
   */
  public static async submitScore(score: number, cycle: number, mode: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('🌍 Ranking global não configurado');
      return false;
    }

    try {
      const currentScores = await this.getGlobalScores();
      const fingerprint = RankingService.getFingerprint();
      const playerName = RankingService.getPlayerName();
      
      // Verifica se o jogador já existe pelo fingerprint
      const existingIndex = currentScores.findIndex(s => s.fingerprint === fingerprint);
      
      if (existingIndex >= 0) {
        // Já existe: só atualiza se o novo score for maior
        if (score > currentScores[existingIndex].score) {
          currentScores[existingIndex] = {
            score: Math.floor(score),
            cycle,
            date: new Date().toLocaleDateString(),
            mode,
            player: playerName,
            fingerprint
          };
          console.log('🌍 Score atualizado no ranking global!');
        } else {
          console.log('🌍 Score não é maior que o recorde atual');
          return false;
        }
      } else {
        // Novo jogador
        currentScores.push({
          score: Math.floor(score),
          cycle,
          date: new Date().toLocaleDateString(),
          mode,
          player: playerName,
          fingerprint
        });
        console.log('🌍 Novo jogador adicionado ao ranking global!');
      }
      
      currentScores.sort((a, b) => b.score - a.score);
      const topScores = currentScores.slice(0, this.MAX_ENTRIES);
      
      const response = await fetch(`${this.BASE_URL}/${this.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.API_KEY
        },
        body: JSON.stringify(topScores)
      });
      
      if (!response.ok) {
        console.warn('🌍 Erro ao enviar score global');
        return false;
      }
      
      this.setCache(topScores);
      console.log('🌍 Ranking global sincronizado!');
      return true;
    } catch (error) {
      console.warn('🌍 Erro ao enviar score global:', error);
      return false;
    }
  }

  /**
   * Verifica se o score merece entrar no ranking global
   */
  public static async qualifiesForGlobal(score: number): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const scores = await this.getGlobalScores();
    if (scores.length < this.MAX_ENTRIES) return true;
    return score > scores[scores.length - 1].score;
  }

  /**
   * Verifica se o serviço está configurado
   */
  public static isConfigured(): boolean {
    return this.API_KEY.length > 0 && this.BIN_ID.length > 0 && this.BASE_URL.length > 0;
  }

  // ===== CACHE LOCAL =====

  private static getCache(): GlobalScoreEntry[] | null {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const cache: CacheEntry = JSON.parse(raw);
      if (Date.now() - cache.timestamp > this.CACHE_DURATION) {
        console.log('⏰ Cache do ranking global expirado');
        return null;
      }
      return cache.data;
    } catch {
      return null;
    }
  }

  private static setCache(data: GlobalScoreEntry[]): void {
    try {
      const cache: CacheEntry = { data, timestamp: Date.now() };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Cache do ranking global atualizado');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache do ranking global');
    }
  }

  public static clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🧹 Cache do ranking global removido');
  }

  public static async refreshCache(): Promise<GlobalScoreEntry[]> {
    this.clearCache();
    return this.getGlobalScores();
  }
}
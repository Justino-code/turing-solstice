// src/services/RankingService.ts
// Serviço de ranking pessoal (localStorage)

export interface ScoreEntry {
  score: number;
  cycle: number;
  date: string;
  mode: string;
  player: string;
  fingerprint: string;
}

export class RankingService {
  private static STORAGE_KEY = 'turing-solstice-scores';
  private static MAX_ENTRIES = 10;

  /**
   * Adiciona um novo score ao ranking pessoal
   */
  public static addScore(score: number, cycle: number, mode: string = 'normal'): ScoreEntry[] {
    const scores = this.getScores();
    
    scores.push({
      score: Math.floor(score),
      cycle,
      date: new Date().toLocaleDateString(),
      mode,
      player: this.getPlayerName(),
      fingerprint: this.getFingerprint()
    });
    
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, this.MAX_ENTRIES);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
    return topScores;
  }

  /**
   * Obtém todos os scores do jogador
   */
  public static getScores(): ScoreEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Obtém os top N scores
   */
  public static getTopScores(count: number = 5): ScoreEntry[] {
    return this.getScores().slice(0, count);
  }

  /**
   * Obtém o melhor score
   */
  public static getBestScore(): ScoreEntry | null {
    const scores = this.getScores();
    return scores.length > 0 ? scores[0] : null;
  }

  /**
   * Verifica se é um novo recorde pessoal
   */
  public static isNewRecord(score: number): boolean {
    const scores = this.getScores();
    if (scores.length === 0) return true;
    return score > scores[0].score;
  }

  /**
   * Obtém a posição no ranking pessoal
   */
  public static getRank(score: number): number {
    const scores = this.getScores();
    return scores.filter(s => s.score > score).length + 1;
  }

  /**
   * Limpa o ranking pessoal
   */
  public static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ===== IDENTIFICAÇÃO DO JOGADOR =====

  /**
   * Gera um fingerprint único baseado no dispositivo
   */
  public static getFingerprint(): string {
    const data = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      navigator.platform || 'unknown'
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'SOL-' + Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
  }

  /**
   * Obtém o nome do jogador
   */
  public static getPlayerName(): string {
    return localStorage.getItem('turing-player-name') || 'Anônimo';
  }

  /**
   * Define o nome do jogador
   */
  public static setPlayerName(name: string): void {
    if (name && name.trim()) {
      localStorage.setItem('turing-player-name', name.trim());
    }
  }
}
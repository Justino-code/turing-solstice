// src/data/interactions.ts
// Interações locais de fallback

import { Interaction } from '../services/GeminiInteractionService';

export const LOCAL_INTERACTIONS: Interaction[] = [
  // ===== WELCOME (2 PT + 2 EN) =====
  {
    id: 'local_welcome_1',
    type: 'welcome',
    message: 'Eu sou SOL-ENIGMA. O Solstício aguarda sua decisão.',
    context: 'welcome_pt',
    emotion: 'mysterious'
  },
  {
    id: 'local_welcome_2',
    type: 'welcome',
    message: 'Bem-vindo, portador da luz. O equilíbrio está em suas mãos.',
    context: 'welcome_pt',
    emotion: 'neutral'
  },
  {
    id: 'local_welcome_1_en',
    type: 'welcome',
    message: 'I am SOL-ENIGMA. The Solstice awaits your decision.',
    context: 'welcome_en',
    emotion: 'mysterious'
  },
  {
    id: 'local_welcome_2_en',
    type: 'welcome',
    message: 'Welcome, light bearer. The balance is in your hands.',
    context: 'welcome_en',
    emotion: 'neutral'
  },
  
  // ===== POSITIVE (4 PT + 4 EN) =====
  {
    id: 'local_positive_1',
    type: 'positive',
    message: 'Excelente! A luz prevalece neste ciclo.',
    context: 'positive_pt',
    emotion: 'happy'
  },
  {
    id: 'local_positive_2',
    type: 'positive',
    message: 'Você decifrou o código. O Solstício se estabiliza.',
    context: 'positive_pt',
    emotion: 'excited'
  },
  {
    id: 'local_positive_3',
    type: 'positive',
    message: 'A harmonia se restaura. Continue assim.',
    context: 'positive_pt',
    emotion: 'happy'
  },
  {
    id: 'local_positive_4',
    type: 'positive',
    message: 'O padrão foi revelado. A luz vence.',
    context: 'positive_pt',
    emotion: 'excited'
  },
  {
    id: 'local_positive_1_en',
    type: 'positive',
    message: 'Excellent! The light prevails in this cycle.',
    context: 'positive_en',
    emotion: 'happy'
  },
  {
    id: 'local_positive_2_en',
    type: 'positive',
    message: 'You deciphered the code. The Solstice stabilizes.',
    context: 'positive_en',
    emotion: 'excited'
  },
  {
    id: 'local_positive_3_en',
    type: 'positive',
    message: 'Harmony is restored. Keep going.',
    context: 'positive_en',
    emotion: 'happy'
  },
  {
    id: 'local_positive_4_en',
    type: 'positive',
    message: 'The pattern was revealed. Light wins.',
    context: 'positive_en',
    emotion: 'excited'
  },
  
  // ===== NEGATIVE (4 PT + 4 EN) =====
  {
    id: 'local_negative_1',
    type: 'negative',
    message: 'A escuridão se aproxima... tenha cuidado.',
    context: 'negative_pt',
    emotion: 'sad'
  },
  {
    id: 'local_negative_2',
    type: 'negative',
    message: 'Erro crítico. O sistema vacila.',
    context: 'negative_pt',
    emotion: 'angry'
  },
  {
    id: 'local_negative_3',
    type: 'negative',
    message: 'O caos se instala. Refaça seus passos.',
    context: 'negative_pt',
    emotion: 'sad'
  },
  {
    id: 'local_negative_4',
    type: 'negative',
    message: 'A instabilidade cresce. A resposta estava errada.',
    context: 'negative_pt',
    emotion: 'angry'
  },
  {
    id: 'local_negative_1_en',
    type: 'negative',
    message: 'Darkness approaches... be careful.',
    context: 'negative_en',
    emotion: 'sad'
  },
  {
    id: 'local_negative_2_en',
    type: 'negative',
    message: 'Critical error. The system falters.',
    context: 'negative_en',
    emotion: 'angry'
  },
  {
    id: 'local_negative_3_en',
    type: 'negative',
    message: 'Chaos ensues. Retrace your steps.',
    context: 'negative_en',
    emotion: 'sad'
  },
  {
    id: 'local_negative_4_en',
    type: 'negative',
    message: 'Instability grows. The answer was wrong.',
    context: 'negative_en',
    emotion: 'angry'
  },
  
  // ===== HINT (3 PT + 3 EN) =====
  {
    id: 'local_hint_1',
    type: 'hint',
    message: 'Observe os padrões. Cada código esconde uma verdade.',
    context: 'hint_pt',
    emotion: 'mysterious'
  },
  {
    id: 'local_hint_2',
    type: 'hint',
    message: 'A lógica binária é a chave para decifrar os códigos.',
    context: 'hint_pt',
    emotion: 'neutral'
  },
  {
    id: 'local_hint_3',
    type: 'hint',
    message: 'Confie na sua intuição. O raciocínio te guiará.',
    context: 'hint_pt',
    emotion: 'neutral'
  },
  {
    id: 'local_hint_1_en',
    type: 'hint',
    message: 'Observe the patterns. Each code hides a truth.',
    context: 'hint_en',
    emotion: 'mysterious'
  },
  {
    id: 'local_hint_2_en',
    type: 'hint',
    message: 'Binary logic is the key to deciphering the codes.',
    context: 'hint_en',
    emotion: 'neutral'
  },
  {
    id: 'local_hint_3_en',
    type: 'hint',
    message: 'Trust your intuition. Reasoning will guide you.',
    context: 'hint_en',
    emotion: 'neutral'
  },
  
  // ===== NARRATIVE (3 PT + 3 EN) =====
  {
    id: 'local_narrative_1',
    type: 'narrative',
    message: 'O cenário muda. O ciclo do Solstício se renova.',
    context: 'narrative_pt',
    emotion: 'mysterious'
  },
  {
    id: 'local_narrative_2',
    type: 'narrative',
    message: 'A noite cai sobre o mundo. A escuridão se espalha.',
    context: 'narrative_pt',
    emotion: 'sad'
  },
  {
    id: 'local_narrative_3',
    type: 'narrative',
    message: 'O amanhecer se aproxima. A luz retorna.',
    context: 'narrative_pt',
    emotion: 'excited'
  },
  {
    id: 'local_narrative_1_en',
    type: 'narrative',
    message: 'The scenery changes. The Solstice cycle renews.',
    context: 'narrative_en',
    emotion: 'mysterious'
  },
  {
    id: 'local_narrative_2_en',
    type: 'narrative',
    message: 'Night falls upon the world. Darkness spreads.',
    context: 'narrative_en',
    emotion: 'sad'
  },
  {
    id: 'local_narrative_3_en',
    type: 'narrative',
    message: 'Dawn approaches. The light returns.',
    context: 'narrative_en',
    emotion: 'excited'
  },
  
  // ===== CHALLENGE (1 PT + 1 EN) =====
  {
    id: 'local_challenge_1',
    type: 'challenge',
    message: 'Você está pronto para o último código? O Teste de Turing aguarda.',
    context: 'challenge_pt',
    emotion: 'mysterious'
  },
  {
    id: 'local_challenge_1_en',
    type: 'challenge',
    message: 'Are you ready for the last code? The Turing Test awaits.',
    context: 'challenge_en',
    emotion: 'mysterious'
  },
  
  // ===== GAMEOVER (2 PT + 2 EN) =====
  {
    id: 'local_gameover_1',
    type: 'gameover',
    message: 'O Solstício colapsou. Mas sempre há um novo amanhecer.',
    context: 'gameover_pt',
    emotion: 'sad'
  },
  {
    id: 'local_gameover_2',
    type: 'gameover',
    message: 'A energia se esgotou. O ciclo recomeça.',
    context: 'gameover_pt',
    emotion: 'neutral'
  },
  {
    id: 'local_gameover_1_en',
    type: 'gameover',
    message: 'The Solstice collapsed. But there is always a new dawn.',
    context: 'gameover_en',
    emotion: 'sad'
  },
  {
    id: 'local_gameover_2_en',
    type: 'gameover',
    message: 'Energy depleted. The cycle begins again.',
    context: 'gameover_en',
    emotion: 'neutral'
  },
  
  // ===== VICTORY (1 PT + 1 EN) =====
  {
    id: 'local_victory_1',
    type: 'victory',
    message: 'Você decifrou todos os códigos. O equilíbrio está restaurado!',
    context: 'victory_pt',
    emotion: 'excited'
  },
  {
    id: 'local_victory_1_en',
    type: 'victory',
    message: 'You deciphered all codes. Balance is restored!',
    context: 'victory_en',
    emotion: 'excited'
  }
];
// src/utils/i18n.ts
// Sistema de internacionalização

export type Language = 'pt' | 'en';

const translations: Record<string, Record<Language, string>> = {
  // ===== TELA INICIAL =====
  'start.press_space': {
    pt: '🏃 Pressione ESPAÇO para começar!',
    en: '🏃 Press SPACE to start!'
  },
  'start.title': {
    pt: '☀︎ TURING\'S SOLSTICE',
    en: '☀︎ TURING\'S SOLSTICE'
  },
  'start.subtitle': {
    pt: 'Pressione ESPAÇO para começar',
    en: 'Press SPACE to start'
  },
  'start.double_jump': {
    pt: '🦘 Pulo duplo: ESPAÇO duas vezes',
    en: '🦘 Double jump: SPACE twice'
  },
  'start.run': {
    pt: '🏃 Corra!',
    en: '🏃 Run!'
  },

  // ===== BOAS-VINDAS =====
  'welcome.decipher': {
    pt: '🧠 Decifre os códigos para sobreviver!',
    en: '🧠 Decipher the codes to survive!'
  },

  // ===== PAUSA =====
  'pause.title': {
    pt: '⏸️ JOGO PAUSADO',
    en: '⏸️ GAME PAUSED'
  },
  'pause.subtitle': {
    pt: 'Descanse um pouco, o jogo espera por você',
    en: 'Take a break, the game will wait for you'
  },
  'pause.resume': {
    pt: '▶ RETOMAR',
    en: '▶ RESUME'
  },
  'pause.hint': {
    pt: 'Pressione ESC ou clique no botão para retomar',
    en: 'Press ESC or click the button to resume'
  },
  'pause.paused': {
    pt: '⏸️ Pausado',
    en: '⏸️ Paused'
  },
  'pause.continue': {
    pt: '▶️ Continuando',
    en: '▶️ Continuing'
  },

  // ===== NÍVEL =====
  'level.new': {
    pt: '⚡ Nível',
    en: '⚡ Level'
  },

  // ===== CENA =====
  'scene.continue': {
    pt: '🏃 Continue correndo!',
    en: '🏃 Keep running!'
  },

  // ===== ENIGMA =====
  'enigma.new_code': {
    pt: '⚡ NOVO CÓDIGO!',
    en: '⚡ NEW CODE!'
  },
  'enigma.decipher': {
    pt: '🧠 DECIFRE O CÓDIGO!',
    en: '🧠 DECIPHER THE CODE!'
  },
  'enigma.correct': {
    pt: '✅ Correto! +15 energia',
    en: '✅ Correct! +15 energy'
  },
  'enigma.wrong': {
    pt: '❌ Errado! -10 energia',
    en: '❌ Wrong! -10 energy'
  },
  'enigma.timeout': {
    pt: '⏰ Tempo esgotado! -5 energia',
    en: '⏰ Time\'s up! -5 energy'
  },
  'enigma.select_option': {
    pt: '⌨️ Selecione uma opção',
    en: '⌨️ Select an option'
  },
  'enigma.code_deciphered': {
    pt: '✅ CÓDIGO DECIFRADO',
    en: '✅ CODE DECIPHERED'
  },
  'enigma.code_incorrect': {
    pt: '❌ CÓDIGO INCORRETO',
    en: '❌ INCORRECT CODE'
  },

  // ===== ENIGMA MACHINE (FASE 1) =====
  'enigma_machine.title': {
    pt: '🔐 FASE 1: A MÁQUINA ENIGMA',
    en: '🔐 PHASE 1: THE ENIGMA MACHINE'
  },
  'enigma_machine.subtitle': {
    pt: 'Decifre a mensagem secreta • Sem tempo limite',
    en: 'Decrypt the secret message • No time limit'
  },
  'enigma_machine.hint': {
    pt: '🔐 Decifre a mensagem secreta. Sem pressa.',
    en: '🔐 Decrypt the secret message. Take your time.'
  },
  'enigma_machine.decrypted': {
    pt: '✅ ENIGMA DECIFRADA!',
    en: '✅ ENIGMA DECRYPTED!'
  },
  'enigma_machine.success': {
    pt: '✅ Máquina Enigma decifrada! Preparando Teste de Turing...',
    en: '✅ Enigma Machine decrypted! Preparing Turing Test...'
  },
  'enigma_machine.wrong': {
    pt: '❌ Código errado! Tente novamente...',
    en: '❌ Wrong code! Try again...'
  },
  'enigma_machine.center': {
    pt: '🔐 A MÁQUINA ENIGMA',
    en: '🔐 THE ENIGMA MACHINE'
  },

  // ===== TURING TEST (FASE 2) =====
  'turing_test.title': {
    pt: '🧠 FASE 2: O TESTE DE TURING',
    en: '🧠 PHASE 2: THE TURING TEST'
  },
  'turing_test.subtitle': {
    pt: 'Identifique a Inteligência Artificial • Sem tempo limite',
    en: 'Identify the Artificial Intelligence • No time limit'
  },
  'turing_test.center': {
    pt: '🧠 O TESTE DE TURING',
    en: '🧠 THE TURING TEST'
  },

  // ===== GAME OVER =====
  'gameover.title': {
    pt: '☀︎ SOLSTICE COLLAPSED',
    en: '☀︎ SOLSTICE COLLAPSED'
  },
  'gameover.cycles': {
    pt: 'Ciclos',
    en: 'Cycles'
  },
  'gameover.points': {
    pt: 'Pontos',
    en: 'Points'
  },
  'gameover.restart': {
    pt: 'Pressione RECOMEÇAR ou R',
    en: 'Press RESTART or R'
  },
  'gameover.message': {
    pt: '💀 Fim de jogo!',
    en: '💀 Game Over!'
  },
  'gameover.level': {
    pt: 'Nível',
    en: 'Level'
  },

  // ===== MODOS =====
  'mode.hard_unlocked': {
    pt: '💀 Hard Mode desbloqueado! Pressione H',
    en: '💀 Hard Mode unlocked! Press H'
  },
  'mode.hard_activated': {
    pt: '💀 Hard Mode ATIVADO',
    en: '💀 Hard Mode ACTIVATED'
  },
  'mode.hard_deactivated': {
    pt: 'Hard Mode DESATIVADO',
    en: 'Hard Mode DEACTIVATED'
  },
  'mode.vision_unlocked': {
    pt: '👁️ Turing Vision desbloqueado! Pressione V',
    en: '👁️ Turing Vision unlocked! Press V'
  },
  'mode.vision_activated': {
    pt: '👁️ Turing Vision ATIVADO',
    en: '👁️ Turing Vision ACTIVATED'
  },
  'mode.vision_deactivated': {
    pt: 'Turing Vision DESATIVADO',
    en: 'Turing Vision DEACTIVATED'
  },
  'mode.spectrum_unlocked': {
    pt: '🎨 Spectrum Mode desbloqueado! Pressione S',
    en: '🎨 Spectrum Mode unlocked! Press S'
  },
  'mode.spectrum_activated': {
    pt: '🎨 Spectrum Mode ATIVADO',
    en: '🎨 Spectrum Mode ACTIVATED'
  },
  'mode.spectrum_deactivated': {
    pt: 'Spectrum Mode DESATIVADO',
    en: 'Spectrum Mode DEACTIVATED'
  },
  'mode.locked_hard': {
    pt: '🔒 Hard Mode (Ciclo 10)',
    en: '🔒 Hard Mode (Cycle 10)'
  },
  'mode.locked_vision': {
    pt: '🔒 Turing Vision (Ciclo 15)',
    en: '🔒 Turing Vision (Cycle 15)'
  },
  'mode.locked_spectrum': {
    pt: '🔒 Spectrum Mode (Ciclo 20)',
    en: '🔒 Spectrum Mode (Cycle 20)'
  },
  'mode.hard_on': {
    pt: '💀 Hard Mode: ON',
    en: '💀 Hard Mode: ON'
  },
  'mode.hard_off': {
    pt: '💀 Hard Mode: OFF',
    en: '💀 Hard Mode: OFF'
  },
  'mode.vision_on': {
    pt: '👁️ Turing Vision: ON',
    en: '👁️ Turing Vision: ON'
  },
  'mode.vision_off': {
    pt: '👁️ Turing Vision: OFF',
    en: '👁️ Turing Vision: OFF'
  },
  'mode.spectrum_on': {
    pt: '🎨 Spectrum Mode: ON',
    en: '🎨 Spectrum Mode: ON'
  },
  'mode.spectrum_off': {
    pt: '🎨 Spectrum Mode: OFF',
    en: '🎨 Spectrum Mode: OFF'
  },

  // ===== TURING =====
  'turing.title': {
    pt: '🔐 O ÚLTIMO CÓDIGO',
    en: '🔐 THE LAST CODE'
  },
  'turing.unlocked': {
    pt: '🌈 TURING VISION DESBLOQUEADO!',
    en: '🌈 TURING VISION UNLOCKED!'
  },
  'turing.no_time_limit': {
    pt: '🔐 Não há tempo limite. Reflita com calma.',
    en: '🔐 No time limit. Take your time.'
  },

  // ===== HINTS =====
  'hint.pattern': {
    pt: 'O padrão revela a verdade',
    en: 'The pattern reveals the truth'
  },
  'hint.details': {
    pt: 'A resposta está nos detalhes',
    en: 'The answer is in the details'
  },
  'hint.logic': {
    pt: 'Confie na lógica',
    en: 'Trust the logic'
  },
  'hint.observe': {
    pt: 'Observe com atenção',
    en: 'Observe carefully'
  },
  'hint.code': {
    pt: 'O código fala por si',
    en: 'The code speaks for itself'
  },

  // ===== HUD =====
  'hud.level': {
    pt: '⚡ Nível',
    en: '⚡ Level'
  },

  // ===== RANKING =====
  'ranking.title': {
    pt: '🏆 RANKING',
    en: '🏆 RANKING'
  },
  'ranking.personal': {
    pt: '🏠 Pessoal',
    en: '🏠 Personal'
  },
  'ranking.global': {
    pt: '🌍 Global',
    en: '🌍 Global'
  },
  'ranking.back': {
    pt: '↩ VOLTAR',
    en: '↩ BACK'
  },
  'ranking.loading': {
    pt: '🌍 Carregando...',
    en: '🌍 Loading...'
  },
  'ranking.unavailable': {
    pt: '🌍 Ranking global indisponível',
    en: '🌍 Global ranking unavailable'
  },
  'ranking.empty': {
    pt: '📭 Nenhum score ainda',
    en: '📭 No scores yet'
  },
  'ranking.not_configured': {
    pt: '⚠️ Ranking global não configurado',
    en: '⚠️ Global ranking not configured'
  },
};

let currentLanguage: Language = 'pt';

const STORAGE_KEY = 'turing-solstice-language';

// Detecta idioma do navegador
function detectBrowserLanguage(): Language {
  const lang = navigator.language || (navigator as any).userLanguage || 'pt';
  return lang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

// Carrega idioma salvo ou detecta do navegador
const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
if (savedLanguage === 'pt' || savedLanguage === 'en') {
  currentLanguage = savedLanguage;
} else {
  currentLanguage = detectBrowserLanguage();
  localStorage.setItem(STORAGE_KEY, currentLanguage);
}

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Missing translation: ${key}`);
    return key;
  }
  return translation[currentLanguage] || translation['pt'] || key;
}

export function tFormat(key: string, ...args: (string | number)[]): string {
  let text = t(key);
  args.forEach((arg, i) => {
    text = text.replace(`{${i}}`, String(arg));
  });
  return text;
}
export const JSONBin = {
    API_KEY: import.meta.env.VITE_JSONBIN_API_KEY || '',
    BIN_ID: import.meta.env.VITE_JSONBIN_BIN_ID || '',
    BASE_URL: import.meta.env.VITE_JSONBIN_API_URL || 'https://api.jsonbin.io/v3/b',
    MAX_ENTRIES: 20,
}

export const GEMINI = {
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    BASE_URL: import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models',
    MODEL: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite',
    
}
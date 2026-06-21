/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JSONBIN_API_KEY: string;
  readonly VITE_JSONBIN_BIN_ID: string;
  readonly VITE_JSONBIN_API_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_MODEL: string;
  readonly VITE_GEMINI_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
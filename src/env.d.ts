/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FITBIT_CLIENT_ID: string;
  readonly FITBIT_CLIENT_SECRET: string;
  readonly VENICE_API_KEY: string;
  readonly VENICE_MODEL: string;
  readonly VENICE_BASE_URL: string;
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

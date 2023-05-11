/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;

  //...declare env variables types here...
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
};

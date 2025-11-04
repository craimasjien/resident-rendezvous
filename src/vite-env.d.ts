/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string | undefined
  readonly VITE_APP_DESCRIPTION: string | undefined
  readonly VITE_FIREBASE_API_KEY: string | undefined
  readonly VITE_FIREBASE_AUTH_DOMAIN: string | undefined
  readonly VITE_FIREBASE_PROJECT_ID: string | undefined
  readonly VITE_FIREBASE_APP_ID: string | undefined
  readonly VITE_FIREBASE_STORAGE_BUCKET: string | undefined
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string | undefined
  readonly VITE_FIREBASE_MEASUREMENT_ID: string | undefined
  readonly VITE_BUILD_DATE: string | undefined
  readonly VITE_BUILD_COMMIT: string | undefined
  readonly VITE_BUILD_COMMIT_FULL: string | undefined
  readonly VITE_GITHUB_REPO_URL: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
interface ImportMetaEnv {
    readonly MODE?: string;
    readonly VITE_TEST_REDIRECT_URL: string;
    readonly VITE_TEST_PROXY_URL: string;
    readonly VITE_TEST_CLIENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

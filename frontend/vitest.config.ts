import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "fix-vite-rolldown-warnings",
      configResolved(config) {
        if (config.optimizeDeps?.rollupOptions) {
          const rollupOpts = config.optimizeDeps.rollupOptions as any;
          if (rollupOpts) {
            config.optimizeDeps.rolldownOptions = {
              ...config.optimizeDeps.rolldownOptions,
              ...rollupOpts,
            };
            delete (config.optimizeDeps.rolldownOptions as any).jsx;
            delete (config.optimizeDeps as any).rollupOptions;
          }
        }
      },
    },
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

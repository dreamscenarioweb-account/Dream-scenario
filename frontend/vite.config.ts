import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const resolvedPort = Number.parseInt(env.VITE_PORT || "3000", 10);

  if (command === "build" && !env.VITE_API_URL?.trim()) {
    throw new Error("VITE_API_URL must be set for non-development web builds.");
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: Number.isNaN(resolvedPort) ? 3000 : resolvedPort,
      strictPort: true,
    },
  };
});

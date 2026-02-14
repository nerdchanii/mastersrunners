import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: [
    "@prisma/adapter-libsql",
    "@libsql/client",
    "libsql",
    "@prisma/client",
  ],
});

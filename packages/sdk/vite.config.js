import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "lodash-es",
        "aptos-tool",
        "graphql-request",
        "bignumber.js",
        "long",
      ],
    },
  },
  resolve: { alias: { src: resolve("src/") } },
  plugins: [
    dts({
      outDir: "dist/types",
    }),
  ],
});

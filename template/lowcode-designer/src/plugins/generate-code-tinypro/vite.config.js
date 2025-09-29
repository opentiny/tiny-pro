import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "TinyProGenerateCodePlugin",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") return "index.esm.js";
        if (format === "cjs") return "index.js";
      },
    },
    rollupOptions: {
      external: [
        "vue",
        "@opentiny/tiny-engine",
        "@opentiny/tiny-engine-meta-register",
        "@opentiny/tiny-engine-utils",
        "@opentiny/vue",
        "@opentiny/icons",
        "@vueuse/core",
      ],
      output: {
        globals: {
          vue: "Vue",
          "@opentiny/tiny-engine": "TinyEngine",
          "@opentiny/tiny-engine-meta-register": "TinyEngineMetaRegister",
          "@opentiny/tiny-engine-utils": "TinyEngineUtils",
          "@opentiny/vue": "TinyVue",
          "@opentiny/icons": "TinyIcons",
          "@vueuse/core": "VueUse",
        },
      },
    },
    cssCodeSplit: false,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});

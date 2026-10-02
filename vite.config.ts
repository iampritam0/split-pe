import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/split-pe/",

  preview: {

    allowedHosts: ["https://www.splitpe.zyz", "https://splitpe.zyz"],
  },
build:{
  chunkSizeWarningLimit: 2000,
}
});
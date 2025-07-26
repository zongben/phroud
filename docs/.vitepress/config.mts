import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Empack",
  description: "Empack",
  base: "/empack/",
  lang: "en-us",
  locales: {
    root: {
      label: "English",
      lang: "en-us",
      link: "/",
      themeConfig: {
        nav: [{ text: "Guide", link: "/guide" }],
        sidebar: [
          {
            text: "Introduction",
            items: [
              { text: "Getting Started", link: "/getting-started" },
            ],
          },
        ],
        socialLinks: [
          { icon: "github", link: "https://github.com/zongben/empack" },
        ],
      },
    },
  },
});

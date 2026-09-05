import type { MetadataRoute } from "next";

/** Next.js 原生 manifest 路由，产出 /manifest.webmanifest */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sihat — Health message risk check",
    short_name: "Sihat",
    description:
      "Check a forwarded health message against Malaysia's official cancelled-product records.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf8",
    theme_color: "#fbfaf8",
    orientation: "portrait",
    categories: ["health", "medical", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

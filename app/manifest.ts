import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Practica — Cursos interactivos",
    short_name: "Practica",
    description:
      "Aprende practicando, no solo mirando. Simulaciones interactivas en el móvil y en el escritorio.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#d7e0ea",
    theme_color: "#2fb8ae",
    lang: "es",
    dir: "ltr",
    categories: ["education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

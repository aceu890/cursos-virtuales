/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import { NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  precacheEntries: [
    { url: "/", revision: "app-shell-1" },
    { url: "/catalogo", revision: "app-shell-1" },
    { url: "/offline", revision: "app-shell-1" },
    { url: "/configuracion", revision: "app-shell-1" },
    { url: "/planos", revision: "app-shell-1" },
    { url: "/laboratorio", revision: "app-shell-1" },
  ],
  runtimeCaching: [
    {
      matcher: ({ url, request }) =>
        request.destination === "document" && url.pathname.startsWith("/cursos/"),
      handler: new NetworkFirst({
        cacheName: "lecciones-visitadas",
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "app-static",
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

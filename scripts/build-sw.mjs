import { build } from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

await build({
  entryPoints: ["service-worker/sw.ts"],
  bundle: true,
  outfile: "public/sw.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  logLevel: "info",
});

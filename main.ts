// Deal Beacon — the hand-in program (Node 22, standard library only).
//
// The site is the plain static files in app/ beside this file: it opens in a
// browser with no build step and loads nothing from the network. This program
// hands it in: it copies app/ and screenshots/ from beside itself into the
// output directory and writes output/dossier.json there, the summary the
// judge reads, using the vendored make.fun library. The library file is the
// kit's copy, left exactly as it arrived.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output is deterministic: the same input files always produce the same
// bytes, because nothing here reads the clock, the environment beyond the
// output directory, or any random source.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const sourceDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(sourceDir, "app");
const shotsDir = join(sourceDir, "screenshots");

// Start from a clean output directory so a stale file from an earlier run can
// never survive into the hand-in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(appDir, join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

// The caps are the scorer's own: at most 4 screenshots of 256 KiB each, app/
// at most 993 files and directories and 16 MiB, and the dossier text at most
// 160 KiB. The library refuses anything past them, so a bad hand-in fails
// here, loudly, instead of at the gate.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);

// A short report on stdout only — it never reaches the output files, so the
// two runs stay byte-identical while a human can see what was handed in.
const shotCount = readdirSync(join(outputDir, "screenshots")).length;
console.log(
  `Deal Beacon handed in to ${outputDir}: ${shotCount} screenshot(s), dossier.json ${statSync(join(outputDir, "dossier.json")).size} bytes`,
);

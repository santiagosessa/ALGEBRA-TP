import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const runtimeNodeModules = "C:\\Users\\santi\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const require = createRequire(import.meta.url);
const { createCanvas } = require(path.join(runtimeNodeModules, "@napi-rs/canvas"));
const pdfjs = await import(pathToFileURL(path.join(runtimeNodeModules, "pdfjs-dist", "legacy", "build", "pdf.mjs")));

const root = path.resolve(process.cwd());
const pdfPath = path.join(root, "presentation-assets", "informe_tecnico_utn_3d-google.pdf");
const outputDir = path.join(root, "presentation-assets", "google-slides");
await mkdir(outputDir, { recursive: true });

const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readFile(pdfPath)), disableWorker: true }).promise;
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1.75, 1600 / baseViewport.width);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext("2d");
  await page.render({ canvasContext: context, viewport }).promise;
  await writeFile(path.join(outputDir, `slide-${String(pageNumber).padStart(2, "0")}.png`), canvas.toBuffer("image/png"));
}

console.log(JSON.stringify({ pages: pdf.numPages, outputDir }));

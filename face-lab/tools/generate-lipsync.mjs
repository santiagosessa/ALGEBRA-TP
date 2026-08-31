import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const faceLabRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rhubarbPath = resolve(process.argv[2] || join(faceLabRoot, "tools", "rhubarb", "Rhubarb-Lip-Sync-1.14.0-Windows", "rhubarb.exe"));
const indexPath = join(faceLabRoot, "index.html");
const dialogRoot = join(faceLabRoot, "tools", "lipsync-dialogs");
const outputRoot = join(faceLabRoot, "lipsync");

const html = await readFile(indexPath, "utf8");
const scripts = [...html.matchAll(/script:"((?:\\.|[^"\\])*)"/g)].map((match) => match[1]);
if (scripts.length !== 12) {
  throw new Error(`Se esperaban 12 guiones y se encontraron ${scripts.length}.`);
}

await mkdir(dialogRoot, { recursive: true });
await mkdir(outputRoot, { recursive: true });

function runRhubarb(args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(rhubarbPath, args, {
      cwd: dirname(rhubarbPath),
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", rejectRun);
    child.on("close", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`Rhubarb terminó con código ${code}.`));
    });
  });
}

for (let index = 0; index < scripts.length; index += 1) {
  const fileNumber = String(index + 1).padStart(2, "0");
  const dialogPath = join(dialogRoot, `slide-${fileNumber}.txt`);
  const outputPath = join(outputRoot, `slide-${fileNumber}.json`);
  const audioPath = join(faceLabRoot, "voice", `slide-${fileNumber}.wav`);
  await writeFile(dialogPath, scripts[index], "utf8");
  process.stdout.write(`Generando cues para slide-${fileNumber}...\n`);
  await runRhubarb([
    "-q",
    "-r",
    "phonetic",
    "-d",
    dialogPath,
    "-f",
    "json",
    "-o",
    outputPath,
    audioPath,
  ]);
}

process.stdout.write(`Listo: ${scripts.length} archivos JSON en ${outputRoot}\n`);

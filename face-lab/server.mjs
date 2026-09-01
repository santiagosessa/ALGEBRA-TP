import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const configuredPort = Number.parseInt(process.env.PORT || "4173", 10);
const port = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 4173;
const host = process.env.HOST || "0.0.0.0";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".wav": "audio/wav",
  ".svg": "image/svg+xml",
};
const securityHeaders = {
  // Report only: KTX2Loader needs a trusted local worker with runtime evaluation.
  "Content-Security-Policy-Report-Only": "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

const isWithinRoot = (candidate, allowedRoot) => {
  const relativePath = relative(allowedRoot, candidate);
  return relativePath === ""
    || (!relativePath.startsWith(`..${sep}`)
      && relativePath !== ".."
      && !relativePath.includes(`:${sep}`));
};

createServer(async (request, response) => {
  if (request.url === "/healthz") {
    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }
  const relativePath = requestPath === "/" ? "/index.html" : requestPath;
  let filePath;
  let allowedRoot;
  if (requestPath === "/tp-trabajo-grupal.pdf" || requestPath === "/TP Trabajo Grupal.pdf" || requestPath === "/pdf/tp-trabajo-grupal.pdf") {
    filePath = normalize(join(root, "tp-trabajo-grupal.pdf"));
    allowedRoot = root;
  } else {
    filePath = normalize(join(root, relativePath));
    allowedRoot = root;
  }

  if (!isWithinRoot(filePath, allowedRoot)) {
    response.writeHead(403, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": mime[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": extname(filePath) === ".html" ? "no-store" : "public, max-age=3600",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Face Lab running at http://${host}:${port}`);
});

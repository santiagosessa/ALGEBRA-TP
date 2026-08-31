import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
};
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
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
  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }
  const relativePath = requestPath === "/" ? "/index.html" : requestPath;
  const visualAssetsRoot = normalize(join(root, "..", "assets_utn_visuales"));
  const filePath = requestPath.startsWith("/assets/utn_visuales/")
    ? normalize(join(visualAssetsRoot, requestPath.slice("/assets/utn_visuales/".length)))
    : normalize(join(root, relativePath));
  const allowedRoot = requestPath.startsWith("/assets/utn_visuales/") ? visualAssetsRoot : root;

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
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("Face Lab running at http://127.0.0.1:4173");
});

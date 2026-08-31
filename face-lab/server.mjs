import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
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

createServer(async (request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = requestPath === "/" ? "/index.html" : requestPath;
  const visualAssetsRoot = normalize(join(root, "..", "assets_utn_visuales"));
  const filePath = requestPath.startsWith("/assets/utn_visuales/")
    ? normalize(join(visualAssetsRoot, requestPath.slice("/assets/utn_visuales/".length)))
    : normalize(join(root, relativePath));
  const allowedRoot = requestPath.startsWith("/assets/utn_visuales/") ? visualAssetsRoot : root;

  if (!filePath.startsWith(allowedRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mime[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("Face Lab running at http://127.0.0.1:4173");
});

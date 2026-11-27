// A small static server for app/ while developing Deal Beacon (Node 22,
// standard library only). Run `node serve.ts` and open
// http://localhost:8080 — `--port <n>` serves on another port. It sends the
// MIME types a browser needs, refuses every path outside app/, and does
// nothing else: a development convenience, not a server for the internet.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./app", import.meta.url)));
const args = process.argv.slice(2);
const portArg = args.indexOf("--port");
const wanted = portArg === -1 ? 8080 : Number(args[portArg + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("bad request");
    return;
  }
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(join(root, normalize(path)));
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end("forbidden");
    return;
  }
  let size;
  try {
    const found = statSync(file);
    if (!found.isFile()) throw new Error("not a file");
    size = found.size;
  } catch {
    response.writeHead(404).end("not found");
    return;
  }
  response.writeHead(200, {
    "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
    "content-length": size,
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Deal Beacon app/ is on http://localhost:${port}`);
}).on("error", (err) => {
  // A port already in use is the usual failure: say so plainly instead of
  // crashing with a bare stack trace.
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use — try --port <another one>.`);
    process.exit(1);
  }
  throw err;
});

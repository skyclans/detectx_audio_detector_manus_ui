#!/usr/bin/env node
/**
 * Build-time prerender script for SEO.
 * Runs after `vite build` — launches headless Chrome via Puppeteer,
 * visits each static route, and saves the rendered HTML.
 */
import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(__dirname, "..", "dist", "public");

const ROUTES = [
  "/",
  "/technology",
  "/research",
  "/updates",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
];

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Simple static file server with SPA fallback
function createStaticServer(dir) {
  const indexHtml = readFileSync(join(dir, "index.html"), "utf-8");

  return createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let filePath = join(dir, url.pathname);

    // Try exact file
    if (existsSync(filePath) && !filePath.endsWith("/")) {
      try {
        const stat = statSync(filePath);
        if (stat.isFile()) {
          const ext = extname(filePath);
          res.writeHead(200, {
            "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
          });
          res.end(readFileSync(filePath));
          return;
        }
      } catch {}
    }

    // Try with index.html
    const indexPath = join(filePath, "index.html");
    if (existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(readFileSync(indexPath));
      return;
    }

    // SPA fallback — serve root index.html
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexHtml);
  });
}

async function prerender() {
  if (!existsSync(DIST)) {
    console.error("dist/public/ not found. Run `vite build` first.");
    process.exit(1);
  }

  // Start temp server
  const server = createStaticServer(DIST);
  const port = 4173;
  await new Promise((resolve) => server.listen(port, resolve));
  console.log(`[prerender] Static server on http://localhost:${port}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let success = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();

    // Suppress console noise from the page
    page.on("console", () => {});
    page.on("pageerror", () => {});

    try {
      await page.goto(`http://localhost:${port}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait a bit for any animations/transitions to settle
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

      const html = await page.content();

      // Determine output path
      if (route === "/") {
        writeFileSync(join(DIST, "index.html"), html, "utf-8");
      } else {
        const dir = join(DIST, route);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), html, "utf-8");
      }

      success++;
      console.log(`[prerender] ${route} — OK`);
    } catch (err) {
      console.error(`[prerender] ${route} — FAILED: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(
    `[prerender] Done: ${success}/${ROUTES.length} pages prerendered`
  );

  if (success < ROUTES.length) {
    process.exit(1);
  }
}

prerender();

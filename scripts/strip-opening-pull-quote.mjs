#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ARTICLES_DIR = "src/content/articles";
const dryRun = process.argv.includes("--dry-run");

const ATTRIBUTION_REGEX = /Mark W\.\s*Smith|Four Boxes Diner Host/i;

function stripOpeningQuote(content) {
  const lines = content.split("\n");

  let dashCount = 0;
  let bodyStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      dashCount++;
      if (dashCount === 2) {
        bodyStart = i + 1;
        break;
      }
    }
  }
  if (bodyStart === -1) return null;

  let cursor = bodyStart;
  while (cursor < lines.length && lines[cursor].trim() === "") cursor++;
  if (cursor >= lines.length || !lines[cursor].startsWith(">")) return null;

  let quoteEnd = cursor;
  while (quoteEnd < lines.length) {
    const t = lines[quoteEnd].trim();
    if (t === "" || t.startsWith(">")) {
      quoteEnd++;
    } else {
      break;
    }
  }
  while (quoteEnd > cursor && lines[quoteEnd - 1].trim() === "") quoteEnd--;

  const quoteBlock = lines.slice(cursor, quoteEnd).join("\n");
  if (!ATTRIBUTION_REGEX.test(quoteBlock)) return null;

  const before = lines.slice(0, bodyStart).join("\n");
  let after = lines.slice(quoteEnd).join("\n").replace(/^\n+/, "");
  return `${before}\n\n${after}`;
}

const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".md"));
let changed = 0;
for (const f of files) {
  const path = join(ARTICLES_DIR, f);
  const original = readFileSync(path, "utf8");
  const updated = stripOpeningQuote(original);
  if (updated && updated !== original) {
    changed++;
    console.log(`${dryRun ? "[dry-run] " : ""}stripped: ${f}`);
    if (!dryRun) writeFileSync(path, updated);
  }
}
console.log(`${dryRun ? "[dry-run] " : ""}files changed: ${changed}/${files.length}`);

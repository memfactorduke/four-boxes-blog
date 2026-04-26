#!/usr/bin/env node
/**
 * Backfill youtube_id, youtube_url, and duration on a placeholder article
 * once the video has been published.
 *
 * Usage:
 *   node scripts/link-video.mjs <article-slug-or-path> <youtube-id>
 *
 * Examples:
 *   node scripts/link-video.mjs 2026-04-27-tennessee-deadly-force ABC123xyz
 *   node scripts/link-video.mjs src/content/articles/2026-04-27-foo.md ABC123xyz
 *
 * Behavior:
 *   - Resolves the article markdown file (full path, basename, or basename
 *     without .md extension all work).
 *   - Calls yt-dlp to fetch the video's duration.
 *   - Updates the frontmatter fields youtube_id, youtube_url, and duration
 *     in place. Does NOT touch the body or any other field.
 *   - Refuses to overwrite a non-empty youtube_id unless --force is passed.
 */

import { readFile, writeFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { execFileSync } from "child_process";

const args = process.argv.slice(2);
const force = args.includes("--force");
const positional = args.filter((a) => !a.startsWith("--"));
if (positional.length !== 2) {
  console.error(
    "Usage: node scripts/link-video.mjs <article-slug-or-path> <youtube-id> [--force]",
  );
  process.exit(1);
}
const [target, youtubeId] = positional;

const articlesDir = join(process.cwd(), "src", "content", "articles");

async function resolveArticleFile(t) {
  if (existsSync(t)) return t;
  const candidates = [
    join(articlesDir, t),
    join(articlesDir, `${t}.md`),
    join(articlesDir, basename(t)),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  // last resort: glob match by prefix
  const all = await readdir(articlesDir);
  const match = all.find((f) => f.startsWith(t) || f.replace(/\.md$/, "") === t);
  if (match) return join(articlesDir, match);
  throw new Error(`Could not resolve article: ${t}`);
}

const articleFile = await resolveArticleFile(target);
console.log(`Article: ${articleFile}`);

const original = await readFile(articleFile, "utf-8");
const fmMatch = original.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fmMatch) {
  console.error("No frontmatter found in article.");
  process.exit(1);
}
const fm = fmMatch[1];
const body = fmMatch[2];

const idMatch = fm.match(/^youtube_id:\s*"([^"]*)"/m);
if (idMatch && idMatch[1] && !force) {
  console.error(
    `youtube_id already set to "${idMatch[1]}". Use --force to overwrite.`,
  );
  process.exit(1);
}

console.log(`Fetching metadata for ${youtubeId}...`);
const meta = execFileSync(
  "yt-dlp",
  [
    "--print",
    "%(duration_string)s",
    "--skip-download",
    `https://www.youtube.com/watch?v=${youtubeId}`,
  ],
  { encoding: "utf-8" },
).trim();
const duration = meta;
const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
console.log(`  duration: ${duration}`);
console.log(`  youtube_url: ${youtubeUrl}`);

function setField(text, field, value) {
  const re = new RegExp(`^${field}:\\s*"[^"]*"`, "m");
  if (re.test(text)) return text.replace(re, `${field}: "${value}"`);
  // field absent: insert after `date:` line as a stable anchor
  return text.replace(/^date:\s*"[^"]*"$/m, (m) => `${m}\n${field}: "${value}"`);
}

let newFm = fm;
newFm = setField(newFm, "youtube_url", youtubeUrl);
newFm = setField(newFm, "youtube_id", youtubeId);
newFm = setField(newFm, "duration", duration);

const updated = `---\n${newFm}\n---\n${body}`;
if (updated === original) {
  console.log("No changes (frontmatter already matches).");
  process.exit(0);
}
await writeFile(articleFile, updated, "utf-8");
console.log("Frontmatter updated.");

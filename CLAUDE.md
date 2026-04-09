# Professor2A Site

## Project Overview
Second Amendment legal analysis blog (2ablog.com) for The Four Boxes Diner / Mark W. Smith. Astro + Tailwind, deployed on Netlify. AI chatbot (Grok + Perplexity + Voyage AI). Currently v0.5.0 with 55 articles.

## Commands
- Build: `cd four-boxes-blog && npm run build`
- Dev: `cd four-boxes-blog && npm run dev`
- Preview: `cd four-boxes-blog && npm run preview`
- Format: `npx prettier --write`
- Generate missing article images: `cd four-boxes-blog && XAI_API_KEY=... node scripts/generate-article-images.mjs`

## Article Pipeline (for "pull N videos")
1. Fetch video IDs from YouTube channel, filter out existing
2. Get metadata (date, title, duration) for each new video
3. Download + clean transcripts (yt-dlp VTT → plain text)
4. Launch parallel haiku agents (one per video) with EXACT frontmatter schema
5. Agents must NOT generate images — only write markdown
6. Run frontmatter validation/fix pass before building
7. Generate images centrally via `scripts/generate-article-images.mjs`
8. Build, verify, commit, push

## Rules

### Planning & Execution
- Use plan mode for any task with 3+ steps
- Use subagents liberally to preserve context
- Never mark tasks complete without verification — run tests/build to prove it works
- Start fresh conversations for each distinct topic

### Code Quality
- Keep code simple. No over-engineering or premature abstractions
- No unused code, dead imports, or commented-out blocks
- Verify changes compile/build before declaring done

### Git
- Write clear, descriptive commit messages
- One logical change per commit
- Never force push to main
- After each significant update that builds successfully, commit and push to origin automatically — don't wait for the user to ask

### Mistakes Log
- Article agents use wrong frontmatter fields (pubDate, videoId, category, etc). Always include exact schema in agent prompt and validate before building.
- Never let agents generate images — they don't use the xAI pipeline. Generate images centrally after all articles are written.
- Astro `<style>` is scoped by default — use `is:global` for styles targeting dynamic JS-created elements (like chat messages).
- DATES MUST BE 2026, NOT 2025. The current year is 2026. yt-dlp returns correct dates (e.g., 20260405). Never "fix" a 2026 date to 2025. Always use the date from yt-dlp as-is, formatted as "YYYY-MM-DD".

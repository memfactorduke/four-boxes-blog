# Professor2A Site — `four-boxes-blog` (deploy repo)

> **Operating manual for Claude Code.** This file is loaded automatically into context
> at the start of every session in this repo. It is the single source of truth for how
> this project works — a fresh agent on a fresh machine should be able to clone this repo,
> read this file, and run every pipeline exactly the way prior agents did. These
> instructions OVERRIDE default behavior; follow them exactly.

## Project Overview
Second Amendment legal-analysis blog (**2ablog.com**) for The Four Boxes Diner / Professor Mark W. Smith. **Astro + Tailwind**, deployed on **Netlify**. AI chatbot (Grok + Perplexity + Voyage AI). Articles are generated from Mark's YouTube videos via the pipeline below and published under his byline.

---

## For a Claude Code agent: how to operate (read this first)
- **The headline task is "pull this video / pull N videos and write the article(s)."** That always means: run the full **Article Pipeline** below — fetch from YouTube, research, write, check, fact-check, generate images, build, commit, push. It is never just "write some text."
- **"Update with new articles" = pull new videos from the channel.** Don't ask which interpretation.
- **Use subagents liberally** (parallel Sonnet agents) for research / writing / checking to preserve main-thread context. The pipeline is designed around this.
- **Use plan mode for any task with 3+ steps.**
- **Never mark a task done without verifying** — run `npm run build` to prove it compiles before committing.
- **Commit + push from inside THIS repo after a successful build** (see Deploy model). Pushing to `main` is the publish action — it triggers the Netlify deploy. Don't wait to be asked.
- **Confirm before substituting values the user gives you.** If a date / spelling / caption the user provides looks wrong, ASK — never silently "fix" it.

---

## Setup / Prerequisites (fresh machine)
1. **Node ≥ 22.12.0** (see `package.json` `engines`). Astro 6.x.
2. `npm install` in this directory.
3. **`yt-dlp`** on PATH — used to fetch video metadata, transcripts (VTT subtitles), and durations. Install via `brew install yt-dlp` / `pipx install yt-dlp`.
4. **`deno`** on PATH — recent `yt-dlp` needs it to solve YouTube's JS challenges. `brew install deno`.
5. **`.env`** — copy `.env.example` to `.env` and fill in the keys you need (see next section). `.env` is gitignored; never commit real keys.
6. `pagefind` and `imagen`/Voyage are reached over the network by the build/scripts — no separate install (pagefind runs via `npx`).

---

## Environment variables
Copy `.env.example` → `.env`. Two tiers:

| Var | Needed where | Required for the article pipeline? | Notes |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | local scripts | **Yes** — image generation | Imagen 4 (`imagen-4.0-generate-001`). The ONLY key the article pipeline needs locally. |
| `VOYAGE_API_KEY` | local build | Optional | Search-index embeddings. **Without it the build silently falls back to TF-IDF** (still works). Production currently runs TF-IDF. |
| `XAI_API_KEY` | Netlify runtime | No | Chatbot (Grok). Set in Netlify env; not used when writing articles. |
| `PERPLEXITY_API_KEY` | Netlify runtime | No | Chatbot. Netlify env only. |
| `ADMIN_TOKEN` | Netlify runtime | No | Admin dashboard auth. Netlify env only. |
| `GOATCOUNTER_API_KEY` | Netlify runtime | No | Analytics. Netlify env only. |

The runtime keys (`XAI`/`PERPLEXITY`/`ADMIN_TOKEN`/`GOATCOUNTER`) live in **Netlify's environment variables** for the production site — an agent writing articles locally never needs them. For local article work you generally only need `GEMINI_API_KEY` (and optionally `VOYAGE_API_KEY`).

---

## Commands
Run from this directory (`four-boxes-blog/`):
- **Build:** `npm run build` — runs `build-search-index.mjs` → `astro build` → `pagefind`. This is the verification gate; it validates every article's frontmatter against the schema.
- **Dev:** `npm run dev` (localhost:4321)
- **Preview:** `npm run preview`
- **Format:** `npx prettier --write`
- **Generate missing article images:** `GEMINI_API_KEY=... node scripts/generate-article-images.mjs`
  - Scans all articles, generates a thumbnail (16:9, Imagen 4) for any whose image file is missing. Idempotent — skips articles that already have an image. Reads each article's `image_prompt` and appends a standard "no people / no text / photoreal" suffix.
- **Backfill a video onto a placeholder article:** `node scripts/link-video.mjs <slug-or-path> <youtube-id>` (`--force` to overwrite an already-set id). Fetches duration via yt-dlp; rewrites only `youtube_id`, `youtube_url`, `duration`.
- **Rebuild search index manually:** `VOYAGE_API_KEY=... node scripts/build-search-index.mjs` (also runs as the first step of `npm run build`).

### Reproducible transcript fetch + clean (pipeline step 3)
```sh
# metadata (use upload_date AS-IS, any year 2021–2026)
yt-dlp --skip-download --print "%(id)s|%(title)s|%(upload_date)s|%(duration_string)s" "<URL>"
# subtitles (auto-subs ok)
yt-dlp --skip-download --write-auto-sub --write-sub --sub-lang en --sub-format vtt \
  --output "<ID>.%(ext)s" "<URL>"
```
Then strip VTT cue timing/tags and collapse the rolling-caption duplicate lines into plain prose before handing the transcript to agents.

---

## Deploy model (IMPORTANT)
- **This repo (`four-boxes-blog/`) is the Netlify deploy repo.** Its `git remote origin` is the GitHub repo Netlify builds from. **Pushing to `main` triggers a production deploy to 2ablog.com.**
- **Always commit and push from inside this directory.** A push to `main` is the publish step.
- One logical change per commit. Clear messages. **Never force-push `main`.**
- An article commit normally includes 4 files: the new `src/content/articles/<slug>.md`, its `public/images/articles/<slug>.jpg`, and the two regenerated `data/article-chunks.json` + `data/vector-index.json` search-index files. (TF-IDF re-weights across the whole corpus when a doc is added, so those two files show large diffs — that's expected.)
- Verify live after deploy: `curl -sL -o /dev/null -w "%{http_code}" https://2ablog.com/articles/<slug>/` (article URL slug = the markdown filename without `.md`).

> **Note on the origin machine only:** historically this folder sat inside a local-only *parent* wrapper repo used for drafts/transcripts. That wrapper is **not** deployed and does **not** exist on a fresh clone. On a fresh machine, just clone `four-boxes-blog` directly; keep transcripts/drafts in a local gitignored scratch folder if you like.

---

## Frontmatter schema (EXACT — from `src/content.config.ts`)
Agents repeatedly get this wrong (inventing `pubDate`, `videoId`, `category`). Use these field names ONLY, and run a validation/build pass before committing.

```yaml
---
title: "..."                       # string (required)
date: "YYYY-MM-DD"                 # string — MUST equal yt-dlp upload_date (see Dates rule)
youtube_url: "https://www.youtube.com/watch?v=VID"  # or "" for placeholder
youtube_id: "VID"                  # or "" for placeholder
thumbnail: "/images/articles/<slug>.jpg"            # required string
duration: "16:06"                  # or "" for placeholder
author: "Mark W. Smith"
cases_discussed:                   # array of objects
  - name: "Full Case Name"
    citation: "670 F.3d 1244 (D.C. Cir. 2011)"   # optional
    court: "U.S. Court of Appeals for the ..."     # optional
court_level: ["Supreme Court"]     # string[]
circuits: ["Fourth Circuit"]       # string[]
states: ["Virginia"]               # string[]
federal: true                      # boolean
legal_topics: ["second-amendment"] # string[] (kebab-case)
case_status: ["pending"]           # string[]
content_type: ["news-analysis"]    # string[]
tags: ["AR-15"]                    # string[]
pull_quote: "..."                  # REQUIRED — Mark's 1–2 sentence first-person thesis
image_prompt: "..."                # REQUIRED — see Image Prompt Guidelines
---
```
`youtube_url`/`youtube_id`/`duration` may be empty strings (placeholder articles). All other fields stay populated.

---

## The Article Pipeline (for "pull N videos")
1. **Fetch video IDs** from the YouTube channel; filter out videos that already have an article.
2. **Get metadata** (date, title, duration) for each new video. **Use yt-dlp `upload_date` AS-IS** (any year 2021–2026 — never today's date, never the decision date).
3. **Download + clean transcripts** (yt-dlp VTT → plain text; see command above).
4. **Proper-noun research** (parallel Sonnet agents): extract proper nouns from the transcript, web-search correct spelling/styling/citations, output a reference sheet. *YouTube auto-captions mangle case names and quotes* (e.g., VanDerStok → "Vandertok"; "safe defense" → "self-defense"). Verify justice/judge biographical timelines too (catches time-travel errors).
5. **Article writing** (parallel Sonnet agents): **target ~800 words**. Give each agent the transcript + the proper-noun sheet + the EXACT frontmatter schema + the Published Article Format + the Hard Rules below.
6. **Voice + scope + citation + length CHECK pass** (Sonnet agent, **REQUIRED — never skip, even for one article**): grep the body for third-person Mark/host/video references; verify every named case/person/bill/topic is in the transcript OR is verified factual context tied to a transcript mention; verify every cited justice/judge against the research sheet; **count body words and FAIL if ≥ 1,000**. Report line-referenced flags; do NOT silently edit. The main thread fixes flags before image generation.
7. **Fact-check pass** (parallel Sonnet agents): verify citations, holdings, dates. Do NOT touch editorial opinions/hyperbole.
8. **Agents must NOT generate images** — they only write markdown with an `image_prompt`.
9. **Frontmatter validation/build pass** before building.
10. **Generate images centrally** via `scripts/generate-article-images.mjs`.
11. **Build, verify, commit, push** (from this repo).

---

## Published Article Format (mirror Mark's X-published style)
### Title
Punchy, declarative, names the case/event/policy up front. May use an em-dash subtitle. May start with "Breaking:". ALL CAPS acceptable for big news.

### Pull quote (REQUIRED — frontmatter `pull_quote` only)
A 1–2 sentence thesis in Mark's first-person voice. The site renders it as a styled "Mark's Hot Take" callout (with a Share-on-X button) at the top of the page. **Do NOT also put a Mark-attributed opening blockquote at the top of the body** — that creates a visible duplicate. The body begins directly with the lede.

### Lede paragraph
Opens with the news + immediate stakes + names the case in the first paragraph.

### H2 subheadings (3–5 sections)
Descriptive and catchy; ~150–300 words each. The final section often trails into a strong closing paragraph.

### Block quotes for opinions
When citing a justice/dissent/concurrence or any OUTSIDE source: NAME the source ("Justice Alito wrote", "St. George Tucker wrote"), block-quote verbatim, include reporter citations inline where natural (e.g., `Heller v. DC, 670 F.3d 1244 (D.C. Cir. 2011)`). Block quotes for non-Mark speakers are expected and encouraged.

### Closing footer (REQUIRED — exact format, after the body's closing `---`)
```markdown
*This article is based on analysis by Professor Mark W. Smith, constitutional attorney and Host of the Four Boxes Diner 2nd Amendment channel. Watch the original video [here](https://www.youtube.com/watch?v=VID). This does not constitute legal advice.*
```

---

## Hard Rules (the check pass enforces these)

### Voice — first person (NON-NEGOTIABLE)
Articles are published under Mark's byline and MUST read as **his own first-person writing**. The body NEVER refers to Mark in third person. **Forbidden in the body:** "Mark says/argues/presses/writes," "Smith argues," "the host," "the speaker," "in this video," "the transcript," "he says," or any equivalent. The ONLY third-person Mark reference allowed is the attribution footer. First-person ("I argue," "my read is," "as I see it," "here's where my frustration boils over") is correct and expected. Attributing OUTSIDE sources (NYT, Fox, book authors, justices, judges) in third person is fine — this rule is only about not treating Mark as an external subject.

### Scope — transcript bounds POSITIONS, not facts
The body covers Mark's **positions** as expressed in the transcript. The transcript is the truth-source for *what Mark argues*, NOT a ceiling on admissible facts. You MAY add **verified factual context** that aligns with an in-scope mention: the author of a referenced opinion, full case captions + reporter citations, names of dissenters/concurrers, dates, vote counts, procedural details, biographical facts about a figure the transcript named. You MUST NOT add new positions, theories, or topics Mark didn't raise. Use verified context to enrich an in-scope subject — not to introduce a thematic detour.

### Length — body strictly under 1,000 words
**Target ~800 words.** The body (everything between the closing `---` of frontmatter and the `---` before the footer) MUST be **strictly under 1,000 words**. Block quotes count; the footer does not. The check pass **FAILS at ≥ 1,000**. If a draft lands at 1,000+, trim before any other step. Comfortable landing zone: 700–950. (Agents overshoot — asking for ~800 tends to produce 1,000+; instruct writers to *target* ~700–800 and then verify the count.)

### Dates
The `date` field and the filename prefix MUST equal yt-dlp's `upload_date` for the video — never today's date, never the decision date. Format `YYYY-MM-DD`. Videos span 2021–2026; use the real upload year.

### Case captions change over time
2A case captions rotate as the named government official changes (e.g., as AGs/officials turn over). Verify the current caption against SCOTUSblog / the SCOTUS or circuit docket, not a stale web result.

---

## Image Prompt Guidelines (for article subagents)
Every article needs an `image_prompt`. The generation script appends a standard suffix (no people, no text, photoreal), so the prompt should focus on SUBJECT + STYLE only.

**Make text/parchment hallucination impossible** — do NOT prompt for the Constitution, parchment, "We the People," documents with visible text, signage, or logos (every 2A article is about the Constitution, so this makes all images identical). Find a different visual angle.

**Good prompts:** one clear hero subject with environmental context (not a collage); photography direction (camera angle, lighting, lens feel); ONE mood; real material textures (marble, brass, leather, limestone); a color-palette hint. Specific to THIS article — think like an NYT photo editor assigning a shot. NO recognizable people (anonymous silhouettes/from-behind only). NO "flag against sky" / "gavel on bench" clichés. Always a REAL physical place or object a photographer could shoot.

**Rotate variety across articles:** mix interior/exterior, vary time of day (dawn/golden hour/blue hour/overcast/night), alternate warm/cool palettes, vary perspective, draw from different worlds (courthouses, gov offices, gun ranges, small-town America, legislative chambers, law libraries, streetscapes, landscapes).

Example: *"An empty mahogany executive desk in a stately government office, an American flag in the corner, late-afternoon light through venetian blinds casting striped shadows. Moody atmospheric photography, warm amber and cool shadow tones, shallow depth of field."*

---

## Placeholder articles (transcript before the video is published)
When a transcript arrives before the YouTube video is live, publish as a placeholder: set the three video-tied fields to empty strings:
```yaml
youtube_url: ""
youtube_id: ""
duration: ""
```
All other fields stay required; the thumbnail still gets generated from `image_prompt`. The UI auto-renders "Video Coming Soon" for the embed and the sidebar tile. When the video drops, backfill in one shot:
```sh
node scripts/link-video.mjs <slug-or-filename> <youtube-id>
```

**Footer-link gotcha:** `link-video.mjs` rewrites ONLY the frontmatter (`youtube_url`/`youtube_id`/`duration`) — it never touches the body. So the REQUIRED closing-footer link (`Watch the original video [here](URL)`) does NOT auto-update. For a placeholder, write that footer link to the channel `https://www.youtube.com/@TheFourBoxesDiner` (always valid), and when you backfill the video, ALSO manually edit the footer to the specific `https://www.youtube.com/watch?v=<id>` URL.

---

## Coverage audit & back-generation ("generate another N")
The site does NOT articleize every video — it tracks the recent stream plus selective back-fill. Greetings / promos / interviews (e.g. "Merry Christmas", "Gundies nomination", "Fox interviews Mark Smith") are intentionally skipped; only substantive 2A / legal / political-commentary videos get articles.

**To audit (find videos with no PUBLISHED article) — reusable, never goes stale:**
```sh
# fetch a window of recent uploads, newest first, and flag any whose ID
# appears in no published article. Widen --playlist-items to look further back.
yt-dlp --flat-playlist --playlist-items 1-400 --print "%(id)s|%(title)s" \
  "https://www.youtube.com/@TheFourBoxesDiner/videos" | \
while IFS='|' read -r id title; do
  # -F = literal, -- = end options (CRITICAL: video IDs can start with "-",
  # which grep otherwise reads as flags and silently mis-reports). Glob only the
  # top-level *.md — archive/ (see below) is NOT published, so don't count it.
  grep -qF -- "$id" src/content/articles/*.md 2>/dev/null || echo "MISSING  $id  $title"
done
```
**Two gotchas this command handles (both bit a prior run):**
1. **Dash-leading IDs.** Many IDs start with `-` (e.g. `-FPIrQeWPp8`). Without `-F -- ` grep treats them as options and reports false "MISSING" — which caused a duplicate article to be generated for an already-published video. Always use `grep -qF -- "$id"`.
2. **The `archive/` folder.** `src/content/articles/archive/` holds ~275 retired drafts and is EXCLUDED from the build (the collection glob is non-recursive `*.md`, not `**/*.md`). A video can have an archived (intentionally unpublished) draft yet no published article. To tell "never processed" from "archived," also check: `grep -qF -- "$id" src/content/articles/archive/*.md`. If only an archive copy exists, it may have been set aside on purpose — confirm before re-publishing.

Then run the full Article Pipeline on the chosen IDs (`upload_date` AS-IS for the `date`/filename — these are OLD dates; see Dates rule).

**Sorting is automatic:** every listing page sorts `b.data.date.localeCompare(a.data.date)` on the `YYYY-MM-DD` string (`articles.astro`, `index.astro`, `rss.xml.ts`, `search.astro`, `circuits/`, `topics/`, `cases/`). A back-generated article with an old date slots into its correct chronological position — it will NOT jump to the top. No manual ordering anywhere.

### Back-generation bookmark (where we stopped)
*Last back-generated 2026-05-26.* The **back-generation frontier is ~position 330** in the `/videos` list (newest first): positions ~1–330 are essentially fully published (a few intentionally-skipped non-article videos); older than ~330, most videos have no published article (window 321–520 had ~176/200 missing).

On 2026-05-26 we back-generated and published **9 articles** from the frontier (dates 2025-07-01 → 2025-08-21): Reese v. ATF (18–20 handgun), Silencer Shop v. ATF / NFA, Junior Sports Magazines v. Bonta, McAllen Border Patrol shooting, Trump v. AFGE, Novak v. Federspiel, Vera Institute v. DOJ, Mackey ("Ricky Vaughn"), and the Cheeseman v. Platkin Third Circuit en-banc grant. A 10th candidate (`-FPIrQeWPp8`, ICE) turned out to be **already published** (the dash-ID grep bug above) and was dropped. Note `-X45QzRNHYE` (Cheeseman) had an *archived* prior draft that we superseded with a fresh article.

**Resume:** re-run the (fixed) audit above and take the next most-recent `MISSING` substantive videos older than the ones above.

---

## Mistakes Log / gotchas
- Article agents invent wrong frontmatter fields (`pubDate`, `videoId`, `category`). Always paste the exact schema into the agent prompt and validate with a build before committing.
- Agents write `image_prompt` but must NOT generate images themselves — images are generated centrally after all articles are written.
- Astro `<style>` is scoped by default — use `is:global` for styles targeting JS-created elements (e.g., chat messages).
- Dates: use yt-dlp `upload_date` as-is; videos can be any year 2021–2026.
- Proper nouns: always run the research pass — auto-captions mangle case names and quotes.
- Don't downgrade the search index by accident: building without `VOYAGE_API_KEY` regenerates `data/vector-index.json` as TF-IDF. That's fine *if* production is already TF-IDF (check `data/vector-index.json` `type` first); don't clobber a `voyage` index by building keyless.

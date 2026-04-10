import { writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

const MODEL = 'imagen-4.0-generate-001';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict`;

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const imagesDir = join(process.cwd(), 'public', 'images', 'articles');

const SUFFIX = `Ultra-realistic photograph, indistinguishable from a real photo taken by a professional photojournalist. NO recognizable real people — any human figures must be anonymous, generic, seen from behind or in silhouette only. Absolutely NO text, NO words, NO logos, NO watermarks, NO signs, NO lettering, NO writing, NO documents with visible text anywhere in the image.`;

const files = (await readdir(articlesDir)).filter(f => f.endsWith('.md'));
const missing = [];

for (const f of files) {
  const content = await readFile(join(articlesDir, f), 'utf-8');
  const thumbMatch = content.match(/thumbnail:\s*"([^"]+)"/);
  if (!thumbMatch) continue;
  const imgPath = thumbMatch[1].replace(/^\/images\/articles\//, '');

  // Skip YouTube thumbnail URLs
  if (imgPath.startsWith('http')) continue;

  if (!existsSync(join(imagesDir, imgPath))) {
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const promptMatch = content.match(/image_prompt:\s*"([^"]+)"/);
    if (!promptMatch) {
      console.warn(`  SKIP ${f} — no image_prompt in frontmatter`);
      continue;
    }
    missing.push({
      file: f,
      image: imgPath,
      title: titleMatch?.[1] || f,
      prompt: promptMatch[1],
    });
  }
}

console.log(`${missing.length} images to generate`);

for (let i = 0; i < missing.length; i++) {
  const item = missing[i];
  const fullPrompt = `${item.prompt}. ${SUFFIX}`;

  console.log(`[${i + 1}/${missing.length}] ${item.title}`);
  console.log(`  Prompt: ${item.prompt.slice(0, 120)}...`);

  try {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        instances: [{ prompt: fullPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          personGeneration: 'allow_adult',
        },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error(`  Error ${resp.status}: ${errBody.slice(0, 200)}`);
      continue;
    }

    const data = await resp.json();
    const prediction = data.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      console.error(`  No image data in response: ${JSON.stringify(data).slice(0, 200)}`);
      continue;
    }

    const buffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
    await writeFile(join(imagesDir, item.image), buffer);
    console.log(`  Saved (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
  }
}

console.log('Done!');

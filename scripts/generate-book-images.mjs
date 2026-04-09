import { writeFile } from 'fs/promises';
import { join } from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) {
  console.error('Set XAI_API_KEY environment variable');
  process.exit(1);
}

const books = [
  {
    slug: 'disarmed',
    coverUrl: 'https://m.media-amazon.com/images/I/71fWsXd0URL._SL1500_.jpg',
    prompt: 'Take this book and place it lying flat on a polished dark walnut desk. Behind it, show a slightly blurred background with a map of Eastern Europe and warm moody lighting. Professional editorial book photography, dramatic side lighting, shallow depth of field. Landscape 16:9 composition.',
  },
  {
    slug: 'israel-disarmed',
    coverUrl: 'https://m.media-amazon.com/images/I/71KqGz7CURL._SL1500_.jpg',
    prompt: 'Take this book and place it lying at an angle on a dark leather desk surface. Behind it, show a softly blurred Israeli flag and memorial candles. Professional editorial book photography, warm dramatic lighting from the left, shallow depth of field. Landscape 16:9 composition.',
  },
  {
    slug: 'first-they-came-for-the-gun-owners',
    coverUrl: 'https://m.media-amazon.com/images/I/71Yr3fZkURL._SL1500_.jpg',
    prompt: 'Take this book and place it on a dark mahogany desk with an American flag draped nearby. Professional editorial book photography, dramatic warm side lighting, shallow depth of field. Landscape 16:9 composition.',
  },
  {
    slug: 'duped',
    coverUrl: 'https://m.media-amazon.com/images/I/51jjxnVuURL._SL1500_.jpg',
    prompt: 'Take this book and place it on a dark wood desk with a folded newspaper and reading glasses nearby. Moody dramatic lighting, professional editorial book photography, shallow depth of field. Landscape 16:9 composition.',
  },
  {
    slug: 'disrobed',
    coverUrl: 'https://m.media-amazon.com/images/I/51TIxXNkDqL._SL1500_.jpg',
    prompt: 'Take this book and place it standing upright on a dark wood desk with leather-bound law books blurred in the background and a judges gavel nearby. Professional editorial legal book photography, warm dramatic lighting, shallow depth of field. Landscape 16:9 composition.',
  },
  {
    slug: 'official-handbook',
    coverUrl: 'https://m.media-amazon.com/images/I/51bpjr8gasL._SL1500_.jpg',
    prompt: 'Take this book and place it on a polished desk with a coffee cup and American flag pin nearby. Golden hour lighting from a window, professional editorial book photography, shallow depth of field. Landscape 16:9 composition.',
  },
];

const outDir = join(process.cwd(), 'public', 'images', 'books');

async function generateImage(book) {
  console.log(`Generating image for: ${book.slug}...`);
  try {
    const resp = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: book.prompt,
        image_url: book.coverUrl,
        n: 1,
        response_format: 'url',
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error(`  Error for ${book.slug}: ${resp.status} ${err}`);
      return;
    }

    const data = await resp.json();
    const imageUrl = data.data[0].url;

    // Download the image
    const imgResp = await fetch(imageUrl);
    const buffer = Buffer.from(await imgResp.arrayBuffer());
    const outPath = join(outDir, `${book.slug}.jpg`);
    await writeFile(outPath, buffer);
    console.log(`  Saved: ${outPath}`);
  } catch (err) {
    console.error(`  Failed for ${book.slug}:`, err.message);
  }
}

// Run sequentially to avoid rate limits
for (const book of books) {
  await generateImage(book);
}

console.log('Done!');

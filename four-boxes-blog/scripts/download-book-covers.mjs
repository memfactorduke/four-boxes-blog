import { writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const books = [
  { slug: 'disarmed', isbn: '1637589239' },
  { slug: 'israel-disarmed', isbn: '9798888455364' },
  { slug: 'first-they-came-for-the-gun-owners', isbn: '1642932019' },
  { slug: 'duped', isbn: '1642930113' },
  { slug: 'disrobed', isbn: '0307339254' },
  { slug: 'official-handbook', isbn: '0895260859' },
];

const outDir = join(process.cwd(), 'public', 'images', 'books');

for (const book of books) {
  const outPath = join(outDir, `${book.slug}.jpg`);
  const url = `https://images-na.ssl-images-amazon.com/images/P/${book.isbn}.01._SCLZZZZZZZ_SX500_.jpg`;
  console.log(`Downloading: ${book.slug}...`);
  try {
    execSync(`curl -sL -o "${outPath}" -H "User-Agent: Mozilla/5.0" "${url}"`);
    const stat = execSync(`wc -c < "${outPath}"`).toString().trim();
    console.log(`  Saved: ${(parseInt(stat) / 1024).toFixed(0)} KB`);
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
  }
}
console.log('Done!');

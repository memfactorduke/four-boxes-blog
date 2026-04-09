/**
 * Build-time script: Chunks all articles and generates Voyage AI embeddings.
 * Creates a vector index for semantic search at query time.
 *
 * Requires VOYAGE_API_KEY env var (or pass as argument).
 * Scales to thousands of articles — Voyage handles batch embedding efficiently.
 *
 * Output: data/article-chunks.json (chunk metadata)
 *         data/vector-index.json (Voyage embeddings, 512-dim)
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ARTICLES_DIR = join(process.cwd(), 'src', 'content', 'articles');
const DATA_DIR = join(process.cwd(), 'data');

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || process.argv[2] || '';
const VOYAGE_MODEL = 'voyage-3-lite'; // 512 dims, fast, good for search
const BATCH_SIZE = 20; // Voyage supports up to 128 inputs per request

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const metaRaw = match[1];
  const body = match[2];
  const meta = {};

  const titleMatch = metaRaw.match(/^title:\s*"(.+)"/m);
  if (titleMatch) meta.title = titleMatch[1];
  const dateMatch = metaRaw.match(/^date:\s*"(.+)"/m);
  if (dateMatch) meta.date = dateMatch[1];
  const urlMatch = metaRaw.match(/^youtube_url:\s*"(.+)"/m);
  if (urlMatch) meta.youtube_url = urlMatch[1];

  const topicsMatch = metaRaw.match(/legal_topics:\n((?:\s+-\s*"[^"]+"\n?)*)/);
  if (topicsMatch) {
    meta.legal_topics = [...topicsMatch[1].matchAll(/-\s*"([^"]+)"/g)].map(m => m[1]);
  }

  const casesSection = metaRaw.match(/cases_discussed:\n([\s\S]*?)(?=\n\w|\n---)/);
  if (casesSection) {
    meta.cases = [...casesSection[1].matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);
  }

  return { meta, body };
}

const CHUNK_WORDS = 150;  // Target words per chunk
const CHUNK_OVERLAP = 30; // Overlap words between chunks

function cleanMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*]\s+/gm, '- ')
    .replace(/---/g, '')
    .replace(/^#+\s*/gm, '')
    .trim();
}

function chunkArticle(filename, meta, body) {
  const chunks = [];
  const slug = filename.replace(/\.md$/, '');
  const cleanedBody = cleanMarkdown(body);
  const words = cleanedBody.split(/\s+/).filter(Boolean);

  if (words.length < 30) return chunks;

  // Also extract section headings for context
  const sections = body.split(/^## /m).filter(Boolean);
  const sectionHeadings = sections.map(s => s.trim().split('\n')[0].replace(/^#+\s*/, '').trim());

  // Sliding window chunker with overlap
  let chunkIndex = 0;
  for (let start = 0; start < words.length; start += CHUNK_WORDS - CHUNK_OVERLAP) {
    const end = Math.min(start + CHUNK_WORDS, words.length);
    const chunkWords = words.slice(start, end);
    const text = chunkWords.join(' ');

    if (text.length < 50) continue;

    // Figure out which section this chunk is roughly in
    const charPos = cleanedBody.indexOf(chunkWords.slice(0, 5).join(' '));
    let sectionName = sectionHeadings[0] || 'Introduction';
    let accumulated = 0;
    for (let i = 0; i < sections.length; i++) {
      accumulated += sections[i].length;
      if (charPos < accumulated) {
        sectionName = sectionHeadings[i] || sectionName;
        break;
      }
    }

    chunks.push({
      id: `${slug}--chunk-${chunkIndex}`,
      slug,
      title: meta.title || slug,
      date: meta.date || '',
      section: sectionName,
      text,
      youtube_url: meta.youtube_url || '',
      topics: meta.legal_topics || [],
      cases: meta.cases || [],
    });
    chunkIndex++;

    if (end >= words.length) break;
  }

  return chunks;
}

// --- Voyage AI Embedding ---

async function getEmbeddings(texts, inputType = 'document') {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Voyage API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

async function embedAllChunks(chunks) {
  const allEmbeddings = [];

  // Prepare text for embedding — combine title, section, topics, and content
  const texts = chunks.map(chunk => {
    const parts = [
      `Title: ${chunk.title}`,
      `Section: ${chunk.section}`,
      chunk.topics.length ? `Topics: ${chunk.topics.join(', ')}` : '',
      chunk.cases.length ? `Cases: ${chunk.cases.join(', ')}` : '',
      chunk.text.slice(0, 1000), // Cap text length for embedding
    ].filter(Boolean);
    return parts.join('\n');
  });

  // Batch embed
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log(`  Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} chunks)...`);
    const embeddings = await getEmbeddings(batch, 'document');
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

// --- TF-IDF Fallback (when no API key) ---

function buildTfidfVectors(chunks) {
  console.log('  No Voyage API key — using TF-IDF fallback');
  const STOP = new Set(['the','and','for','are','but','not','you','all','can','had','was','one','our','out','has','have','been','were','they','their','what','when','where','who','will','with','this','that','from','into','than','them','then','there','these','those','which','would','could','should','about','also','being','does','doing','each','even','more','most','much','must','only','other','over','same','some','such','very','just','because','through','while','before','after']);

  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  }

  const docFreq = new Map();
  const chunkTokens = chunks.map(chunk => {
    const tokens = tokenize([chunk.title, chunk.title, chunk.section, ...(chunk.topics||[]), ...(chunk.cases||[]), chunk.text].join(' '));
    new Set(tokens).forEach(t => docFreq.set(t, (docFreq.get(t) || 0) + 1));
    return tokens;
  });

  const vocab = [...docFreq.entries()].filter(([,df]) => df >= 1 && df <= chunks.length * 0.8).sort((a,b) => b[1]-a[1]).slice(0, 2000).map(([w]) => w);
  const vocabIdx = new Map(vocab.map((w,i) => [w,i]));

  return chunks.map((_, i) => {
    const tf = new Map();
    chunkTokens[i].forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
    const vec = new Array(vocab.length).fill(0);
    let mag = 0;
    for (const [w, idx] of vocabIdx) {
      const f = tf.get(w) || 0;
      if (!f) continue;
      const idf = Math.log(chunks.length / (docFreq.get(w) || 1));
      vec[idx] = f * idf;
      mag += vec[idx] ** 2;
    }
    mag = Math.sqrt(mag);
    if (mag > 0) vec.forEach((v, j) => vec[j] = Math.round((v / mag) * 10000) / 10000);
    // Convert to sparse for storage
    const sparse = {};
    vec.forEach((v, j) => { if (v) sparse[j] = v; });
    return sparse;
  });
}

// --- Book Ingestion (private content for chatbot only) ---

const BOOKS_DIR = join(process.cwd(), 'data', 'books');

async function loadBookChunks() {
  const chunks = [];
  let files;
  try {
    files = (await readdir(BOOKS_DIR)).filter(f => f.endsWith('.json'));
  } catch {
    return chunks; // No books directory yet
  }

  for (const file of files) {
    try {
      const data = JSON.parse(await readFile(join(BOOKS_DIR, file), 'utf-8'));
      // Each book JSON has: { title, amazon_url, chapters: [{ heading, text }] }
      const slug = file.replace(/\.json$/, '');
      for (const chapter of (data.chapters || [])) {
        chunks.push({
          id: `book--${slug}--${chapter.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          slug: `book--${slug}`,
          title: data.title,
          date: '',
          section: chapter.heading,
          text: chapter.text,
          youtube_url: '',
          topics: data.topics || [],
          cases: data.cases || [],
          source: 'book',
          amazon_url: data.amazon_url || '',
        });
      }
    } catch (err) {
      console.warn(`  Warning: Could not parse ${file}:`, err.message);
    }
  }

  return chunks;
}

// --- Main ---

async function main() {
  const files = (await readdir(ARTICLES_DIR)).filter(f => f.endsWith('.md'));
  const allChunks = [];

  for (const file of files) {
    const content = await readFile(join(ARTICLES_DIR, file), 'utf-8');
    const { meta, body } = parseFrontmatter(content);
    const articleChunks = chunkArticle(file, meta, body);
    // Mark article chunks with source
    articleChunks.forEach(c => c.source = 'article');
    allChunks.push(...articleChunks);
  }

  console.log(`Articles: ${allChunks.length} chunks from ${files.length} files`);

  // Load book chunks (private content)
  const bookChunks = await loadBookChunks();
  allChunks.push(...bookChunks);
  if (bookChunks.length > 0) {
    console.log(`Books: ${bookChunks.length} chunks from ${new Set(bookChunks.map(c => c.title)).size} books`);
  }

  console.log(`Total: ${allChunks.length} chunks`);

  await mkdir(DATA_DIR, { recursive: true });

  // Save chunks
  await writeFile(join(DATA_DIR, 'article-chunks.json'), JSON.stringify(allChunks, null, 2));

  // Generate embeddings
  let vectorData;
  if (VOYAGE_API_KEY) {
    console.log('Generating Voyage AI embeddings...');
    const embeddings = await embedAllChunks(allChunks);
    vectorData = { type: 'voyage', model: VOYAGE_MODEL, dims: embeddings[0]?.length || 512, vectors: embeddings };
    console.log(`Vector index: ${embeddings.length} vectors, ${vectorData.dims} dimensions`);
  } else {
    const vectors = buildTfidfVectors(allChunks);
    vectorData = { type: 'tfidf', dims: 2000, vectors };
    console.log(`TF-IDF fallback index: ${vectors.length} vectors`);
  }

  await writeFile(join(DATA_DIR, 'vector-index.json'), JSON.stringify(vectorData));
  console.log('Done!');
}

main().catch(console.error);

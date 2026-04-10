import { writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

const MODEL = 'imagen-4.0-generate-001';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict`;

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const imagesDir = join(process.cwd(), 'public', 'images', 'articles');

// NYT-caliber photography directions — each is a distinct visual language
const STYLES = [
  'Shot on medium format digital, natural window light spilling across the frame, shallow depth of field with creamy bokeh, muted earth tones, photojournalistic composition',
  'Dramatic low-angle architectural photography, deep contrast, strong geometric lines, golden hour side-lighting casting long shadows, Fuji Velvia color saturation',
  'Intimate close-up detail shot, macro lens precision, dark moody background with single directional light source, rich textures and material surfaces, editorial still life',
  'Wide establishing shot, overcast diffused daylight, desaturated color palette with one warm accent, documentary realism, environmental context visible',
  'Dusk blue-hour photography, city lights beginning to glow, cool steel-blue shadows with warm amber highlights, cinematic 2.39:1 framing energy, atmospheric haze',
  'Overhead birds-eye perspective, clean geometric composition, morning light with crisp shadows, high dynamic range, architectural digest quality',
  'Backlit silhouette composition, rim lighting creating separation, deep blacks with luminous highlights, contemplative mood, fine art documentary crossover',
  'Tight crop reportage style, candid moment frozen in motion, available light only, slight grain, Leica-like rendering with organic color science',
];

// Build an NYT-grade editorial photo prompt from article content
function buildImagePrompt(title, content, styleIndex) {
  const lower = (title + ' ' + content).toLowerCase();
  const subjects = [];

  // --- Firearms & weapons ---
  if (lower.includes('machine gun') || lower.includes('fully automatic'))
    subjects.push('a vintage military rifle displayed in a glass museum case with brass label plates, dramatic side lighting');
  else if (lower.includes('ar-15') || lower.includes('assault weapon') || lower.includes('rifle ban'))
    subjects.push('a modern sporting rifle resting on a worn leather shooting bench at an outdoor range, spent brass casings scattered nearby');
  else if (lower.includes('magazine ban') || lower.includes('magazine capacity'))
    subjects.push('neatly arranged rifle magazines and ammunition boxes on a dark walnut workbench, overhead workshop lighting');
  else if (lower.includes('pistol brace') || lower.includes('stabilizing brace'))
    subjects.push('close-up detail of a pistol stabilizing brace mechanism, machined aluminum texture, shallow depth of field');
  else if (lower.includes('concealed carry') || lower.includes('holster'))
    subjects.push('a leather inside-waistband holster on a wooden desk next to car keys and a wallet, everyday carry still life');
  else if (lower.includes('stun gun') || lower.includes('non-lethal'))
    subjects.push('personal safety devices arranged on a slate surface, clinical detail photography');
  else if (lower.includes('handgun') || lower.includes('pistol'))
    subjects.push('a handgun in a foam-lined case on a gun shop counter, glass display cases blurred in background');

  // --- Courts & legal institutions ---
  if (lower.includes('supreme court') || lower.includes('scotus'))
    subjects.push('the white marble facade of the Supreme Court of the United States, imposing Corinthian columns, late afternoon light, no people visible in foreground');
  if (lower.includes('oral argument'))
    subjects.push('the interior of a grand federal courtroom, dark mahogany bench and gallery seating, overhead pendant lights, empty and solemn');
  if (lower.includes('federal court') || lower.includes('circuit court') || lower.includes('district court'))
    subjects.push('a neoclassical federal courthouse entrance with weathered bronze doors and carved stone frieze, shot from street level');
  if ((lower.includes('judge') && lower.includes('ruling')) || lower.includes('judge benitez'))
    subjects.push('a judges wooden gavel resting on its sound block, leather-bound law volumes stacked behind, warm desk lamp glow');
  if (lower.includes('doj') || lower.includes('department of justice') || lower.includes('attorney general'))
    subjects.push('the Department of Justice building in Washington DC, Art Deco aluminum doors and limestone facade, overcast sky');

  // --- States & regions ---
  if (lower.includes('virginia'))
    subjects.push('the Virginia State Capitol in Richmond, Thomas Jefferson neoclassical design, morning mist on the grounds');
  if (lower.includes('new jersey'))
    subjects.push('the New Jersey State House gold dome in Trenton, framed by bare winter trees');
  if (lower.includes('california'))
    subjects.push('the California State Capitol rotunda exterior at dusk, palm trees flanking the walkway');
  if (lower.includes('florida'))
    subjects.push('the Florida State Capitol complex in Tallahassee, modern tower against cumulus clouds');
  if (lower.includes('hawaii'))
    subjects.push('the Hawaii State Capitol open-air architecture with volcanic cone visible in distance');
  if (lower.includes('new york') || lower.includes('times square'))
    subjects.push('lower Manhattan federal courthouse district at twilight, Art Deco buildings lit from within');
  if (lower.includes('texas'))
    subjects.push('the Texas State Capitol pink granite dome, wide-angle from the Great Walk, dramatic cloud formation');

  // --- Washington DC & federal ---
  if (lower.includes('washington') || lower.includes('d.c.') || lower.includes('capitol'))
    subjects.push('the US Capitol dome reflected in the Capitol Reflecting Pool at blue hour, perfect symmetry');
  if (lower.includes('white house') || (lower.includes('trump') && lower.includes('executive')))
    subjects.push('the North Portico of the White House through wrought-iron fence, Secret Service bollards visible, golden hour');
  else if (lower.includes('trump') || lower.includes('administration') || lower.includes('executive order'))
    subjects.push('the White House seen from the Ellipse at golden hour, American flag at full staff, no people');

  // --- Social & political topics ---
  if (lower.includes('immigration') || lower.includes('border') || lower.includes('birthright citizenship'))
    subjects.push('a sweeping desert borderland landscape at sunset, rugged terrain stretching to distant mountains, a single dusty road vanishing into the horizon');
  if (lower.includes('veteran') || lower.includes('military') || lower.includes('pentagon') || lower.includes('off-duty'))
    subjects.push('a folded American flag in a triangular display case, military service medals arranged beside it on dark velvet');
  if (lower.includes('parental rights') || lower.includes('school'))
    subjects.push('a red brick American public school building, empty playground, morning light, nostalgic small-town feel');
  if (lower.includes('election') || lower.includes('redistrict') || lower.includes('voting') || lower.includes('gerrymander'))
    subjects.push('an "I Voted" sticker on a polished wooden surface, ballot privacy booth blurred behind, civic duty atmosphere');
  if (lower.includes('post office') || lower.includes('usps') || lower.includes('postal'))
    subjects.push('a classic USPS blue collection mailbox on a tree-lined street, dappled sunlight, small-town America');
  if (lower.includes('atf') || lower.includes('bureau of alcohol'))
    subjects.push('a federal government credential wallet and stack of regulatory documents on a metal desk, fluorescent office light');

  // --- Legal scholarship & history ---
  if (lower.includes('halbrook') || lower.includes('interview') || lower.includes('scholar'))
    subjects.push('floor-to-ceiling law library shelves, leather spines with gold lettering, a reading lamp illuminating an open casebook');
  if (lower.includes('founding') || lower.includes('originalis') || lower.includes('1791') || lower.includes('historical tradition'))
    subjects.push('an aged parchment document under museum glass, warm spotlighting, visible ink texture and wax seal');
  if (lower.includes('constitution') || lower.includes('amendment'))
    subjects.push('the Constitution displayed under protective glass in the National Archives rotunda, dim reverential lighting');
  if (lower.includes('self-defense') || lower.includes('home defense'))
    subjects.push('a suburban home porch at twilight, warm interior light glowing through windows, security camera visible, quiet residential street');
  if (lower.includes('gun-free zone') || lower.includes('sensitive place'))
    subjects.push('a government building entrance with metal detectors and security checkpoint, institutional fluorescent lighting');
  if (lower.includes('3d print'))
    subjects.push('a 3D printer mid-print creating a precision mechanical component, blue LED glow, filament detail visible');
  if (lower.includes('campus carry') || lower.includes('university'))
    subjects.push('a university campus quad with collegiate gothic architecture, students walking at a distance, autumn foliage');

  // --- Fallback ---
  if (subjects.length === 0) {
    subjects.push('weathered marble steps of a government building, an American flag reflected in rain puddles, overcast Washington DC');
  }

  // Pick the two most specific matches for richer composition
  const picked = subjects.slice(-2).join('. In the foreground, ');
  const style = STYLES[styleIndex % STYLES.length];

  return `${style}. ${picked}. Ultra-realistic photograph, indistinguishable from a real photo. NO recognizable real people, no famous faces — any human figures should be anonymous, generic, seen from behind or in silhouette. Absolutely NO text, words, logos, watermarks, signs with readable text, or lettering of any kind anywhere in the image. Professional New York Times editorial photography quality.`;
}

// --- Main ---

const files = (await readdir(articlesDir)).filter(f => f.endsWith('.md'));
const missing = [];

for (const f of files) {
  const content = await readFile(join(articlesDir, f), 'utf-8');
  const thumbMatch = content.match(/thumbnail:\s*"([^"]+)"/);
  if (!thumbMatch) continue;
  const imgPath = thumbMatch[1].replace(/^\/images\/articles\//, '');
  if (!existsSync(join(imagesDir, imgPath))) {
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    missing.push({
      file: f,
      image: imgPath,
      title: titleMatch?.[1] || f,
      content: content.slice(0, 3000),
    });
  }
}

console.log(`${missing.length} images to generate`);

for (let i = 0; i < missing.length; i++) {
  const item = missing[i];
  const prompt = buildImagePrompt(item.title, item.content, i);

  console.log(`[${i + 1}/${missing.length}] Generating: ${item.image}`);
  console.log(`  Prompt: ${prompt.slice(0, 120)}...`);

  try {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
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

    // Extract base64 image from response
    const prediction = data.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      console.error(`  No image data in response: ${JSON.stringify(data).slice(0, 200)}`);
      continue;
    }

    const buffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
    const outPath = join(imagesDir, item.image);

    // Ensure .png extension since Imagen returns PNG
    await writeFile(outPath, buffer);
    console.log(`  Saved (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
  }
}

console.log('Done!');

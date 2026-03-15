-- Seed courses
INSERT INTO courses (id, title, slug, description, thumbnail_url, "order") VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Foundations of the Second Amendment',
  'foundations-second-amendment',
  'Explore the historical origins, constitutional debates, and foundational principles behind the Second Amendment. From the Founding Fathers'' intent to modern interpretations, this course covers the essential knowledge every citizen should have.',
  NULL,
  1
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Firearm Safety & Responsibility',
  'firearm-safety-responsibility',
  'A comprehensive course on safe firearm handling, storage, and responsible ownership. Learn the fundamental rules of firearm safety, proper storage techniques, and how to be a responsible member of the firearms community.',
  NULL,
  2
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Understanding Federal & State Gun Laws',
  'federal-state-gun-laws',
  'Navigate the complex landscape of federal and state firearm regulations. This course breaks down key legislation, explains your rights and responsibilities, and helps you stay informed about current legal requirements.',
  NULL,
  3
);

-- Seed lessons for Course 1: Foundations of the Second Amendment
INSERT INTO lessons (course_id, title, slug, description, video_url, content, "order", duration_minutes) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The Historical Context of the Second Amendment',
  'historical-context',
  'Understand the political and social climate that led to the inclusion of the right to bear arms in the Bill of Rights.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Key Points

- The Second Amendment was ratified in 1791 as part of the Bill of Rights
- Colonial experience with British arms confiscation influenced the Founders
- The right to bear arms was seen as essential to preventing tyranny
- State constitutions already included similar provisions before the federal amendment

## Discussion Questions

1. How did the colonial experience shape the Founders'' views on armed citizenry?
2. What role did militia service play in early American society?',
  1,
  18
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Text and Structure: What Does It Actually Say?',
  'text-and-structure',
  'A close reading of the Second Amendment text, examining the militia clause, the right of the people, and what "shall not be infringed" means.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## The Full Text

> "A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed."

## Breakdown

- **Prefatory clause:** "A well regulated Militia, being necessary to the security of a free State"
- **Operative clause:** "the right of the people to keep and bear Arms, shall not be infringed"
- The relationship between these two clauses has been the subject of extensive debate',
  2,
  22
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The Federalist Papers and the Right to Bear Arms',
  'federalist-papers',
  'Explore what Hamilton, Madison, and other Founders wrote about the right to keep and bear arms in the Federalist Papers and other writings.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Key Writings

- **Federalist No. 29** (Hamilton) — On the militia and standing armies
- **Federalist No. 46** (Madison) — The advantage of being armed
- Anti-Federalist concerns about federal power over militias

## Madison''s Vision

James Madison, who drafted the Second Amendment, saw an armed populace as a check on federal overreach.',
  3,
  20
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Landmark Supreme Court Cases',
  'landmark-cases',
  'Review the most important Supreme Court decisions that have shaped Second Amendment jurisprudence, from United States v. Miller to District of Columbia v. Heller.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Major Cases

1. **United States v. Miller (1939)** — Short-barreled shotguns and the militia connection
2. **District of Columbia v. Heller (2008)** — Individual right to bear arms affirmed
3. **McDonald v. City of Chicago (2010)** — Second Amendment incorporated against states
4. **New York State Rifle & Pistol Assn. v. Bruen (2022)** — Right to carry outside the home',
  4,
  25
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The Second Amendment in Modern America',
  'modern-america',
  'How the Second Amendment applies today — current debates, evolving interpretations, and the ongoing conversation about gun rights in contemporary society.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  NULL,
  5,
  15
);

-- Seed lessons for Course 2: Firearm Safety & Responsibility
INSERT INTO lessons (course_id, title, slug, description, video_url, content, "order", duration_minutes) VALUES
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'The Four Universal Rules of Firearm Safety',
  'four-rules',
  'Learn the four fundamental rules that every firearm owner must know and follow at all times.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## The Four Rules

1. **Treat every firearm as if it is loaded** — Never assume a gun is unloaded
2. **Never point a firearm at anything you are not willing to destroy** — Always be aware of your muzzle direction
3. **Keep your finger off the trigger until ready to fire** — Index along the frame until on target
4. **Be sure of your target and what is beyond it** — Know what you are shooting at and what is behind it',
  1,
  12
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Safe Storage and Securing Your Firearms',
  'safe-storage',
  'Best practices for storing firearms securely at home, including safes, locks, and preventing unauthorized access.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Storage Options

- **Gun safes** — The gold standard for secure storage
- **Cable locks** — Basic security for individual firearms
- **Trigger locks** — Prevent the trigger from being pulled
- **Lock boxes** — Quick-access options for home defense firearms

## Key Principles

- Store firearms unloaded when not in use
- Store ammunition separately when possible
- Prevent access by children and unauthorized users',
  2,
  15
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Understanding Your Firearm: Types and Mechanisms',
  'types-and-mechanisms',
  'An overview of common firearm types — handguns, rifles, and shotguns — and how they operate.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  NULL,
  3,
  20
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Range Etiquette and Shooting Fundamentals',
  'range-etiquette',
  'What to expect at a shooting range, proper etiquette, and basic marksmanship fundamentals.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Range Rules

- Always follow range officer instructions
- Keep firearms pointed downrange at all times
- Wait for cease-fire commands before going downrange
- Clean up after yourself

## Shooting Fundamentals

- **Stance** — Stable platform is key
- **Grip** — Firm, consistent grip
- **Sight alignment** — Front sight focus
- **Trigger control** — Smooth, steady press',
  4,
  18
);

-- Seed lessons for Course 3: Understanding Federal & State Gun Laws
INSERT INTO lessons (course_id, title, slug, description, video_url, content, "order", duration_minutes) VALUES
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'The National Firearms Act (NFA) Explained',
  'nfa-explained',
  'Understand the 1934 National Firearms Act — what it regulates, how it works, and what items fall under NFA jurisdiction.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## NFA Overview

The National Firearms Act of 1934 was the first major federal firearms law. It regulates:

- **Short-barreled rifles (SBRs)** — Rifles with barrels under 16"
- **Short-barreled shotguns (SBSs)** — Shotguns with barrels under 18"
- **Machine guns** — Fully automatic firearms
- **Suppressors/Silencers** — Sound-reducing devices
- **Destructive devices** — Grenades, bombs, certain large-caliber weapons
- **Any Other Weapons (AOWs)** — A catch-all category',
  1,
  20
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'The Gun Control Act and Federal Firearms Licenses',
  'gca-and-ffl',
  'A deep dive into the Gun Control Act of 1968, the Federal Firearms License system, and how federal law governs the sale and transfer of firearms.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Key Provisions

- Established the Federal Firearms License (FFL) system
- Created categories of prohibited persons
- Regulated interstate firearms commerce
- Established the framework for background checks (later enhanced by the Brady Act)',
  2,
  22
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Background Checks and the NICS System',
  'background-checks',
  'How the National Instant Criminal Background Check System works, who must undergo a check, and what can cause a denial.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  NULL,
  3,
  16
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Concealed Carry Laws: A State-by-State Overview',
  'concealed-carry',
  'Navigate the patchwork of state concealed carry laws, from constitutional carry to may-issue jurisdictions, and understand reciprocity agreements.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Types of Carry Laws

- **Constitutional Carry** — No permit required (25+ states as of 2024)
- **Shall-Issue** — Permit granted if requirements are met
- **May-Issue** — Issuing authority has discretion
- **Reciprocity** — Which states honor your permit

## Important Considerations

- Always check local laws before carrying in another state
- Federal properties have their own rules
- Some states have duty-to-inform laws',
  4,
  24
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Staying Compliant: Practical Tips for Gun Owners',
  'staying-compliant',
  'Practical advice for ensuring you remain in compliance with all applicable federal and state firearms laws.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '## Best Practices

1. **Know your state laws** — Laws vary significantly by state
2. **Keep records** — Document purchases, sales, and transfers
3. **Transport legally** — Follow federal and state transport laws
4. **Stay informed** — Laws change; stay up to date
5. **When in doubt, consult an attorney** — Firearms law is complex',
  5,
  14
);

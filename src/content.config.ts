import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    youtube_url: z.string().url(),
    youtube_id: z.string(),
    thumbnail: z.string(),
    duration: z.string(),
    author: z.string().default("Mark W. Smith"),
    cases_discussed: z
      .array(
        z.object({
          name: z.string(),
          citation: z.string().optional(),
          court: z.string().optional(),
        }),
      )
      .default([]),
    court_level: z.array(z.string()).default([]),
    circuits: z.array(z.string()).default([]),
    states: z.array(z.string()).default([]),
    federal: z.boolean().default(false),
    legal_topics: z.array(z.string()).default([]),
    case_status: z.array(z.string()).default([]),
    content_type: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    pull_quote: z.string().optional(),
    image_prompt: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().default("Mark W. Smith"),
    cover_image: z.string(),
    amazon_url: z.string().url(),
    publish_date: z.string(),
    publisher: z.string().optional(),
    pages: z.number().optional(),
    isbn: z.string().optional(),
    summary: z.string(),
    amazon_rating: z.number().optional(),
    amazon_ratings_count: z.number().optional(),
    legal_topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { articles, books };

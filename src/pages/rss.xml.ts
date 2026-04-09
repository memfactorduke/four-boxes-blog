import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles");

  return rss({
    title: "The Four Boxes Diner®",
    description:
      "Second Amendment legal analysis by constitutional attorney Mark W. Smith",
    site: context.site!,
    items: articles
      .sort((a, b) => b.data.date.localeCompare(a.data.date))
      .map((article) => ({
        title: article.data.title,
        pubDate: new Date(article.data.date),
        link: `/articles/${article.id}`,
        description: article.data.title,
      })),
  });
}

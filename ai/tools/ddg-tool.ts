// tools/ddg-tool.ts
import { tool } from "ai";
import { z } from "zod";
import axios from "axios"; // or your preferred HTTP client
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export const duckDuckGoTool = tool({
  description: "Search DuckDuckGo for a query and return top results",
  parameters: z.object({
    query: z.string().describe("Search query"),
    maxResults: z.number().int().min(1).max(10).optional(),
  }),
  execute: async ({ query, maxResults = 5 }) => {
    const resp = await axios.post(
      "https://html.duckduckgo.com/html",
      new URLSearchParams({ q: query }),
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const $ = await import("cheerio").then((c) => c.load(resp.data));

    const results: SearchResult[] = [];

    $(".result")
      .slice(0, maxResults)
      .each((_, e) => {
        const title = $(e).find(".result__title a").text().trim();
        let link = $(e).find(".result__title a").attr("href") || "";
        if (link.startsWith("//duckduckgo.com/l/?uddg=")) {
          link = decodeURIComponent(link.split("uddg=")[1].split("&")[0]);
        }
        const snippet = $(e).find(".result__snippet").text().trim();
        results.push({ title, link, snippet });
      });

    return { results };
  },
});

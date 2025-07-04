// tools/ddg-tool.ts
import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(query: string, maxRetries = 3): Promise<string> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const resp = await axios.post(
        "https://html.duckduckgo.com/html",
        new URLSearchParams({ q: query }),
        {
          headers: { "User-Agent": "Mozilla/5.0" },
          timeout: 10000, // 10 seconds timeout
        }
      );
      return resp.data;
    } catch (err: any) {
      if (err.code === "ETIMEDOUT") {
        console.warn(`DuckDuckGo request timed out (attempt ${attempt + 1})`);
        await delay((attempt + 1) * 2000); // backoff: 2s, 4s, 6s
        attempt++;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed to fetch from DuckDuckGo after retries.");
}

export const duckDuckGoTool = tool({
  description: "Search DuckDuckGo for a query and return top results",
  parameters: z.object({
    query: z.string().describe("Search query"),
    maxResults: z.number().int().min(1).max(10).optional(),
  }),
  execute: async ({ query, maxResults = 5 }) => {
    try {
      const html = await fetchWithRetry(query);
      const $ = await import("cheerio").then((c) => c.load(html));

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
    } catch (err: any) {
      console.error("DuckDuckGo search failed:", err.message);
      return { results: [] };
    }
  },
});

// tools/fetch-page.ts
import { tool } from "ai";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

export const fetchPageTool = tool({
  description: "Scrape main text from a URL",
  parameters: z.object({
    url: z.string().describe("The webpage URL to scrape"),
  }),
  execute: async ({ url }, { abortSignal }) => {
    console.log("fetchPageTool called with URL:", url);

    const resp = await axios.get("https://r.jina.ai/"+url);
    console.log("resp", resp);

    return resp.data;
  }
});

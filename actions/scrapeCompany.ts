"use server";

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { useLogStore } from "@/store/useLog";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Gemini 2.5 Flash Preview 05-20

// const model = groq("llama-3.3-70b-versatile");
const model = google("gemini-2.5-flash-preview-05-20");

// Zod schema for structured output
const TransactionSchema = z.object({
  type: z.string().nullable(),
  amount: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  investors: z.array(z.string()).nullable().optional(),
  details: z.string().nullable().optional(),
});

const KeyPersonSchema = z.object({
  name: z.string().nullable(),
  role: z.string().nullable(),
});

const CompanyDataSchema = z.object({
  name: z.string().nullable(),
  country: z.string().nullable(),
  sector: z.string().nullable(),
  description: z.string().nullable(),
  keyPeople: z.array(KeyPersonSchema).nullable(),
  transactions: z.array(TransactionSchema).nullable().optional(),
  contact: z
    .object({
      phone: z.string().nullable(),
      email: z.string().nullable(),
      address: z.string().nullable(),
      website: z.string(),
    })
    .nullable(),
  socialMedia: z
    .object({
      facebook: z.string().nullable(),
      twitter: z.string().nullable(),
      linkedin: z.string().nullable(),
      telegram: z.string().nullable(),
    })
    .nullable(),
  services: z.array(z.string()),
  foundedYear: z.string().nullable(),
  employeeCount: z.string().nullable(),
  revenueEstimate: z.string().nullable(),
  sourceUrls: z.array(z.string()),
});

// change CompanyDataSchema to CompanyDataType and use it here

export type CompanyDataType = z.infer<typeof CompanyDataSchema>;

let qy: string;

// Helper functions
async function logStep(key: string, status: string, details?: string) {
  const time = new Date().toLocaleTimeString();
  const message = `${time} | [scrapeCompany] ${status}${
    details ? ": " + details : ""
  }`;
  console.log(message);

}

async function decodeDuckHref(href: string): Promise<string | null> {
  try {
    const url = new URL(href, "https://duckduckgo.com");
    const uddg = url.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : null;
  } catch {
    return null;
  }
}

async function searchDuck(query: string): Promise<string | null> {
  logStep(qy, "Searching DuckDuckGo", query);
  const res = await fetch(
    `https://html.duckduckgo.com/html?q=${encodeURIComponent(query)}`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );
  const $ = cheerio.load(await res.text());
  const href = $("a.result__a").first().attr("href");
  const url = href ? await decodeDuckHref(href) : null;
  logStep(qy, "Resolved URL", url || "none");
  return url;
}

async function scrapePage(url: string): Promise<string> {
  logStep(qy, "Fetching page", url);
  const res = await fetch(url);
  const $ = cheerio.load(await res.text());
  const text = $("body").text().trim().replace(/\s+/g, " ").slice(0, 6000);
  logStep(qy, "Extracted text", text.slice(0, 60) + "…");
  return text;
}

async function summarize(text: string, context: string): Promise<string> {
  logStep(qy, "Summarizing for", context);
  const { object } = await generateObject({
    model: model,
    schema: z.object({
      summary: z.string(),
    }),
    prompt: `Summarize the following ${context}:\n\n${text}`,
  });
  logStep(qy, "Summary:", object.summary.slice(0, 60) + "…");
  return object.summary;
}

export async function scrapeCompany(company: string, key: string) {
  qy = key;
  const memory: any = { urls: [] };
  for (const step of [
    { key: "description", query: company },
    { key: "funding", query: `${company} funding` },
    { key: "people", query: `${company} founder CEO` },
    { key: "contact", query: `${company} contact details site:.et` },
    { key: "social", query: `${company} facebook twitter linkedin telegram` },
    { key: "services", query: `${company} services offered` },
    { key: "overview", query: `${company} about us` },
    { key: "stats", query: `${company} employees revenue founded` },
  ]) {
    const url = await searchDuck(step.query);
    if (!url) continue;
    memory.urls.push(url);
    try {
      const txt = await scrapePage(url);
      memory[step.key] = await summarize(txt, step.key);
    } catch (error) {
      logStep(qy, `Error processing step ${step.key}`, JSON.stringify(error).slice(0, 60) + "…");
      continue;
    }
  }
  if (!memory.description) return null;

  const prompt = `
Use the following summaries and URLs to extract detailed company data for a Yellow Pages directory.

Description: ${memory.description}
Funding: ${memory.funding || ""}
People: ${memory.people || ""}
URLs: ${memory.urls.join(", ")}

Try to extract:
- Name
- Country
- Sector
- Description
- Key people (with roles)
- Contact details (phone, email, website, address if available)
- Social media accounts
- Services they provide
- Year founded
- Number of employees
- Revenue (if public)
- Transactions (if available)

Fill null for missing fields.
Return a JSON object with all this data, matching the schema.
`;

  logStep(qy, "Synthesizing final CompanyData");
  const { object: result } = await generateObject({
    model: model,
    schema: CompanyDataSchema,
    prompt: prompt,
  });

  logStep(qy, "Final object", JSON.stringify(result, null, 2));
  return result;
}

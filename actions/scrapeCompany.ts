"use server";

import { generateText, generateObject, tool, CoreMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { duckDuckGoTool } from "@/ai/tools/ddg-tool";
import { fetchPageTool } from "@/ai/tools/fetch-page";
import { z } from "zod";

// ─── Google Gemini Model ───────────────────────────────

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});
const model = google("gemini-2.5-flash-preview-05-20");

// ─── Schemas ────────────────────────────────────────────
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



export const CompanySchema = z.object({
  companyName: z.string().optional(),
  headquarters: z.string().optional(),
  website: z.string().optional(),
  shortDescription: z.string().describe("A very brief phrase summarizing the company's activity. Example: Solar mini-grid provider or E-commerce logistics startup, no more than 100 characters.").optional(),
  longDescription: z.string().describe(`A factual, professional summary of what the company does. Focus on products/services, operations, and customer types. Do not mention founding year or HQ. Avoid superlatives or vague marketing terms. must be no more than 1000 characters.`).optional(),
  numberOfEmployees: z.string().describe("Number of employees, An estimate (avoid ranges)").optional(),
  sector: z.string().describe("The broad industry category. Use the closed list provided. list: Agriculture, Finance, Healthcare, Education, Energy, Technology, Logistics, Manufacturing, Retail, Telecom, Other").optional(),
  subSector: z.string().describe("A more specific category inside the sector. Use the closed list provided.  List : Retail, Food & Beverage, Consumer Goods, Apparel & Textiles, Banking, FinTech, Insurance, Investment Management & Advisory, Healthcare Services, Medical Devices, Pharmaceuticals, HealthTech, Transportation, Aerospace & Defense, Manufacturing, Capital Goods, Automotive, Chemicals, Construction Materials, Packaging, Forestry, Agriculture, Fishing, Real Estate Development, Real Estate Management, Leisure & Hospitality, Technical Services, Business Services, Education, Logistics, Media, Technology, Telecommunications, Software, Metals & Mining, Diversified Energy, Waste Management, Renewable Energy, and Infrastructure Services ").optional(), // or replace with enum if you have a closed list
  shareholders: z.string().optional(),
  keyPeople: z
    .array(
      z.object({
        title: z.string(),
        name: z.string(),
      })
    )
    .max(3)
    .optional(),
  ownershipTransactions: z.string().optional(),
  corporateAcquisitions: z.string().optional(),
  corporateDivestiture: z.string().optional(),
  investmentStage: z
    .string().describe(" Investment stage. Use the closed list provided. List: Pre-seed,Seed,Series A,Series B,Growth,Late Stage,Buyout,Public,Other").optional(),
  tags: z.array(
      z.string().describe("Tags are a list of keywords that describe the company.  Use the closed list provided. List: B2B, B2C, Marketplace, SaaS, E-commerce, Fintech, Healthtech, Edtech, Logistics, AI, Cleantech, Subscription, Platform, Retail, Other")
    )
    .optional(),
  sources: z.array(z.string().describe("Must be a valid URL , MIN 1 and MAX 5.")).optional(),
});




export type CompanyDataType = z.infer<typeof CompanyDataSchema>;
// export type CompanyDataType = z.infer<typeof CompanySchema>;

// ─── Retry Helper ───────────────────────────────────────
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1500
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    console.warn(`Retrying due to error: ${(err as Error).message}`);
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// ─── Main Research Function ─────────────────────────────
export async function scrapeCompanyWithAI(
  companyName: string,
  log?: (message: string) => void
): Promise<CompanyDataType> {
  const system1 = `
You are a business research assistant. 
Whenever you need to find or verify facts—company history, funding rounds, leadership bios, revenue figures, social channels, services, etc.—you MUST call the search tool (duckDuckGoTool) or fetchPageTool and cite the URLs you retrieved. 
Do not hallucinate data: every data point must come from a tool call.
Organize your draft as you go, chunking by section (Description, Founding & History, Leadership, Funding, Products & Services, Financials, Social Media & Contacts, …). 
Aim for ~10,000+ words (~50 pages of detailed, tool-driven research).
`;

  const userMessage: CoreMessage = {
    role: "user",
    content: `
I’d like an exhaustive, tool-backed research dossier on “${companyName}.” 
For each section—Company Overview, Founding & Milestones, Key People, Funding & Transactions, Offerings & Services, Revenue & Financials, Contact Info, and Social Media—always use your tools to:
1. SEARCH for primary sources (official pages, news releases, filings).
2. FETCH pages to extract precise quotes or figures.
3. CITE every URL alongside the fact you present.

Begin with an outline, then iteratively expand each section, weaving in citations from your tool calls. 
`,
  };

  const researchResult = await retryWithBackoff(() =>
    generateText({
      model,
      system: system1,
      messages: [userMessage],
      tools: {
        search: duckDuckGoTool,
        fetchPage: fetchPageTool,
      },
      maxSteps: 200,
      onStepFinish({ toolCalls, toolResults, text }) {
        if (log) {
          if (toolCalls) {
            toolCalls.forEach((toolCall) => {
              if (toolCall.toolName === "search") {
                log(`Searching for ${toolCall.args.query}`);
              }
              if (toolCall.toolName === "fetchPage") {
                log(`Fetching page ${toolCall.args.url}`);
              }
            });
          }
        }

        console.log("==== Step finished ====");
        console.log("  toolCalls:", toolCalls);
        console.log(
          "  toolResults:",
          JSON.stringify(toolResults, null, 2).slice(0, 500)
        );
        console.log("  text chunk:", text.slice(0, 500));
      },
    })
  );

  const draft = researchResult.text;
  const allMessages = researchResult.response.messages;

  const summaryPrompt: CoreMessage = {
    role: "assistant",
    content: `Extract structured data about "${companyName}" from the research above. Return JSON matching the CompanyDataSchema. Include sourceUrls.`,
  };

  const extractResult = await generateObject({
    model,
    schema: CompanyDataSchema,
    messages: [...allMessages, summaryPrompt],
    mode: "auto",
  });
  const companyData = extractResult.object as CompanyDataType;
  return JSON.parse(JSON.stringify(companyData));
}



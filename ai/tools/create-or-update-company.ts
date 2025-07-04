// tools/get-all-companies.ts
import { z } from "zod";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { tool } from "ai";
import { eq } from "drizzle-orm";

type CompanyInsert = typeof companies.$inferInsert;

export const companySchema = z.object({
  companiesName: z
    .string()
    .describe("Companies Name"),

  headquaters: z
    .string()
    .describe("Headquaters"),

  website: z
    .string()
    .describe("Website"),

  short_company_description: z
    .string()
    .describe(
      'Short Company description (3-5 words): A very brief phrase summarizing the company\'s activity.\nExample: "Solar mini-grid provider" or "E-commerce logistics startup"'
    ),

  long_company_description: z
    .string()
    .describe(
      "Long Company description (100 words): A factual, professional summary of what the company does. Focus on products/services, operations, and customer types. Do not mention founding year or HQ. Avoid superlatives or vague marketing terms."
    ),

  number_of_employees: z
    .string()
    .describe("Number of employees: An estimate (avoid ranges)"),

  sector: z
    .string()
    .describe(
      "Sector: The broad industry category. Must match one of the following:\n- Consumer\n- Financial services\n- Healthcare & Sciences\n- Industrials\n- Materials\n- Primary Sector\n- Real Estate\n- Services\n- Telecom Media & Technology\n- Utilities"
    ),

  sub_sector: z
    .string()
    .describe(
      "Sub-sector: A more specific category inside the sector. Must match one of the following:\n- Retail\n- Food & Beverage\n- Consumer Goods\n- Apparel & Textiles\n- Banking\n- FinTech\n- Insurance\n- Investment Management & Advisory\n- Healthcare Services\n- Medical Devices\n- Pharmaceuticals\n- HealthTech\n- Transportation\n- Aerospace & Defense\n- Manufacturing\n- Capital Goods\n- Automotive\n- Chemicals\n- Construction Materials\n- Packaging\n- Forestry\n- Agriculture\n- Fishing\n- Real Estate Development\n- Real Estate Management\n- Leisure & Hospitality\n- Technical Services\n- Business Services\n- Education\n- Logistics\n- Media\n- Technology\n- Telecommunications\n- Software\n- Metals & Mining\n- Diversified Energy\n- Waste Management\n- Renewable Energy\n- Infrastructure Services"
    ),

  shareholders: z
    .string()
    .describe(
      "Shareholders: Look for owners of the company: investors (VC/PE), founders, family offices, government, etc. Include majority and minority if available."
    ),

  key_people: z
    .string()
    .describe("Key People (CEO, CFO…): List up to 3 top managers with title + name"),

  ownership_transactions: z
    .string()
    .describe(
      'Ownership Transactions: Any deals involving the company’s equity (investments, buyouts, exits).\nExample: “In 2022, XYZ Capital acquired a 30% stake in the company.”'
    ),

  corporate_acquisitions: z
    .string()
    .describe(
      'Corporate Acquisitions: Has the company acquired any other companies?\nExample: “Acquired local competitor ABC Tech in 2021.”'
    ),

  corporate_divestiture: z
    .string()
    .describe(
      'Corporate Divestiture: Has the company sold or spun off any business unit or subsidiary?\nExample: “Sold its telecom division to Orange Group in 2023.”'
    ),

  investment_stage: z
    .string()
    .describe(
      "Investment Stage: Must match one of the following:\n- Pre-seed\n- Seed\n- Serie A\n- Serie B\n- Serie C\n- Growth\n- Buyout\n- Mature"
    ),

  tag: z
    .string()
    .describe(
      "Tag: A few tags that help classify the business model or specifics. Must match one of the following:\n- Likely to raise\n- Likely to exist\n- Impact driven\n- Startup\n- Infrastructure\n- Non Profit\n- Large Corporation\n- Female-led"
    ),

  source_1: z
    .string()
    .describe("Source 1: URL of a reliable source (LinkedIn, news, website, etc.)"),

  source_2: z
    .string()
    .describe("Source 2"),

  source_3: z
    .string()
    .describe("Source 3"),

  source_4: z
    .string()
    .describe("Source 4"),

  source_5: z
    .string()
    .describe("Source 5"),
});


export const createOrUpdateCompanyTool = tool({
  description:
    "Create a new company entry or update an existing one based on company name. best to save or update the company information on the database.",
  parameters: companySchema,
execute: async (data) => {
  const existing = await db
    .select()
    .from(companies)
    .where(eq(companies.companiesName, data.companiesName));

    const body: CompanyInsert = {
  companiesName: data.companiesName,
  headquaters: data.headquaters,
  website: data.website,
  shortCompanyDescription: data.short_company_description,
  longCompanyDescription: data.long_company_description,
  numberOfEmployees: data.number_of_employees,
  sector: data.sector,
  subSector: data.sub_sector,
  shareholders: data.shareholders,
  keyPeople: data.key_people,
  ownershipTransactions: data.ownership_transactions,
  corporateAcquisitions: data.corporate_acquisitions,
  corporateDivestiture: data.corporate_divestiture,
  investmentStage: data.investment_stage,
  tag: data.tag,
  source1: data.source_1,
  source2: data.source_2,
  source3: data.source_3,
  source4: data.source_4,
  source5: data.source_5,
};

  if (existing.length > 0) {
    await db
      .update(companies)
      .set(data)
      .where(eq(companies.companiesName, data.companiesName));

    return { status: "updated", id: existing[0].id };
  }

const inserted = await db.insert(companies).values(body).returning();
  return { status: "created", id: inserted[0].id };
}

});
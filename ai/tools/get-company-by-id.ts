// tools/get-all-companies.ts
import { z } from "zod";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { tool } from "ai";
import { eq } from "drizzle-orm";

export const getCompanyByIdTool = tool({
  description: "Get a company by its unique ID. best to get all the information on companies",
  parameters: z.object({
    id: z.number().int().describe("The unique ID of the company"),
  }),
  execute: async ({ id }) => {
    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));
    return result[0] ?? { error: "Company not found." };
  },
});


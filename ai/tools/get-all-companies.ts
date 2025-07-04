// tools/get-all-companies.ts
import { z } from "zod";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { tool } from "ai";

export const getAllCompaniesTool = tool({
  description: "Get a list of all companies name and id  from the database. best for seeing the data to check all the companies name and get the id of the company",
  execute: get_all_companies ,
  parameters: z.object({}),
});


async function get_all_companies() {
    const result = await db.select().from(companies);
    return { companies: result };
  }
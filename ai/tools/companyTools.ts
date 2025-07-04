// lib/companyTools.ts
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllCompanies() {
  return await db.select().from(companies);
}

export async function getCompanyById(id: number) {
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id));

  return result[0] || null;
}

export async function createOrUpdateCompany(data: typeof companies.$inferInsert) {
  // Check if company exists by name
  const existing = await db
    .select()
    .from(companies)
    .where(eq(companies.companiesName, data.companiesName));

  if (existing.length > 0) {
    // Update existing
    await db
      .update(companies)
      .set(data)
      .where(eq(companies.companiesName, data.companiesName));
    return { status: "updated", id: existing[0].id };
  }

  // Create new
  const inserted = await db.insert(companies).values(data).returning();
  return { status: "created", id: inserted[0].id };
}

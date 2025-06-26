"use server";

import { db } from "@/db";
import { companiesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const CompanySchema = z.object({
  name: z.string(),
  content: z.string(),
});

interface Company {
  name: string;
  content: string;
}

export async function createCompany(company: Company) {
  const result = await db.insert(companiesTable).values(company);
  return result;
}

export async function getCompanies() {
  // only send the id and name  not the content
  const result = await db.query.companiesTable.findMany({
    columns: {
      id: true,
      name: true,
    },
  });
  return result;
}


export async function getCompanyById(id: number) {
  const result = await db.query.companiesTable.findFirst({
    where: (company, { eq }) => eq(company.id, id),
  });
  return result;
}

export async function updateCompany(id: number, company: Company) {
  const result = await db
    .update(companiesTable)
    .set(company)
    .where(eq(companiesTable.id, id));

  return result;
}

export async function deleteCompany(id: number) {
  const result = await db.delete(companiesTable).where(eq(companiesTable.id, id));
  return result;
}
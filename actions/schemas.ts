import { z } from "zod";

export const KeyPersonSchema = z.object({
  name: z.string(),
  role: z.string(),
});

export const TransactionSchema = z.object({
  type: z.string(),
  amount: z.string().optional(),
  date: z.string().optional(),
  investors: z.array(z.string()).optional(),
  details: z.string().optional(),
});

export const CompanyDataSchema = z.object({
  name: z.string(),
  country: z.string(),
  sector: z.string(),
  description: z.string(),
  keyPeople: z.array(KeyPersonSchema),
  transactions: z.array(TransactionSchema).nullable(),
  sourceUrl: z.string(),
});

import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string(),
  content: z.string(),
});

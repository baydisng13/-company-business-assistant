import { scrapeCompanyWithAI } from "@/actions/scrapeCompany";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes


export async function POST(req: Request) {
  const body = await req.json();
  const data = await scrapeCompanyWithAI(body.companyName);
  return Response.json(data);
}

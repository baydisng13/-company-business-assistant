import { scrapeCompanyWithAI } from "@/actions/scrapeCompany";



export async function POST(req: Request) {
  const body = await req.json();
  const data = await scrapeCompanyWithAI(body.companyName);
  return Response.json(data);
}

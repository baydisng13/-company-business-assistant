import { createCompany, getCompanies } from "@/actions/company-action";
import { NextResponse } from "next/server";
import { CompanySchema } from "@/lib/schemas/company";

export const dynamic = "force-dynamic"; // static by default, unless reading the request
export const runtime = "edge"; // specify the runtime to be edge



export async function GET() {
  const companies = await getCompanies();

  return NextResponse.json({ companies, message: "success" });
}

export async function POST(request: Request) {
  const { name, content } = await request.json();

  const company = { name, content };

  if (!CompanySchema.safeParse(company)) {
    return NextResponse.json(
      { message: "invalid company data" },
      { status: 400 }
    );
  }

  const result = await createCompany(company);

  return NextResponse.json({ result, message: "success" });
}

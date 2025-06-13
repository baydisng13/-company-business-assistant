import {
  deleteCompany,
  getCompanyById,
  updateCompany,
} from "@/actions/company-action";
import { NextResponse } from "next/server";
import { CompanySchema } from "../route";

export const dynamic = "force-dynamic"; // static by default, unless reading the request
export const runtime = "edge"; // specify the runtime to be edge

export async function GET(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { message: "invalid id" },
      { status: 400 }
    );
  }
  const company = await getCompanyById(id);

  return NextResponse.json({ company, message: "success" });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { message: "invalid id" },
      { status: 400 }
    );
  }

  const result = await deleteCompany(id);

  return NextResponse.json({ result, message: "success" });
}

export async function PUT(request: Request) {
  const { id, name, content } = await request.json();

  const company = { id, name, content };

  if (!CompanySchema.safeParse(company)) {
    return NextResponse.json(
      { message: "invalid company data" },
      { status: 400 }
    );
  }

  const result = await updateCompany(id, company);

  return NextResponse.json({ result, message: "success" });
}

import { getCompanies, getCompanyById } from "@/actions/company-action";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google("gemini-2.5-flash-preview-05-20");

export const maxDuration = 30;

function logStep(status: string, details?: string) {
  const time = new Date().toLocaleTimeString();
  const message = `${time} | [chat] ${status}${details ? ": " + details : ""}`;
  console.log(message);
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model,
    system: `You are a knowledgeable business assistant that helps users learn about companies. 
    You have access to company data through tools and can answer questions about:
    - What companies do (their business description)
    - Who their shareholders are
    - Their funding history
    - Who their CEO is
    
    Be conversational, helpful, and provide detailed information when available. 
    If you don't have specific information about a company, let the user know and suggest they ask about the companies you do have data for.`,
    messages,
    tools: {
      getCompanies: tool({
        description:
          "Get a list of all available companies with basic information",
        parameters: z.object({}),
        execute: async () => {
          logStep(`Ai calling getCompanies`);
          return { companies: await getCompanies() };
        },
      }),
      getCompanyById: tool({
        description:
          "Get detailed information about a specific company by its ID",
        parameters: z.object({
          identifier: z.number().describe("The company ID to search for"),
        }),
        execute: async ({ identifier }) => {
          logStep(`Ai calling getCompanyById(${identifier})`);
          let company = await getCompanyById(identifier);

          if (!company) {
            return {
              error: "Company not found",
              availableCompanies: await getCompanies(),
            };
          }

          return { company };
        },
      }),
    },
    maxSteps: 10,
  });

  return result.toDataStreamResponse();
}

import { scrapeCompanyWithAI } from "@/actions/scrapeCompany";

export async function POST(req: Request) {
  const body = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const log = (message: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message, time: new Date().toLocaleTimeString() })}\n\n`));
      };

      log(`Starting scrape for ${body.companyName}...`);

      try {
        const data = await scrapeCompanyWithAI(body.companyName, log);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ data })}\n\n`));
        controller.close();
      } catch (error) {
        log(`Error: Scrape failed for ${body.companyName}`);
        console.error(error);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

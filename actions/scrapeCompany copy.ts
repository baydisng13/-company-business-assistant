"use server"

import * as cheerio from "cheerio"

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

interface Transaction {
  type: string
  amount?: string
  date?: string
  investors?: string[]
  details?: string
}

interface KeyPerson {
  name: string
  role: string
}

export interface CompanyData {
  name: string
  country: string
  sector: string
  description: string
  keyPeople: KeyPerson[]
  transactions: Transaction[] | null
  sourceUrl: string
}

function decodeDuckDuckGoUrl(duckUrl: string): string | null {
  try {
    const url = new URL("https://duckduckgo.com" + duckUrl)
    const redirect = url.searchParams.get("uddg")
    return redirect ? decodeURIComponent(redirect) : null
  } catch {
    return null
  }
}


async function searchDuckDuckGo(query: string): Promise<string | null> {
  const res = await fetch(`https://html.duckduckgo.com/html?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  })

  const html = await res.text()
  const $ = cheerio.load(html)

  const rawHref = $("a.result__a").first().attr("href")
  if (!rawHref) return null

  const realUrl = decodeDuckDuckGoUrl(rawHref)
  return realUrl
}

async function scrapePage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
  const html = await res.text()
  const $ = cheerio.load(html)
  return $("body").text().replace(/\s+/g, " ").slice(0, 7000)
}

async function summarizeWithGroq(content: string): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `Summarize the following content:\n\n${content}`,
        },
      ],
    }),
  })

  const json = await res.json()
  return json.choices?.[0]?.message?.content || "No summary"
}

async function synthesizeCompanyData(
  companyName: string,
  description: string,
  funding: string,
  people: string,
  url: string
): Promise<CompanyData> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `
You are provided with three pieces of summarized information about the company "${companyName}":

1. Description: ${description}
2. Funding: ${funding}
3. Key People: ${people}

Create a valid TypeScript object of this interface:

export interface CompanyData {
  name: string
  country: string
  sector: string
  description: string
  keyPeople: { name: string; role: string }[]
  transactions: {
    type: string
    amount?: string
    date?: string
    investors?: string[]
    details?: string
  }[] | null
  sourceUrl: string
}

Only return the JSON.
          `,
        },
      ],
    }),
  })

  const json = await res.json()
  return {
    ...(JSON.parse(json.choices?.[0]?.message?.content || "{}") as CompanyData),
    sourceUrl: url,
  }
}

export async function scrapeCompany(company: string): Promise<CompanyData | null> {
  const steps = [
    { label: "description", query: company },
    { label: "funding", query: `${company} funding` },
    { label: "people", query: `${company} founder CEO` },
  ]

  let summaries: Record<string, string> = {}
  let firstUrl = ""

  for (let i = 0; i < steps.length; i++) {
    const { query, label } = steps[i]
    const url = await searchDuckDuckGo(query)
    if (!url) continue
    if (i === 0) firstUrl = url

    const html = await scrapePage(url)
    const summary = await summarizeWithGroq(html)
    summaries[label] = summary
  }

  if (!summaries.description) return null

  return synthesizeCompanyData(
    company,
    summaries.description,
    summaries.funding ?? "",
    summaries.people ?? "",
    firstUrl
  )
}


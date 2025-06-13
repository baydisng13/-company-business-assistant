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

interface CompanyData {
  name: string
  country: string
  sector: string
  description: string
  keyPeople: KeyPerson[]
  transactions: Transaction[] | null
  sourceUrl: string
}

interface MemoryStore {
  [companyName: string]: {
    description?: string
    funding?: string
    people?: string
    urls: string[]
  }
}

const memory: MemoryStore = {}

async function searchDuckDuckGo(query: string): Promise<string | null> {
  const res = await fetch(`https://html.duckduckgo.com/html?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  })
  const html = await res.text()
  const $ = cheerio.load(html)
  const firstLink = $("a.result__a").first().attr("href")
  return firstLink ?? null
}

async function scrapePage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
  const html = await res.text()
  const $ = cheerio.load(html)
  return $("body").text().replace(/\s+/g, " ").slice(0, 7000) // trim long content
}

async function summarizeWithGroq(content: string): Promise<string> {
  const body = {
    model: "mixtral-8x7b-32768", // Or your chosen model
    messages: [{ role: "user", content: `Summarize the following content:\n\n${content}` }],
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  return json.choices?.[0]?.message?.content || "No summary"
}

async function synthesizeCompanyData(companyName: string): Promise<CompanyData> {
  const m = memory[companyName]
  const prompt = `
You are provided with three pieces of summarized information about the company "${companyName}":

1. Description: ${m.description}
2. Funding: ${m.funding}
3. Key People: ${m.people}

Now create a TypeScript object matching this interface:

export interface Transaction {
  type: string
  amount?: string
  date?: string
  investors?: string[]
  details?: string
}

export interface KeyPerson {
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

Only return the JSON of the object.
`

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }],
    }),
  })

  const json = await res.json()
  const result = json.choices?.[0]?.message?.content
  return JSON.parse(result)
}

export async function processCompany(company: string) {
  memory[company] = { urls: [] }

  const steps = [
    { label: "main description", query: company, key: "description" },
    { label: "funding", query: `${company} funding`, key: "funding" },
    { label: "people", query: `${company} founder CEO`, key: "people" },
  ] as const

  for (const step of steps) {
    console.log(`🔍 Searching for ${step.label}...`)
    const url = await searchDuckDuckGo(step.query)
    if (!url) {
      console.warn(`❌ Could not find URL for ${step.query}`)
      continue
    }
    memory[company].urls.push(url)

    console.log(`🧠 Scraping ${url}`)
    const content = await scrapePage(url)
    console.log(`✍️ Summarizing...`)
    const summary = await summarizeWithGroq(content)
    memory[company][step.key] = summary
  }

  console.log(`🧩 Synthesizing final data...`)
  const result = await synthesizeCompanyData(company)
  console.log(`✅ Final CompanyData object:`)
  console.dir(result, { depth: null })
}

// Example usage
processCompany("Wasoko").catch(console.error)

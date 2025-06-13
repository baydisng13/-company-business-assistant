"use server"
import type { CompanyData } from "@/lib/types"
import * as cheerio from "cheerio"

export async function scrapeCompanyData(companyName: string, country?: string): Promise<CompanyData> {
  try {
    // Construct search query for DuckDuckGo
    const searchQuery = `${companyName} ${country || ""} company funding`
    const encodedQuery = encodeURIComponent(searchQuery)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`

    // Fetch search results
    console.log(`Searching for: ${searchQuery}`)
    const searchResponse = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!searchResponse.ok) {
      throw new Error(`Search request failed with status ${searchResponse.status}`)
    }

    const searchHtml = await searchResponse.text()
    const $ = cheerio.load(searchHtml)

    // Extract search results
    const searchResults: { title: string; url: string; snippet: string }[] = []

    $(".result").each((i, element) => {
      const titleElement = $(element).find(".result__title a")
      const title = titleElement.text().trim()
      const url = titleElement.attr("href")
      const snippet = $(element).find(".result__snippet").text().trim()

      if (title && url) {
        // Extract actual URL from DuckDuckGo's redirect URL
        const urlMatch = url.match(/uddg=([^&]+)/)
        const actualUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : url

        searchResults.push({
          title,
          url: actualUrl,
          snippet,
        })
      }
    })

    console.log(`Found ${searchResults.length} search results`)

    // Extract company information from search results
    const companyInfo = extractCompanyInfo(searchResults, companyName, country)

    // Add a small delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return companyInfo
  } catch (error) {
    console.error("Error scraping company data:", error)
    throw new Error("Failed to scrape company data")
  }
}

function extractCompanyInfo(
  searchResults: { title: string; url: string; snippet: string }[],
  companyName: string,
  country?: string,
): CompanyData {
  // Initialize company data with defaults
  const companyData: CompanyData = {
    name: companyName,
    country: country || extractCountryFromResults(searchResults, companyName),
    sector: extractSectorFromResults(searchResults, companyName),
    description: extractDescriptionFromResults(searchResults, companyName),
    keyPeople: extractKeyPeopleFromResults(searchResults, companyName),
    transactions: extractTransactionsFromResults(searchResults, companyName),
    sourceUrl: extractSourceUrl(searchResults, companyName),
  }

  return companyData
}

function extractCountryFromResults(
  results: { title: string; url: string; snippet: string }[],
  companyName: string,
): string {
  // Try to find country mentions in snippets
  const countryPatterns = [
    /\b(in|from|based in)\s+([A-Z][a-z]+)\b/i,
    /\b([A-Z][a-z]+)(-based)\b/i,
    /\b([A-Z][a-z]+)\s+company\b/i,
  ]

  const africanCountries = [
    "Algeria",
    "Angola",
    "Benin",
    "Botswana",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cameroon",
    "Central African Republic",
    "Chad",
    "Comoros",
    "Congo",
    "Djibouti",
    "Egypt",
    "Equatorial Guinea",
    "Eritrea",
    "Eswatini",
    "Ethiopia",
    "Gabon",
    "Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Ivory Coast",
    "Kenya",
    "Lesotho",
    "Liberia",
    "Libya",
    "Madagascar",
    "Malawi",
    "Mali",
    "Mauritania",
    "Mauritius",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Niger",
    "Nigeria",
    "Rwanda",
    "Sao Tome and Principe",
    "Senegal",
    "Seychelles",
    "Sierra Leone",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Sudan",
    "Tanzania",
    "Togo",
    "Tunisia",
    "Uganda",
    "Zambia",
    "Zimbabwe",
    "DRC",
    "Democratic Republic of Congo",
    "Republic of Congo",
    "Côte d'Ivoire",
  ]

  for (const result of results) {
    for (const pattern of countryPatterns) {
      const match = result.snippet.match(pattern)
      if (match) {
        const potentialCountry = match[2] || match[1]
        if (africanCountries.includes(potentialCountry)) {
          return potentialCountry
        }
      }
    }
  }

  // Default country if not found
  return "Unknown"
}

function extractSectorFromResults(
  results: { title: string; url: string; snippet: string }[],
  companyName: string,
): string {
  // Common sectors
  const sectors = [
    "Technology",
    "Fintech",
    "E-commerce",
    "Healthcare",
    "Agriculture",
    "Energy",
    "Manufacturing",
    "Retail",
    "Education",
    "Transportation",
    "Logistics",
    "Food",
    "Fashion",
    "Real Estate",
    "Telecommunications",
    "Media",
    "Entertainment",
    "Automotive",
    "Financial Services",
  ]

  // Look for sector mentions in snippets
  for (const result of results) {
    for (const sector of sectors) {
      if (result.snippet.includes(sector)) {
        return sector
      }
    }
  }

  // Try to extract from common patterns
  const sectorPatterns = [
    new RegExp(`${companyName}\\s+is\\s+a\\s+([a-zA-Z\\s]+)\\s+company`, "i"),
    /in the\s+([a-zA-Z\s]+)\s+sector/i,
    /([a-zA-Z\s]+)\s+startup/i,
  ]

  for (const result of results) {
    for (const pattern of sectorPatterns) {
      const match = result.snippet.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
  }

  return "Technology" // Default sector
}

function extractDescriptionFromResults(
  results: { title: string; url: string; snippet: string }[],
  companyName: string,
): string {
  // Look for descriptions in snippets
  const descriptionPatterns = [
    new RegExp(`${companyName}\\s+is\\s+([^.]+)`, "i"),
    new RegExp(`${companyName},\\s+([^.]+)`, "i"),
  ]

  for (const result of results) {
    for (const pattern of descriptionPatterns) {
      const match = result.snippet.match(pattern)
      if (match && match[1] && match[1].length > 30) {
        return match[1].trim()
      }
    }
  }

  // If no good description found, use the most relevant snippet
  if (results.length > 0) {
    // Find the snippet that mentions the company name most prominently
    const relevantResults = results.filter((r) => r.snippet.toLowerCase().includes(companyName.toLowerCase()))

    if (relevantResults.length > 0) {
      return relevantResults[0].snippet
    }

    // If no relevant snippet, use the first result
    return results[0].snippet
  }

  return `${companyName} is a company operating in Africa.`
}

function extractKeyPeopleFromResults(
  results: { title: string; url: string; snippet: string }[],
  companyName: string,
): { name: string; role: string }[] {
  const keyPeople: { name: string; role: string }[] = []

  // Common executive titles
  const titles = [
    "CEO",
    "Chief Executive Officer",
    "Founder",
    "Co-founder",
    "President",
    "Director",
    "Managing Director",
    "Chairman",
    "CFO",
    "Chief Financial Officer",
    "CTO",
    "Chief Technology Officer",
    "COO",
    "Chief Operating Officer",
  ]

  // Look for people mentions in snippets
  for (const result of results) {
    for (const title of titles) {
      const pattern = new RegExp(`([A-Z][a-z]+ [A-Z][a-z]+)\\s*,?\\s*(${title})`, "g")
      const matches = [...result.snippet.matchAll(pattern)]

      for (const match of matches) {
        if (match && match[1] && match[2]) {
          keyPeople.push({
            name: match[1].trim(),
            role: match[2].trim(),
          })
        }
      }
    }
  }

  return keyPeople
}

function extractTransactionsFromResults(
  results: { title: string; url: string; snippet: string }[],
  companyName: string,
): { type: string; amount?: string; date?: string; investors?: string[]; details?: string }[] | null {
  const transactions: { type: string; amount?: string; date?: string; investors?: string[]; details?: string }[] = []

  // Look for funding mentions in snippets
  const fundingPatterns = [
    /raised\s+(\$[0-9.]+\s*[a-zA-Z]+)/i,
    /secured\s+(\$[0-9.]+\s*[a-zA-Z]+)/i,
    /funding\s+of\s+(\$[0-9.]+\s*[a-zA-Z]+)/i,
    /investment\s+of\s+(\$[0-9.]+\s*[a-zA-Z]+)/i,
  ]

  const datePatterns = [/in\s+([A-Z][a-z]+\s+\d{4})/i, /on\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i, /(\d{4})/]

  const investorPatterns = [/from\s+([A-Za-z\s,]+)/i, /led\s+by\s+([A-Za-z\s,]+)/i]

  for (const result of results) {
    // Check for funding amount
    let amount: string | undefined
    for (const pattern of fundingPatterns) {
      const match = result.snippet.match(pattern)
      if (match && match[1]) {
        amount = match[1]
        break
      }
    }

    if (amount) {
      // We found a transaction, now extract other details
      let date: string | undefined
      for (const pattern of datePatterns) {
        const match = result.snippet.match(pattern)
        if (match && match[1]) {
          date = match[1]
          break
        }
      }

      let investorsText: string | undefined
      for (const pattern of investorPatterns) {
        const match = result.snippet.match(pattern)
        if (match && match[1]) {
          investorsText = match[1]
          break
        }
      }

      const investors = investorsText
        ? investorsText
            .split(/,|and/)
            .map((i) => i.trim())
            .filter((i) => i.length > 0)
        : undefined

      // Determine funding type
      let type = "Funding"
      if (result.snippet.toLowerCase().includes("seed")) {
        type = "Seed Funding"
      } else if (result.snippet.toLowerCase().includes("series a")) {
        type = "Series A"
      } else if (result.snippet.toLowerCase().includes("series b")) {
        type = "Series B"
      } else if (result.snippet.toLowerCase().includes("series c")) {
        type = "Series C"
      } else if (result.snippet.toLowerCase().includes("investment")) {
        type = "Investment"
      }

      transactions.push({
        type,
        amount,
        date,
        investors,
        details: result.snippet,
      })
    }
  }


  return transactions.length > 0 ? transactions : null
}

function extractSourceUrl(results: { title: string; url: string; snippet: string }[], companyName: string): string {
  // Find the most relevant source URL
  const relevantResults = results.filter(
    (r) =>
      r.title.toLowerCase().includes(companyName.toLowerCase()) ||
      r.url.toLowerCase().includes(companyName.toLowerCase()),
  )

  if (relevantResults.length > 0) {
    return relevantResults[0].url
  }

  // If no relevant URL, use the first result
  if (results.length > 0) {
    return results[0].url
  }

  // Default URL if no results
  return `https://example.com/companies/${companyName.toLowerCase().replace(/\s+/g, "-")}`
}

"use client"

import { CompanyDataType, scrapeCompany } from "@/actions/scrapeCompany"
import { CompanyData } from "@/lib/types"
import { useCompanyStore } from "@/store/useCompanyStore"
import { useState } from "react"

export default function ScrapeClient() {
  const [company, setCompany] = useState("")
  const [data, setData] = useState<CompanyDataType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScrape = async () => {
    setLoading(true)
    const result = await scrapeCompany(company)
    setData(result)
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Enter company name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <button
        onClick={handleScrape}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Scraping..." : "Scrape Company Info"}
      </button>

      {data && (
        <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

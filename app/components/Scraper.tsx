"use client"

import { createCompany } from "@/actions/company-action"
import { scrapeCompany } from "@/actions/scrapeCompany"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLogStore } from "@/store/useLog"
import { useEffect,  useState } from "react"

export default function Scraper() {
  const [company, setCompany] = useState("")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // generate log key

  const [key, setKey] = useState<string>("")
  
  const {logs, addLog } = useLogStore()


  const handleClick = async () => {
    setData(null)
    setLoading(true)
    setKey(company+"-"+Math.random().toString(36).substring(2, 15))
    console.log("key" + key)
    addLog({ message: `✏️ Starting scrape for "${company}"`, time: new Date().toLocaleTimeString() })
    const result = await scrapeCompany(company, key)
     
    if (!result) {
      addLog({ message: "❌ Scrape failed", time: new Date().toLocaleTimeString() })
      return
    }

    addLog({ message: "✅ Scrape complete", time: new Date().toLocaleTimeString() })
    createCompany({
      name: result.name?  result.name : "", 
      content: JSON.stringify(result, null , 2 )
    })
    setData(result)
    setLoading(false)
  }

  useEffect(() => {}, [logs])
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
         <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="border p-2"
          />
          <Button
            onClick={handleClick}
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "Working…" : "Scrape Company"}
          </Button>
      </div>


      <Card className="space-y-4">
        <CardContent>
          {
            logs.map((log, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="text-sm text-slate-500">
                  {log.message}
                </div>
                <div className="text-sm text-slate-500">
                  {log.time}
                </div>
              </div>
            ))
          }
        </CardContent>
      </Card>
  

      {/* <LiveLog company={key} /> */}

      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  Upload,
  Zap,
  TrendingUp,
  Database,
  Play,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Log {
  id: string
  message: string
  time: string
  type?: "info" | "success" | "error" | "warning"
  company?: string
  duration?: number
}

interface CSVColumn {
  name: string
  preview: string[]
}

interface CompanyData {
  name: string
  description?: string
  website?: string
  industry?: string
  employees?: string
  revenue?: string
  founded?: string
  location?: string
  [key: string]: any
}

interface BatchProgress {
  total: number
  completed: number
  failed: number
  current: string
  isRunning: boolean
  isPaused: boolean
}

export default function V2CompanyScraper() {
  const [activeTab, setActiveTab] = useState("single")
  const [company, setCompany] = useState("")
  const [data, setData] = useState<CompanyData[]>([])
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<Log[]>([])

  // CSV related states
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [separator, setSeparator] = useState("-")
  const [previewData, setPreviewData] = useState<string[]>([])

  // Batch processing states
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    current: "",
    isRunning: false,
    isPaused: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string, type: Log["type"] = "info", company?: string, duration?: number) => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      time: new Date().toLocaleTimeString(),
      type,
      company,
      duration,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  const handleSingleCompanySearch = async () => {
    if (!company.trim()) return

    setData([])
    setLoading(true)
    addLog(`Starting search for ${company}`, "info", company)

    try {
      const startTime = Date.now()
      const res = await fetch("/api/automation-scrape-company", {
        method: "POST",
        body: JSON.stringify({ companyName: company }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.body) {
        throw new Error("No response body")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const json = line.substring(5)
            const { message, time, data: responseData } = JSON.parse(json)

            if (responseData) {
              const duration = Date.now() - startTime
              setData([responseData])
              addLog(`Successfully scraped ${company}`, "success", company, duration)
              setLoading(false)
            } else {
              addLog(message, "info", company)
            }
          }
        }
      }
    } catch (error) {
      addLog(`Failed to scrape ${company}: ${error}`, "error", company)
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const rows = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim().replace(/"/g, "")))

      const columns: CSVColumn[] = headers.map((header, index) => ({
        name: header,
        preview: rows
          .slice(0, 3)
          .map((row) => row[index] || "")
          .filter(Boolean),
      }))

      setCsvColumns(columns)
      setCsvData(
        rows.map((row) =>
          headers.reduce((obj, header, index) => {
            obj[header] = row[index] || ""
            return obj
          }, {} as any),
        ),
      )

      addLog(`CSV file loaded: ${file.name} (${rows.length} companies)`, "success")
    }

    reader.readAsText(file)
  }

  const updatePreview = () => {
    if (selectedColumns.length === 0) {
      setPreviewData([])
      return
    }

    const preview = csvData.slice(0, 5).map((row) =>
      selectedColumns
        .map((col) => row[col])
        .filter(Boolean)
        .join(separator),
    )
    setPreviewData(preview)
  }

  useEffect(() => {
    updatePreview()
  }, [selectedColumns, separator, csvData])

const startBatchProcessing = async () => {
  if (csvData.length === 0 || selectedColumns.length === 0) return

  const companies = csvData
    .map((row) =>
      selectedColumns
        .map((col) => row[col])
        .filter(Boolean)
        .join(separator),
    )
    .filter(Boolean)

  setBatchProgress({
    total: companies.length,
    completed: 0,
    failed: 0,
    current: companies[0],
    isRunning: true,
    isPaused: false,
  })

  setData([])
  addLog(`Starting batch processing for ${companies.length} companies`, "info")

  for (let i = 0; i < companies.length; i++) {
    const companyName = companies[i]

    // Wait if paused
    if (batchProgress.isPaused) {
      await new Promise((resolve) => {
        const checkPause = () => {
          if (!batchProgress.isPaused) {
            resolve(void 0)
          } else {
            setTimeout(checkPause, 100)
          }
        }
        checkPause()
      })
    }

    // Clear logs and set current
    setLogs([])
    addLog(`Initializing ${companyName}`, "info", companyName)
    setBatchProgress((prev) => ({ ...prev, current: companyName }))

    try {
      const startTime = Date.now()
      const res = await fetch("/api/automation-scrape-company", {
        method: "POST",
        body: JSON.stringify({ companyName }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let resultData: CompanyData | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const json = line.substring(5)
            const { message, time, data: responseData } = JSON.parse(json)

            if (responseData) {
              resultData = responseData
              const duration = Date.now() - startTime
              setData((prev) => [...prev, responseData])
              addLog(`✓ ${companyName}`, "success", companyName, duration)
            } else {
              addLog(message, "info", companyName)
            }
          }
        }
      }

      if (!resultData) {
        throw new Error("No valid company data received")
      }

      setBatchProgress((prev) => ({ ...prev, completed: prev.completed + 1 }))
    } catch (error) {
      setBatchProgress((prev) => ({ ...prev, failed: prev.failed + 1 }))
      addLog(`✗ ${companyName}: ${error}`, "error", companyName)
    }

    await new Promise((r) => setTimeout(r, 2000)) // 2-second delay
  }

  setBatchProgress((prev) => ({ ...prev, isRunning: false, current: "" }))
  addLog("Batch processing completed", "success")
}


  const getLogIcon = (type?: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogBgColor = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
      case "error":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
      default:
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Company Intelligence
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Extract comprehensive company data with AI-powered scraping
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-white dark:bg-slate-900 shadow-sm">
                <TabsTrigger value="single" className="flex items-center gap-2 h-10">
                  <Search className="h-4 w-4" />
                  Single Search
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2 h-10">
                  <Database className="h-4 w-4" />
                  Batch Processing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Company Search
                    </CardTitle>
                    <CardDescription>Enter a company name to extract detailed information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="company" className="text-sm font-medium">
                        Company Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g., Apple, Google, Microsoft"
                          className="h-12 pl-12 text-lg border-2 focus:border-blue-500 transition-colors"
                          disabled={loading}
                          onKeyDown={(e) => e.key === "Enter" && handleSingleCompanySearch()}
                        />
                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                    </div>

                    <Button
                      onClick={handleSingleCompanySearch}
                      disabled={loading || !company.trim()}
                      className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Analyzing Company...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-3 h-5 w-5" />
                          Extract Company Data
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="batch" className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                        <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      CSV Upload & Processing
                    </CardTitle>
                    <CardDescription>Upload a CSV file and process multiple companies at once</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                          {csvFile ? csvFile.name : "Click to upload CSV file"}
                        </p>
                        <p className="text-sm text-slate-500">Supports CSV files with company data</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Column Selection */}
                    {csvColumns.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">Select Columns to Merge</Label>
                          <Badge variant="secondary">{csvColumns.length} columns available</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {csvColumns.map((column) => (
                            <div key={column.name} className="flex items-start space-x-3 p-4 border rounded-lg">
                              <Checkbox
                                id={column.name}
                                checked={selectedColumns.includes(column.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedColumns([...selectedColumns, column.name])
                                  } else {
                                    setSelectedColumns(selectedColumns.filter((col) => col !== column.name))
                                  }
                                }}
                              />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor={column.name} className="font-medium cursor-pointer">
                                  {column.name}
                                </Label>
                                <div className="text-xs text-slate-500 space-y-1">
                                  {column.preview.map((item, idx) => (
                                    <div key={idx} className="truncate">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedColumns.length > 0 && (
                          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Label>Separator:</Label>
                              <Select value={separator} onValueChange={setSeparator}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value=" - ">Dash (-)</SelectItem>
                                  <SelectItem value="   ">Space</SelectItem>
                                  <SelectItem value=" _ ">Underscore (_)</SelectItem>
                                  <SelectItem value=" | ">Pipe (|)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Preview (first 5 rows):</Label>
                              <div className="space-y-1">
                                {previewData.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="text-sm font-mono bg-white dark:bg-slate-900 p-2 rounded border"
                                  >
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedColumns.length > 0 && (
                          <Button
                            onClick={startBatchProcessing}
                            disabled={batchProgress.isRunning}
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          >
                            {batchProgress.isRunning ? (
                              <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Processing {batchProgress.current}...
                              </>
                            ) : (
                              <>
                                <Play className="mr-3 h-5 w-5" />
                                Start Batch Processing ({previewData.length} companies)
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Batch Progress */}
                    {batchProgress.total > 0 && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Batch Progress</h3>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              {batchProgress.completed}/{batchProgress.total}
                            </Badge>
                            {batchProgress.failed > 0 && (
                              <Badge variant="destructive">{batchProgress.failed} failed</Badge>
                            )}
                          </div>
                        </div>

                        <Progress value={(batchProgress.completed / batchProgress.total) * 100} className="h-3" />

                        {batchProgress.current && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Currently processing: <span className="font-medium">{batchProgress.current}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Results */}
            <AnimatePresence>
              {data.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Results ({data.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96 w-full">
                        <div className="space-y-4">
                          {data.map((company, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800"
                            >
                              <h3 className="font-semibold text-lg mb-2">{company.name}</h3>
                              <pre className="text-xs bg-white dark:bg-slate-900 p-3 rounded border overflow-auto">
                                {JSON.stringify(company, null, 2)}
                              </pre>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity Log Sidebar */}
          <div className="space-y-6">
            <Card className="border border-green-600 bg-black text-green-400 font-mono shadow-none">
  <CardHeader className="pb-4 border-b border-green-700">
    <CardTitle className="flex items-center justify-between text-green-500">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-green-900">
          <TrendingUp className="h-5 w-5 text-green-400" />
        </div>
        Activity Log
      </div>
      <Badge variant="outline" className="text-xs border-green-600 text-green-500">
        {logs.length} entries
      </Badge>
    </CardTitle>
  </CardHeader>
  <div>
    <ScrollArea className="h-96 w-full bg-black font-mono ">
      <AnimatePresence>
        <div className="space-y-1 px-3 py-2">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              className={`p-1 rounded-sm transition-colors duration-200 ${
                log.type === "error"
                  ? "bg-red-950"
                  : log.type === "warning"
                  ? "bg-yellow-950"
                  : "bg-green-950/50"
              }`}
            >
              <div className="flex items-start gap-2">
                
{
                    log.type === "error"
                    ? <span className="select-none text-xs text-red-400">{"> "}</span>
                    : log.type === "warning"
                    ? <span className="select-none text-xs text-yellow-400">{"~ "}</span>
                    : <span className="select-none text-xs text-white">{"> "}</span>
                }                <div className="flex-1 text-xs leading-snug whitespace-pre-wrap">
                  <span className="text-orange-300 mr-2">{logs.length-index}.</span>
                  <span className="text-orange-300 mr-2">{log.time}</span>
                  <span className="text-white ">{log.message}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </ScrollArea>
  </div>
</Card>


            {/* Stats Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Session Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{logs.filter((l) => l.type === "success").length}</div>
                      <div className="text-xs opacity-80">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{logs.filter((l) => l.type === "error").length}</div>
                      <div className="text-xs opacity-80">Failed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

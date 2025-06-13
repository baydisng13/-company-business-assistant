"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Save, AlertCircle, CheckCircle2, Globe, Building } from "lucide-react"
import type { CompanyData } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCompanyStore } from "@/lib/store"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { scrapeCompanyData } from "@/actions/scrape"
import { processCompany } from "@/actions/new"

export function WebScraper() {
  const { addCompany } = useCompanyStore()
  const [companyName, setCompanyName] = useState("")
  const [country, setCountry] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompanyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("search")
  const [editedCompany, setEditedCompany] = useState<CompanyData | null>(null)

  const handleScrape = async () => {
    if (!companyName) {
      setError("Please enter a company name")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await processCompany("Wasoko").catch(console.error)
      alert(JSON.stringify(data, ))

      // setResult(data)
      // setEditedCompany(JSON.parse(JSON.stringify(data)))
      setActiveTab("results")
    } catch (err) {
      setError("Failed to scrape data. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCompany = () => {
    if (!editedCompany) return

    addCompany(editedCompany)
    setSuccess(`${editedCompany.name} has been added to your database`)

    // Reset form after 2 seconds
    setTimeout(() => {
      setCompanyName("")
      setCountry("")
      setResult(null)
      setEditedCompany(null)
      setSuccess(null)
      setActiveTab("search")
    }, 2000)
  }

  const handleEditField = (field: string, value: any) => {
    if (!editedCompany) return
    setEditedCompany({ ...editedCompany, [field]: value })
  }

  const handleEditKeyPerson = (index: number, field: string, value: string) => {
    if (!editedCompany) return
    const updatedPeople = [...editedCompany.keyPeople]
    updatedPeople[index] = { ...updatedPeople[index], [field]: value }
    setEditedCompany({ ...editedCompany, keyPeople: updatedPeople })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Data Acquisition</CardTitle>
            <CardDescription>Search for companies and add them to your database</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <div className="px-4">
                  <TabsList className="h-10 w-full justify-start bg-transparent border-b-0 p-0">
                    <TabsTrigger
                      value="search"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                    >
                      Search
                    </TabsTrigger>
                    <TabsTrigger
                      value="results"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                      disabled={!result}
                    >
                      Results
                    </TabsTrigger>
                    <TabsTrigger
                      value="edit"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                      disabled={!editedCompany}
                    >
                      Edit & Save
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="search" className="p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-6">
                    {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Success</AlertTitle>
                        <AlertDescription className="text-green-700">{success}</AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="company"
                          placeholder="e.g., Sylndr"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country (optional)</Label>
                        <Input
                          id="country"
                          placeholder="e.g., Egypt"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleScrape}
                        disabled={isLoading || !companyName}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Search for Company Data
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="font-medium mb-2">How it works</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Our data acquisition tool searches the web for information about the company you specify. It
                        collects data from various sources including:
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                        <li>Company websites</li>
                        <li>News articles</li>
                        <li>Press releases</li>
                        <li>Investment databases</li>
                        <li>Social media profiles</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="p-6">
                {result && (
                  <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{result.name}</h2>
                        <div className="flex items-center gap-2 mt-1 text-slate-500">
                          <Globe className="h-4 w-4" />
                          {result.country}
                          <span className="mx-1">•</span>
                          <Building className="h-4 w-4" />
                          {result.sector}
                        </div>
                      </div>
                      <Button onClick={() => setActiveTab("edit")} className="bg-blue-600 hover:bg-blue-700">
                        Edit & Save
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Company Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600">{result.description}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Key People</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {result.keyPeople.map((person, index) => (
                              <div key={index} className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                                  {person.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium">{person.name}</div>
                                  <div className="text-sm text-slate-500">{person.role}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {result.transactions && result.transactions.length > 0 ? (
                            <div className="space-y-4">
                              {result.transactions.map((transaction, index) => (
                                <div key={index} className="border rounded-md p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                      {transaction.type}
                                    </Badge>
                                    {transaction.date && (
                                      <div className="text-sm text-slate-500">{transaction.date}</div>
                                    )}
                                  </div>
                                  {transaction.amount && <div className="font-bold text-lg">{transaction.amount}</div>}
                                  {transaction.investors && transaction.investors.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-sm font-medium">Investors:</div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {transaction.investors.map((investor, i) => (
                                          <Badge key={i} variant="outline" className="bg-blue-50">
                                            {investor}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {transaction.details && (
                                    <div className="mt-2 text-sm text-slate-600">{transaction.details}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6 text-slate-500">No transaction data available</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Source</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <a
                            href={result.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {result.sourceUrl}
                          </a>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="edit" className="p-6">
                {editedCompany && (
                  <div className="max-w-3xl mx-auto">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Company Name</Label>
                            <Input
                              id="edit-name"
                              value={editedCompany.name}
                              onChange={(e) => handleEditField("name", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-country">Country</Label>
                            <Input
                              id="edit-country"
                              value={editedCompany.country}
                              onChange={(e) => handleEditField("country", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-sector">Sector</Label>
                            <Input
                              id="edit-sector"
                              value={editedCompany.sector}
                              onChange={(e) => handleEditField("sector", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-source">Source URL</Label>
                            <Input
                              id="edit-source"
                              value={editedCompany.sourceUrl}
                              onChange={(e) => handleEditField("sourceUrl", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editedCompany.description}
                          onChange={(e) => handleEditField("description", e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label>Key People</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!editedCompany) return
                              setEditedCompany({
                                ...editedCompany,
                                keyPeople: [...editedCompany.keyPeople, { name: "", role: "" }],
                              })
                            }}
                          >
                            Add Person
                          </Button>
                        </div>

                        {editedCompany.keyPeople.map((person, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                            <div className="space-y-2">
                              <Label htmlFor={`person-name-${index}`}>Name</Label>
                              <Input
                                id={`person-name-${index}`}
                                value={person.name}
                                onChange={(e) => handleEditKeyPerson(index, "name", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`person-role-${index}`}>Role</Label>
                              <Input
                                id={`person-role-${index}`}
                                value={person.role}
                                onChange={(e) => handleEditKeyPerson(index, "role", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t">
                        <Button onClick={handleSaveCompany} className="bg-blue-600 hover:bg-blue-700">
                          <Save className="mr-2 h-4 w-4" />
                          Save to Database
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

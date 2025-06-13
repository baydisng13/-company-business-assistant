"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Building, Users, Briefcase, Globe, Calendar, DollarSign, TrendingUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import CompanyChart from "@/components/company-chart"
import { useCompanyStore } from "@/lib/store"

export default function CompanyDashboard() {
  const { companies, fetchCompanies, isLoading } = useCompanyStore()
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0].name)
    }
  }, [companies, selectedCompany])

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.sector.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const company = companies.find((c) => c.name === selectedCompany)

  const totalFunding = companies.reduce((total, company) => {
    if (!company.transactions) return total
    return (
      total +
      company.transactions.reduce((companyTotal, transaction) => {
        if (!transaction.amount) return companyTotal
        const amount = Number.parseFloat(transaction.amount.replace(/[^0-9.]/g, ""))
        return isNaN(amount) ? companyTotal : companyTotal + amount
      }, 0)
    )
  }, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Across {Array.from(new Set(companies.map((c) => c.country))).length} countries
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFunding.toFixed(1)}M</div>
            <p className="text-xs text-slate-500 mt-1">
              Across {companies.filter((c) => c.transactions && c.transactions.length > 0).length} companies
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Top Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">E-commerce</div>
            <p className="text-xs text-slate-500 mt-1">2 companies in this sector</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Companies</CardTitle>
            <CardDescription>Select a company to view details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search companies..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredCompanies.length > 0 ? (
                <div className="divide-y">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.name}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedCompany === company.name
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setSelectedCompany(company.name)}
                    >
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" />
                        {company.country}
                        <span className="mx-1">•</span>
                        <Briefcase className="h-3 w-3" />
                        {company.sector}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-500">No companies found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : company ? (
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{company.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Globe className="h-4 w-4 mr-1" />
                    {company.country}
                    <span className="mx-2">•</span>
                    <Briefcase className="h-4 w-4 mr-1" />
                    {company.sector}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  <a
                    href={company.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Source
                  </a>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b">
                  <div className="px-4">
                    <TabsList className="h-10 w-full justify-start bg-transparent border-b-0 p-0">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="people"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                      >
                        Key People
                      </TabsTrigger>
                      <TabsTrigger
                        value="transactions"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                      >
                        Transactions
                      </TabsTrigger>
                      <TabsTrigger
                        value="analytics"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-10 px-4"
                      >
                        Analytics
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center text-slate-900">
                        <Building className="h-4 w-4 mr-2" />
                        Business Description
                      </h3>
                      <p className="text-slate-600">{company.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <h3 className="font-medium mb-3 flex items-center text-slate-900">
                          <Users className="h-4 w-4 mr-2" />
                          Leadership
                        </h3>
                        <div className="space-y-3">
                          {company.keyPeople.map((person, index) => (
                            <div key={index} className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="ml-3">
                                <div className="font-medium text-slate-900">{person.name}</div>
                                <div className="text-sm text-slate-500">{person.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-3 flex items-center text-slate-900">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Key Metrics
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Total Funding</span>
                            <span className="font-medium">
                              {company.transactions && company.transactions.length > 0
                                ? company.transactions.reduce((total, t) => {
                                    if (!t.amount) return total
                                    const amount = Number.parseFloat(t.amount.replace(/[^0-9.]/g, ""))
                                    return isNaN(amount) ? total : total + amount
                                  }, 0)
                                : 0}
                              M
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Funding Rounds</span>
                            <span className="font-medium">
                              {company.transactions ? company.transactions.length : 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Last Funding</span>
                            <span className="font-medium">
                              {company.transactions && company.transactions.length > 0
                                ? company.transactions[0].date
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Investors</span>
                            <span className="font-medium">
                              {company.transactions && company.transactions.length > 0
                                ? Array.from(
                                    new Set(company.transactions.flatMap((t) => (t.investors ? t.investors : []))),
                                  ).length
                                : 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="people" className="p-6">
                  <div className="space-y-6">
                    <h3 className="font-medium mb-4 flex items-center text-slate-900">
                      <Users className="h-4 w-4 mr-2" />
                      Leadership Team
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {company.keyPeople.map((person, index) => (
                        <Card key={index} className="overflow-hidden">
                          <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                          <CardContent className="pt-0">
                            <div className="flex items-start -mt-8">
                              <div className="h-16 w-16 rounded-full bg-white p-1">
                                <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-medium">
                                  {person.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                              </div>
                              <div className="ml-4 pt-8">
                                <h4 className="font-medium text-lg">{person.name}</h4>
                                <p className="text-slate-500">{person.role}</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <Button variant="outline" className="w-full" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="p-6">
                  <div className="space-y-6">
                    <h3 className="font-medium mb-4 flex items-center text-slate-900">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financial Transactions
                    </h3>
                    {company.transactions && company.transactions.length > 0 ? (
                      <div className="space-y-6">
                        {company.transactions.map((transaction, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="h-2 bg-green-500"></div>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-medium text-lg">{transaction.type}</h4>
                                  <div className="flex items-center text-sm text-slate-500 mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {transaction.date}
                                  </div>
                                </div>
                                {transaction.amount && (
                                  <div className="text-xl font-bold text-green-600">{transaction.amount}</div>
                                )}
                              </div>

                              {transaction.investors && transaction.investors.length > 0 && (
                                <div className="mt-4">
                                  <div className="text-sm font-medium text-slate-900 mb-2">Investors:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {transaction.investors.map((investor, i) => (
                                      <Badge key={i} variant="outline" className="bg-blue-50">
                                        {investor}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {transaction.details && (
                                <div className="mt-4 pt-4 border-t text-slate-600 text-sm">{transaction.details}</div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          <DollarSign className="h-12 w-12 text-slate-300 mb-4" />
                          <p className="text-slate-500 text-center">No transaction data available</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="p-6">
                  <div className="space-y-6">
                    <h3 className="font-medium mb-4 flex items-center text-slate-900">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Company Analytics
                    </h3>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-medium mb-4">Funding History</h4>
                        <div className="h-[300px]">
                          <CompanyChart company={company} />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-500">Market Position</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">Top 10%</div>
                          <p className="text-xs text-slate-500 mt-1">In {company.sector} sector</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-500">Growth Potential</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">High</div>
                          <p className="text-xs text-slate-500 mt-1">Based on funding and market trends</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 shadow-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a company to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

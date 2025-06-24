"use client";

import { createCompany } from "@/actions/company-action";
import { scrapeCompanyWithAI } from "@/actions/scrapeCompany";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLogStore } from "@/store/useLog";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Log {
  message: string;
  time: string;
  type?: "info" | "success" | "error";
}

export default function Scraper() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [logs, setLogs] = useState<Log[]>([
    { message: "System initialized", time: "10:30:45", type: "info" },
    {
      message: "Ready to scrape company data",
      time: "10:30:46",
      type: "success",
    },
  ]);

  // generate log key

  const [key, setKey] = useState<string>("");

  const handleClick = async () => {
    setData(null);
    setLoading(true);
    setKey(company + "-" + Math.random().toString(36).substring(2, 15));
    console.log("key" + key);
    const initialLog = {
      message: `Starting scrape for ${company}...`,
      time: new Date().toLocaleTimeString(),
      type: "info" as const,
    };
    setLogs((prev) => [...prev, initialLog]);

    // const result = await scrapeCompanyWithAI(company);

    const res = await fetch("/api/scrape-company", {
      method: "POST",
      body: JSON.stringify({ companyName: "Safaricom" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();

    if (!result) {
      setLogs((prev) => [
        ...prev,
        {
          message: `Error: Scrape failed for ${company}`,
          time: new Date().toLocaleTimeString(),
          type: "error" as const,
        },
      ]);
      return;
    }

    setLogs((prev) => [
      ...prev,
      {
        message: `Scrape complete for ${company}`,
        time: new Date().toLocaleTimeString(),
        type: "success" as const,
      },
    ]);
    createCompany({
      name: result.name ? result.name : "",
      content: JSON.stringify(result, null, 2),
    });
    setData(result);
    setLoading(false);
  };

  useEffect(() => {}, [logs]);
  const getLogIcon = (type?: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Company Scraper</h1>
        </div>
        <p className="text-muted-foreground">
          Extract comprehensive company information and insights
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Company Search
          </CardTitle>
          <CardDescription>
            Enter a company name to extract detailed information (this process
            may take several minutes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Apple, Google, Microsoft"
                className="h-11"
                disabled={loading}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleClick}
                disabled={loading || !company.trim()}
                className="h-11 px-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Scrape Company
                  </>
                )}
              </Button>
              {loading && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setLoading(false);
                    setLogs((prev) => [
                      ...prev,
                      {
                        message: "Scraping cancelled by user",
                        time: new Date().toLocaleTimeString(),
                        type: "error" as const,
                      },
                    ]);
                  }}
                  className="h-11 px-4"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Log
            </div>
            <Badge variant="secondary">{logs.length} entries</Badge>
          </CardTitle>
          <CardDescription>
            Real-time updates from the scraping process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-3 text-sm p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  Processing in progress...
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  This may take several minutes to complete
                </p>
              </div>
            </div>
          )}
          <ScrollArea className="h-64 w-full rounded-md border p-4">
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  {getLogIcon(log.type)}
                  <div className="flex-1 space-y-1">
                    <p className="leading-none">{log.message}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {log.time}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Results Section */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Company Information
            </CardTitle>
            <CardDescription>
              Successfully extracted data for {(data as any).company}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-mono">
                      {value == null
                        ? "—"
                        : typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Raw JSON Data */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Raw JSON Data</Label>
              <ScrollArea className="h-48 w-full rounded-md border">
                <pre className="p-4 text-xs bg-muted/50">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
    {
      message: "Ready to scrape company data",
      time: "10:30:46",
      type: "success",
    },
    { message: "System initialized", time: "10:30:45", type: "info" },
  ]);

  // generate log key

  const [key, setKey] = useState<string>("");

  const handleClick = async () => {
    setData(null);
    setLoading(true);
    setLogs([]);

    const res = await fetch("/api/automation-scrape-company", {
      method: "POST",
      body: JSON.stringify({ companyName: company }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.body) {
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const json = line.substring(5);
          const { message, time, data } = JSON.parse(json);

          if (data) {
            setData(data);
            // createCompany({
            //   name: data.name ? data.name : "",
            //   content: JSON.stringify(data, null, 2),
            // });
            setLoading(false);
            setLogs((prev) => [
              {
                message: `Scrape complete for ${company}`,
                time: new Date().toLocaleTimeString(),
                type: "success" as const,
              },
              ...prev,
            ]);
          } else {
            setLogs((prev) => [{ message, time, type: "info" as const }, ...prev]);
          }
        }
      }
    }
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
    <div className=" mx-auto p-6 space-y-6">
   

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
                      {
                        message: "Scraping cancelled by user",
                        time: new Date().toLocaleTimeString(),
                        type: "error" as const,
                      },
                      ...prev,
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
              {data.name} Information
            </CardTitle>
            <CardDescription>
              {data.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

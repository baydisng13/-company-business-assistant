import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import Link from "next/link";
import CompanyAssistant from "@/components/company-assistant";
import CompanyDashboard from "@/components/company-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebScraper } from "@/components/web-scraper";
import type { Metadata } from "next";
import ScrapeClient from "@/components/ScrapeClient";
import Scraper from "./components/Scraper";
import { Card } from "@/components/ui/card";
import V2CompanyScraper from "./components/v2-scraper";

export default function Home() {
  return (
    <div>
      <div className="flex-1 h-screen ">
        <div className="w-full py-4">
          <Tabs defaultValue="assistant" className="w-full">
            <TabsList className=" bg-transparent space-x-5">
              {[
                {
                  value: "assistant",
                  label: "AI Assistant",
                },
                {
                  value: "scraper",
                  label: "Data Acquisition",
                },
              ].map((tab, index) => (
                <TabsTrigger
                  key={index}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Card>
              <TabsContent value="assistant" className="">
                <CompanyAssistant />
              </TabsContent>

              <TabsContent value="scraper" className="">
                <V2CompanyScraper />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

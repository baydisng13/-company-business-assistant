import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import Link from "next/link";
import CompanyAssistant from "@/components/company-assistant"
import CompanyDashboard from "@/components/company-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WebScraper } from "@/components/web-scraper"
import type { Metadata } from "next"
import ScrapeClient from "@/components/ScrapeClient";
import Scraper from "./components/Scraper";


export default function Home() {
  return (
    <div>
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <h1 className="text-xl font-bold">Akinia</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-600 hover:text-slate-700">
              Home
            </Link>
            <Link
              href="/companies"
              className="text-slate-600 hover:text-slate-700"
            >
              Company
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-700">
              About
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 hover:text-slate-700"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">AT</span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">African Company Intelligence</h2>
            <p className="text-slate-500">
              Discover, analyze, and track high-growth companies across the African continent
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="dashboard">Company Dashboard</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="scraper">Data Acquisition</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <CompanyDashboard />
            </TabsContent>

            <TabsContent value="assistant" className="mt-0">
              <CompanyAssistant />
            </TabsContent>

            <TabsContent value="scraper" className="mt-0">
              <Scraper />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

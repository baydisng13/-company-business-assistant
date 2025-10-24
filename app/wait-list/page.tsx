"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function WaitListPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("You've been added to the waitlist!");
      setEmail("");
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              BC
            </div>
            <h1 className="text-xl font-bold">Business Compass AI</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            Your Researcher Buddy
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8">
            Business Compass AI is your AI-powered yellow pages for businesses. Search for business details like company structure, employees, and company-related news. It can answer any question and will show market adoption, what the company does, and more.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex justify-center max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="mr-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button size="lg" type="submit">
              Join the Waitlist
            </Button>
          </form>
        </div>
      </main>
      <section className="bg-white dark:bg-gray-800 py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Pricing</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-4">
              Choose the plan that&apos;s right for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-4">
                  $0
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  <li>Search 3 companies per month</li>
                  <li>10 minutes per search</li>
                  <li>Bring your own API key</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-4">
                  $49
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  <li>Unlimited searches</li>
                  <li>Unlimited search time</li>
                  <li>Private search results</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-4">
                  Contact Us
                </p>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  <li>Custom solutions</li>
                  <li>Dedicated support</li>
                  <li>Advanced analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Business Compass AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

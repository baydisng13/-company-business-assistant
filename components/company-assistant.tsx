"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useCompanyStore } from "@/lib/store"

export default function CompanyAssistant() {
  const { companies } = useCompanyStore()
  const [error, setError] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("Chat error:", err)
      setError("There was an error connecting to the AI assistant. Please try again.")
    },
    body: {
      companies: companies,
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleClearChat = () => {
    setMessages([])
    setError(null)
  }

  const handleExampleQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as any)
  }



  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Company Intelligence Assistant</CardTitle>
            <CardDescription>Ask questions about African companies in our database</CardDescription>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearChat}>
              Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center p-8">
                <div className="max-w-md">
                  <div className="mb-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Ask detailed questions about companies, their founders, funding rounds, or business models.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      className="text-sm justify-start"
                      onClick={() => handleExampleQuestion("What does Sylndr do and who founded it?")}
                    >
                      What does Sylndr do and who founded it?
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm justify-start"
                      onClick={() =>
                        handleExampleQuestion("Compare the funding rounds of Lapaire Glasses and Moni-Shop")
                      }
                    >
                      Compare the funding rounds of Lapaire Glasses and Moni-Shop
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm justify-start"
                      onClick={() => handleExampleQuestion("Which company has raised the most money and how much?")}
                    >
                      Which company has raised the most money and how much?
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      {message.role === "user" ? (
                        <>
                          <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        </>
                      ) : (
                        <>
                          <AvatarFallback className="bg-indigo-600 text-white">AI</AvatarFallback>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-slate-200 shadow-sm"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Ask about any company in our database..."
                value={input}
                onChange={handleInputChange}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Processing</span>
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

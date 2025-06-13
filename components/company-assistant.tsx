"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { Send, Square, User, Bot, Copy, Check, MoreHorizontal, Smile, Reply, Wrench, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } = useChat({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  useEffect(() => {
    if (status === "streaming") {
      scrollToBottom()
    }

    if (status === "ready") {
     console.log("ready")
     console.log("input : ", input)
     console.log("messages : ", messages)
    }
  }, [status])




  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
    }
  }

  const handleInputChangeWithResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e)
    adjustTextareaHeight()
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " at " +
        date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      )
    }
  }

  const renderToolCall = (toolCall: any) => {
    const getToolIcon = (toolName: string) => {
      switch (toolName) {
        case 'search':
          return '🔍'
        case 'calculator':
          return '🧮'
        case 'weather':
          return '🌤️'
        case 'code_execution':
          return '💻'
        default:
          return '🔧'
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending':
          return <Loader className="w-3 h-3 animate-spin text-blue-500" />
        case 'completed':
          return <CheckCircle className="w-3 h-3 text-green-500" />
        case 'error':
          return <AlertCircle className="w-3 h-3 text-red-500" />
        default:
          return <Wrench className="w-3 h-3 text-gray-500" />
      }
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">{getToolIcon(toolCall.toolName)}</span>
          <span className="text-sm font-medium text-blue-900">
            Using {toolCall.toolName}
          </span>
          {getStatusIcon(toolCall.state)}
        </div>
        
        {toolCall.args && (
          <div className="text-xs text-blue-700 mb-2">
            <strong>Parameters:</strong> {JSON.stringify(toolCall.args, null, 2)}
          </div>
        )}
        
        {toolCall.result && (
          <div className="bg-white rounded border p-2 text-sm">
            <div className="text-xs text-gray-500 mb-1">Result:</div>
            <div className="text-gray-900">{JSON.stringify(toolCall.result, null, 2)}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
    

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900"># AI Assistant</h2>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {status === "streaming" ? "AI is working..." : ""}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">This is the beginning of your conversation</h3>
              <p className="text-gray-500 text-center max-w-md">
                Start chatting with your AI assistant. I can use various tools to help you with calculations, searches, code execution, and more.
              </p>
            </div>
          )}

          <div className="px-6 py-4">
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1]?.role !== message.role
              const messageTime = new Date()

              return (
                <div
                  key={message.id}
                  className={`group flex hover:bg-gray-50 -mx-6 px-6 py-2 ${showAvatar ? "mt-4" : "mt-1"}`}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="flex-shrink-0 w-9 mr-2">
                    {showAvatar && (
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                          message.role === "user" ? "bg-blue-600" : "bg-gray-700"
                        }`}
                      >
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline mb-1">
                        <span className="text-sm font-bold text-gray-900 mr-2">
                          {message.role === "user" ? "You" : "AI Assistant"}
                        </span>
                        <span className="text-xs text-gray-500">{formatTime(messageTime)}</span>
                      </div>
                    )}

                    <div className="text-sm leading-relaxed">
                      {message.role === "user" ? (
                        <div className="text-gray-900 whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="slack-markdown">
                          {/* Tool Calls Display */}
                          {message.toolInvocations && message.toolInvocations.length > 0 && (
                            <div className="mb-3">
                              {message.toolInvocations.map((toolCall: any, toolIndex: number) => (
                                <div key={toolIndex}>
                                  {renderToolCall(toolCall)}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Main Message Content */}
                          {message.content && (
                            <ReactMarkdown
                              components={{
                                code({ node, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "")
                                  const language = match ? match[1] : ""

                                  return  (
                                    <div className="my-3 border border-gray-200 rounded-lg overflow-hidden">
                                      {language && (
                                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                          <span className="text-xs font-medium text-gray-600 uppercase">{language}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-gray-500 hover:text-gray-700"
                                            onClick={() =>
                                              copyToClipboard(String(children).replace(/\n$/, ""), `${message.id}-code`)
                                            }
                                          >
                                            {copiedMessageId === `${message.id}-code` ? (
                                              <Check className="w-3 h-3" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                      <pre className="p-3 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                                        <code {...props}>{children}</code>
                                      </pre>
                                    </div>
                                  )
                   
                                },
                                pre({ children }) {
                                  return <>{children}</>
                                },
                                blockquote({ children }) {
                                  return (
                                    <blockquote className="border-l-4 border-gray-300 pl-3 py-1 text-gray-600 italic my-2">
                                      {children}
                                    </blockquote>
                                  )
                                },
                                h1({ children }) {
                                  return <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h1>
                                },
                                h2({ children }) {
                                  return <h2 className="text-base font-bold text-gray-900 mt-3 mb-2">{children}</h2>
                                },
                                h3({ children }) {
                                  return <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1">{children}</h3>
                                },
                                p({ children }) {
                                  return <p className="text-gray-900 leading-relaxed mb-2">{children}</p>
                                },
                                ul({ children }) {
                                  return <ul className="list-disc list-inside space-y-1 mb-2 ml-4">{children}</ul>
                                },
                                ol({ children }) {
                                  return <ol className="list-decimal list-inside space-y-1 mb-2 ml-4">{children}</ol>
                                },
                                li({ children }) {
                                  return <li className="text-gray-900">{children}</li>
                                },
                                table({ children }) {
                                  return (
                                    <div className="my-3 border border-gray-200 rounded-lg overflow-hidden">
                                      <table className="min-w-full divide-y divide-gray-200">{children}</table>
                                    </div>
                                  )
                                },
                                thead({ children }) {
                                  return <thead className="bg-gray-50">{children}</thead>
                                },
                                tbody({ children }) {
                                  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
                                },
                                th({ children }) {
                                  return (
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      {children}
                                    </th>
                                  )
                                },
                                td({ children }) {
                                  return <td className="px-3 py-2 text-sm text-gray-900">{children}</td>
                                },
                                strong({ children }) {
                                  return <strong className="font-bold text-gray-900">{children}</strong>
                                },
                                em({ children }) {
                                  return <em className="italic">{children}</em>
                                },
                                a({ children, href }) {
                                  return (
                                    <a
                                      href={href}
                                      className="text-blue-600 hover:underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {children}
                                    </a>
                                  )
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    {hoveredMessageId === message.id && message.role === "assistant" && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {(status === "submitted" || status === "streaming") && (
              <div className="flex hover:bg-gray-50 -mx-6 px-6 py-2 mt-4">
                <div className="flex-shrink-0 w-9 mr-2">
                  <div className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline mb-1">
                    <span className="text-sm font-bold text-gray-900 mr-2">AI Assistant</span>
                    <span className="text-xs text-gray-500">{formatTime(new Date())}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    {status === "streaming" && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Wrench className="w-3 h-3" />
                        <span>Using tools...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6 bg-white">
          {(status === "submitted" || status === "streaming") && (
            <div className="mb-4 flex justify-center">
              <Button
                type="button"
                onClick={() => stop()}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Square className="w-3 h-3 mr-2" />
                Stop Generation
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Textarea
                ref={textareaRef}
                name="prompt"
                value={input}
                onChange={handleInputChangeWithResize}
                disabled={status !== "ready"}
                placeholder="Message AI Assistant (I can use tools to help you!)"
                className="min-h-[44px] max-h-[120px] resize-none border-0 focus:ring-0 focus:border-0 rounded-lg px-3 py-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="text-xs text-gray-500">
                  <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
                </div>
                <Button
                  type="submit"
                  disabled={status !== "ready" || !input.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 h-8"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

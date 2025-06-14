"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import {
  Send,
  Square,
  User,
  Bot,
  Copy,
  Check,
  MoreHorizontal,
  Smile,
  Reply,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
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
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Keep focus on textarea
  useEffect(() => {
    if (status === "ready" && textareaRef.current) {
      textareaRef.current.focus()
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

  const toggleToolExpansion = (toolId: string) => {
    const newExpanded = new Set(expandedTools)
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId)
    } else {
      newExpanded.add(toolId)
    }
    setExpandedTools(newExpanded)
  }

  const renderToolCall = (toolCall: any, messageId: string, toolIndex: number) => {
    const toolId = `${messageId}-${toolIndex}`
    const isExpanded = expandedTools.has(toolId)

    const getToolIcon = (toolName: string) => {
      switch (toolName) {
        case "search":
          return { icon: "🔍", gradient: "from-blue-500 to-cyan-500" }
        case "calculator":
          return { icon: "🧮", gradient: "from-purple-500 to-pink-500" }
        case "weather":
          return { icon: "🌤️", gradient: "from-orange-500 to-yellow-500" }
        case "code_execution":
          return { icon: "💻", gradient: "from-green-500 to-emerald-500" }
        default:
          return { icon: "🔧", gradient: "from-gray-500 to-slate-500" }
      }
    }

    const getStatusIcon = (state: string) => {
      switch (state) {
        case "call":
          return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        case "result":
          return <CheckCircle2 className="w-4 h-4 text-green-500" />
        case "error":
          return <AlertTriangle className="w-4 h-4 text-red-500" />
        default:
          return <Activity className="w-4 h-4 text-gray-500" />
      }
    }

    const toolInfo = getToolIcon(toolCall.toolName)

    return (
      <div className="group/tool my-3 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition-all duration-300">
        {/* Tool Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => toggleToolExpansion(toolId)}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-r ${toolInfo.gradient} flex items-center justify-center shadow-lg`}
            >
              <span className="text-lg">{toolInfo.icon}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 capitalize">{toolCall.toolName}</span>
                {getStatusIcon(toolCall.state)}
              </div>
              <span className="text-sm text-gray-500">
                {toolCall.state === "call" ? "Executing..." : toolCall.state === "result" ? "Completed" : "Processing"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-white rounded-full border text-xs font-medium text-gray-600">
              {toolCall.state === "call" ? "Running" : "Done"}
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out max-w-4xl ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            {/* Parameters */}
            {toolCall.args && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Parameters</span>
                </div>
                <pre className="text-xs text-blue-800 font-mono bg-white rounded p-2 overflow-x-auto">
                  {JSON.stringify(toolCall.args, null, 2)}
                </pre>
              </div>
            )}

            {/* Results */}
            {toolCall.result && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Result</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-green-600 hover:text-green-700"
                    onClick={() => copyToClipboard(JSON.stringify(toolCall.result, null, 2), `${toolId}-result`)}
                  >
                    {copiedMessageId === `${toolId}-result` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <pre className="text-xs text-green-800 font-mono bg-white rounded p-2 overflow-x-auto max-h-32">
                  {JSON.stringify(toolCall.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "streaming") {
      stop()
    } else {
      handleSubmit(e)
    }
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
              {status === "streaming" ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is working...</span>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">This is the beginning of your conversation</h3>
              <p className="text-gray-500 text-center max-w-md">
                Start chatting with your AI assistant. I can use various tools to help you with calculations, searches,
                code execution, and more.
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
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-md ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : "bg-gradient-to-r from-gray-600 to-gray-700"
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
                            <div className="mb-4">
                              {message.toolInvocations.map((toolCall: any, toolIndex: number) => (
                                <div key={toolIndex}>{renderToolCall(toolCall, message.id, toolIndex)}</div>
                              ))}
                            </div>
                          )}

                          {/* Main Message Content */}
                          {message.content && (
                            <ReactMarkdown
                              components={{
                                code({ node,  className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "")
                                  const language = match ? match[1] : ""

                                  return (
                                    <div className="my-3 border border-gray-200 rounded-lg overflow-hidden">
                                      {language && (
                                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                          <span className="text-xs font-medium text-gray-600 uppercase">
                                            {language}
                                          </span>
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
                  <div className="w-9 h-9 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white shadow-md">
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
                        <Activity className="w-3 h-3 animate-pulse" />
                        <span>Processing with tools...</span>
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
          <form onSubmit={handleFormSubmit}>
            <div className="border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Textarea
                ref={textareaRef}
                name="prompt"
                value={input}
                onChange={handleInputChangeWithResize}
                disabled={false}
                placeholder="Message AI Assistant (I can use tools to help you!)"
                className="min-h-[44px] max-h-[120px] resize-none border-0 focus:ring-0 focus:border-0 rounded-lg px-3 py-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleFormSubmit(e as any)
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="text-xs text-gray-500">
                  <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
                </div>
                <Button
                  type="submit"
                  disabled={status === "streaming" ? false : !input.trim()}
                  size="sm"
                  className={`px-4 py-1.5 h-8 transition-all duration-200 ${
                    status === "streaming"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {status === "streaming" ? (
                    <>
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

"use client"
import { CompanyData } from "@/lib/types"
import { useEffect, useRef } from "react"

interface CompanyChartProps {
  company: CompanyData
}

export default function CompanyChart({ company }: CompanyChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!chartRef.current || !company.transactions) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    // Set dimensions
    const width = chartRef.current.width
    const height = chartRef.current.height
    const padding = 40

    // Sort transactions by date
    const sortedTransactions = [...company.transactions]
      .filter((t) => t.date && t.amount)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateA - dateB
      })

    if (sortedTransactions.length === 0) {
      // Draw "No data available" text
      ctx.fillStyle = "#94a3b8"
      ctx.font = "14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No funding data available", width / 2, height / 2)
      return
    }

    // Extract dates and amounts
    const dates = sortedTransactions.map((t) => t.date || "")
    const amounts = sortedTransactions.map((t) => {
      if (!t.amount) return 0
      const match = t.amount.match(/\d+(\.\d+)?/)
      return match ? Number.parseFloat(match[0]) : 0
    })

    // Calculate cumulative funding
    const cumulativeAmounts = amounts.reduce((acc, amount, i) => {
      const prev = i > 0 ? acc[i - 1] : 0
      acc.push(prev + amount)
      return acc
    }, [] as number[])

    // Find max amount for scaling
    const maxAmount = Math.max(...cumulativeAmounts)

    // Draw axes
    ctx.strokeStyle = "#cbd5e1"
    ctx.lineWidth = 1

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.strokeStyle = "#f1f5f9"
    ctx.lineWidth = 1

    // Horizontal grid lines
    const ySteps = 5
    for (let i = 0; i < ySteps; i++) {
      const y = padding + (i * (height - 2 * padding)) / ySteps
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Y-axis labels
      const value = maxAmount - (i * maxAmount) / ySteps
      ctx.fillStyle = "#64748b"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`$${value.toFixed(1)}M`, padding - 5, y + 3)
    }

    // Draw line chart
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 2
    ctx.beginPath()

    // Plot points
    for (let i = 0; i < cumulativeAmounts.length; i++) {
      const x = padding + (i * (width - 2 * padding)) / (dates.length - 1 || 1)
      const y = height - padding - (cumulativeAmounts[i] / maxAmount) * (height - 2 * padding)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Draw point
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#2563eb"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw date label
      ctx.fillStyle = "#64748b"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(dates[i], x, height - padding + 15)

      // Draw amount label
      ctx.fillStyle = "#1e40af"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`$${amounts[i].toFixed(1)}M`, x, y - 10)
    }

    // Stroke the line
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 2
    ctx.stroke()

    // Fill area under the line
    ctx.lineTo(
      padding + ((cumulativeAmounts.length - 1) * (width - 2 * padding)) / (dates.length - 1 || 1),
      height - padding,
    )
    ctx.lineTo(padding, height - padding)
    ctx.fillStyle = "rgba(37, 99, 235, 0.1)"
    ctx.fill()
  }, [company])

  return <canvas ref={chartRef} width="600" height="300" className="w-full h-full" />
}

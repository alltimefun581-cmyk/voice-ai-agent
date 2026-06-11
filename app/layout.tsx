import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voice AI Agent',
  description: 'Full-stack Voice AI Agent with Answer Engine, Tool Router, Execution Engine, Steering Controller, Current Chat Memory, and Perplexity-style UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

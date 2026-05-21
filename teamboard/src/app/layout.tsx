import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "EventJamboard — Visual Event Workspace",
  description: "A FigJam-style workspace for managing large events",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden", height: "100vh", width: "100vw" }}>
        {children}
      </body>
    </html>
  )
}

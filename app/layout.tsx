import type React from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import "./globals.css" // Ensure globals.css is imported for Tailwind styles

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };

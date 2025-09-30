import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { LayoutWrapper } from "@/components/layout-wrapper"

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata = {
  title: "FarmPro - Poultry Management System",
  description: "Professional poultry farm management and analytics platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}

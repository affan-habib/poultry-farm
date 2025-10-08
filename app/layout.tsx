import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { MainLayout } from "@/components/main-layout"
import { metadata } from "./metadata"

const geistSans = GeistSans;
const geistMono = GeistMono;

export { metadata }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}

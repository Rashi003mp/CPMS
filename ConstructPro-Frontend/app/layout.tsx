import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/lib/providers/query-provider"
import { ToastProvider } from "@/lib/providers/toast-provider"
import { AuthInitializer } from "@/components/auth/auth-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConstructPro - Construction Project Management",
  description: "Manage your construction projects efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthInitializer />
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  )
}

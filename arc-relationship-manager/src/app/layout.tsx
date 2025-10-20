import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ARC Relationship Manager',
  description: 'American Red Cross Relationship Management System',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#DC2626', // ARC Red
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}

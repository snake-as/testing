import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClaimPilot — Professional Insurance Claim Documentation',
  description:
    'Turn your insurance policy, damage details, and photos into a professional claim documentation package in minutes.',
  openGraph: {
    title: 'ClaimPilot',
    description: 'Professional insurance claim documentation in minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

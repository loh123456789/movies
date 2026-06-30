import type { Metadata } from "next"
import "./globals.css"
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: "Random Movie Generator",
  description: "рандомный фильм из моего списка",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
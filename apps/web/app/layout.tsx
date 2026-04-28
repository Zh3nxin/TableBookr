import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import { LanguageProvider } from "@/i18n/language-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "TableBookr",
  description: "Restaurant booking flow"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

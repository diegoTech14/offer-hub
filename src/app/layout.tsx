import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { ClientBackground } from "@/components/layout/ClientBackground";
import { NavigationProgress } from "@/components/ui/NavigationProgress";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OFFER-HUB",
  description:
    "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased relative min-h-screen`}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Analytics />
        <ClientBackground />
        {children}
      </body>
    </html>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Header() {
  return (
    <header className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/oh-logo.png"
              alt="Offer Hub Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-[#002333] dark:text-white font-bold text-xl">OFFER HUB</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-[#002333] dark:text-white font-medium bg-[#15949C]/10 dark:bg-[#15949C]/20 px-4 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/find-workers"
              className="text-[#002333] dark:text-gray-300 hover:text-[#15949C] dark:hover:text-[#15949C] transition-colors"
            >
              Find workers
            </Link>
            <Link
              href="/messages"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              My Chats
            </Link>
            <Link
              href="/my-account"
              className="text-[#002333] dark:text-gray-300 hover:text-[#15949C] dark:hover:text-[#15949C] transition-colors"
            >
              My Account
            </Link>
            <Link
              href="/faq"
              className="text-[#002333] dark:text-gray-300 hover:text-[#15949C] dark:hover:text-[#15949C] transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/help"
              className="text-[#002333] dark:text-gray-300 hover:text-[#15949C] dark:hover:text-[#15949C] transition-colors"
            >
              Help
            </Link>
            <Link
              href="/financial-dashboard-demo"
              className="text-[#002333] dark:text-gray-300 hover:text-[#15949C] dark:hover:text-[#15949C] transition-colors px-3 py-1 rounded-md "
            >
             Financial Dashboard
            </Link>
          </nav>
        </div>

        {/* Theme Toggle and Connect Wallet Button */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/wallet"
            className="bg-[#15949C] hover:bg-[#15949C]/90 text-white font-medium px-6 py-2.5 rounded-full transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Connect Wallet
          </Link>
        </div>
      </div>
    </header>
  );
}

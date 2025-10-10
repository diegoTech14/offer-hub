"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Settings, Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  showAuth?: boolean;
  transparent?: boolean;
  className?: string;
}

/**
 * Modern, reusable Navbar component with smooth animations
 * Features:
 * - Responsive design (mobile & desktop)
 * - Profile dropdown menu on the right
 * - Smooth animations and transitions
 * - Dark mode support
 * - Sticky on scroll with backdrop blur
 */
export default function Navbar({ 
  showAuth = true, 
  transparent = false,
  className = "" 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/find-workers", label: "Find Workers" },
    { href: "/messages", label: "My Chats" },
    { href: "/faq", label: "FAQ" },
    { href: "/help", label: "Help" },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleProfileClick = () => {
    router.push("/my-account");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add logout logic here
  };

  return (
    <header
      className={`
        sticky top-0 z-50 w-full transition-all duration-300
        ${
          transparent && !isScrolled
            ? "bg-transparent"
            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        }
        ${isScrolled ? "shadow-sm" : ""}
        ${className}
      `}
    >
      <nav className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105"
          >
            <Image
              src="/offer_hub_logo.png"
              alt="Offer Hub Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-[#002333] dark:text-white font-bold text-lg tracking-tight">
              OFFER HUB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${
                    isActiveRoute(link.href)
                      ? "text-[#15949C] dark:text-[#15949C]"
                      : "text-gray-700 dark:text-gray-300"
                  }
                  group
                `}
              >
                {link.label}
                {/* Active indicator */}
                {isActiveRoute(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#15949C] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section: Theme Toggle, Wallet, Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Connect Wallet Button */}
            <Link
              href="/wallet"
              className="
                hidden sm:flex items-center gap-2
                bg-gradient-to-r from-[#15949C] to-[#117a81]
                hover:from-[#117a81] hover:to-[#0d5f65]
                text-white font-medium
                px-4 py-2 rounded-full
                transition-all duration-200
                shadow-md hover:shadow-lg
                transform hover:scale-105
                text-sm
              "
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </Link>

            {/* Profile Dropdown */}
            {showAuth && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="
                      relative flex items-center justify-center
                      w-10 h-10 rounded-full
                      bg-gradient-to-br from-[#15949C] to-[#117a81]
                      hover:from-[#117a81] hover:to-[#0d5f65]
                      transition-all duration-200
                      ring-2 ring-gray-200 dark:ring-gray-700
                      hover:ring-[#15949C]/40
                      transform hover:scale-110
                      shadow-md hover:shadow-lg
                    "
                    aria-label="User menu"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 animate-in fade-in-0 zoom-in-95"
                >
                  <DropdownMenuLabel className="font-semibold">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="cursor-pointer gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden cursor-pointer gap-2">
                    <Wallet className="w-4 h-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="
                md:hidden p-2 rounded-lg
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-all duration-200
                transform hover:scale-105
              "
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            className="
              md:hidden py-4 border-t border-gray-200 dark:border-gray-800
              animate-in slide-in-from-top-2 fade-in-0 duration-200
            "
          >
            <div className="flex flex-col space-y-1">
              {/* Theme Toggle Mobile */}
              <div className="flex items-center justify-between px-4 py-3 mb-2 sm:hidden">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </span>
                <ThemeToggle />
              </div>

              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-3 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${
                      isActiveRoute(link.href)
                        ? "bg-[#15949C]/10 text-[#15949C] dark:bg-[#15949C]/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Wallet Button */}
              <Link
                href="/wallet"
                className="
                  flex items-center justify-center gap-2
                  bg-gradient-to-r from-[#15949C] to-[#117a81]
                  text-white font-medium
                  px-4 py-3 rounded-lg
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  mt-4 sm:hidden
                "
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}


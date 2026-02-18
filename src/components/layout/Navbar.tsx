"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    /*
     * NEUMORPHIC NAVBAR
     * ─────────────────
     * Background = #F1F3F7 (identical to the page) → the container is invisible.
     * Depth comes exclusively from the bottom-projected dual shadow (dark ↘ / light ↖).
     * Buttons share the same base color and "emerge" via their own shadows.
     */
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[500] transition-all duration-[400ms] ease-out",
        isScrolled ? "shadow-nav-scrolled" : "shadow-nav"
      )}
      style={{ background: "#F1F3F7" }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/OFFER-HUB-logo.png"
              alt="OFFER-HUB"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </a>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium",
                  "transition-all duration-[400ms] ease-out",
                  "hover:shadow-raised-sm"
                )}
                style={{ color: "#6D758F", background: "#F1F3F7" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "#19213D")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "#6D758F")
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ── Desktop CTAs ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sign In — neumorphic raised on same background */}
            <a
              href="/login"
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle"
              style={{ color: "#19213D", background: "#F1F3F7" }}
            >
              Sign In
            </a>

            {/* Get Started — primary teal, raised */}
            <a
              href="/register"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle"
              style={{ background: "#149A9B" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "#0d7377")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "#149A9B")
              }
            >
              Get Started
            </a>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle"
            style={{ background: "#F1F3F7", color: "#19213D" }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {isMenuOpen && (
          <div
            className="md:hidden py-4 flex flex-col gap-1 animate-fadeInUp border-t"
            style={{ borderColor: "#d1d5db" }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-[400ms] ease-out hover:shadow-raised-sm"
                style={{ color: "#6D758F", background: "#F1F3F7" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div
              className="flex flex-col gap-3 pt-4 mt-2 border-t"
              style={{ borderColor: "#d1d5db" }}
            >
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-center transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover"
                style={{ color: "#19213D", background: "#F1F3F7" }}
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover"
                style={{ background: "#149A9B" }}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

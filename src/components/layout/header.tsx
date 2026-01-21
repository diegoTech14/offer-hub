"use client";

import Navbar from "./navbar";

/**
 * Header component - wrapper for the new modern Navbar
 * This maintains backward compatibility with existing pages
 */
export default function Header() {
  return <Navbar showAuth={true} />;
}
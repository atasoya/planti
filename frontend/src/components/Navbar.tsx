"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, LogOut, Home, Code } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log("Attempting logout...");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        const data = await response.json();
        console.error("Logout failed:", data.error || "Unknown error");
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Network error during logout:", error);
      toast.error(
        "An error occurred during logout. Please check your connection."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-planti-green-800 text-white shadow-md rounded-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold">🪴 Planti</span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md hover:bg-planti-green-700 flex items-center"
            >
              <Home size={18} className="mr-1" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/developers"
              className="px-3 py-2 rounded-md hover:bg-planti-green-700 flex items-center"
            >
              <Code size={18} className="mr-1" />
              <span>Developers</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 flex items-center transition-colors"
            >
              <LogOut size={18} className="mr-1" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>

          {/* Mobile Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-planti-green-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-planti-green-800">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md hover:bg-planti-green-700 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} className="mr-2" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/developers"
              className="block px-3 py-2 rounded-md hover:bg-planti-green-700 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Code size={18} className="mr-2" />
              <span>Developers</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 flex items-center transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

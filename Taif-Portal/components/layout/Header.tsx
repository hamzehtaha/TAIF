"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { authService, User } from "@/services/authService";

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const t = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(authService.getUser());
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/sels-logo.png"
              alt="SELS Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-bold text-lg hidden sm:inline text-foreground">
              SELS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary transition"
            >
              {t.nav.about}
            </Link>
            {mounted && isAuthenticated && (
              <Link
                href="/dashboard/courses"
                className="text-sm font-medium hover:text-primary transition"
              >
                {t.nav.courses}
              </Link>
            )}
            <Link
              href="/contact"
              className="text-sm font-medium hover:text-primary transition"
            >
              {t.nav.contact}
            </Link>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-muted rounded-lg transition flex items-center gap-1"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>

            {/* Auth Buttons */}
            {mounted && !isAuthenticated && (
              <div className="hidden sm:flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t.nav.signin}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    {t.nav.signup}
                  </Button>
                </Link>
              </div>
            )}
            {mounted && isAuthenticated && (
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    {t.nav.dashboard}
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" size="sm">
                    {user?.firstName}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium hover:text-primary"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/about"
              className="block text-sm font-medium hover:text-primary"
            >
              {t.nav.about}
            </Link>
            {mounted && isAuthenticated && (
              <Link
                href="/dashboard/courses"
                className="block text-sm font-medium hover:text-primary"
              >
                {t.nav.courses}
              </Link>
            )}
            <Link
              href="/contact"
              className="block text-sm font-medium hover:text-primary"
            >
              {t.nav.contact}
            </Link>
            {mounted && !isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    {t.nav.signin}
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button size="sm" className="w-full">
                    {t.nav.signup}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

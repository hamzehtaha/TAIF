"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";

export function Footer() {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted mt-20 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">SELS</h3>
            <p className="text-sm text-muted-foreground">
              {t.about.company}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t.home.subtitle}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.nav.home}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{t.courses.allCourses}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard/courses"
                  className="hover:text-primary transition"
                >
                  {t.courses.allCourses}
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  {t.nav.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>
              &copy; {currentYear} SELS by {t.about.company}. All rights
              reserved.
            </p>
            <p className="mt-4 md:mt-0">
              Designed with ❤️ for accessibility and inclusion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

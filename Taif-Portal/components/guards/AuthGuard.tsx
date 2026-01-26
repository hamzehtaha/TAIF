"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/authService";

const PUBLIC_ROUTES = ["/login", "/signup", "/", "/about", "/contact"];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      if (isPublicRoute) {
        setIsAuthorized(true);
        return;
      }

      const isAuth = authService.isAuthenticated();

      if (!isAuth) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

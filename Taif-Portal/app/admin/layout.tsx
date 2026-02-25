"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/user-role.enum";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Allow access to login and signup pages without auth
    if (pathname === "/admin/login" || pathname === "/admin/signup") {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated and has admin role
    const user = authService.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }

    // Allow SystemAdmin, OrgAdmin, and Instructor roles
    if (user.role !== UserRole.Instructor && user.role !== UserRole.OrgAdmin && user.role !== UserRole.SystemAdmin) {
      // Not an admin, redirect to student dashboard
      router.push("/dashboard");
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading && pathname !== "/admin/login" && pathname !== "/admin/signup") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized && pathname !== "/admin/login" && pathname !== "/admin/signup") {
    return null;
  }

  return <>{children}</>;
}

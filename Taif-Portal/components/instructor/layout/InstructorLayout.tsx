"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstructorSidebar } from "./InstructorSidebar";
import { InstructorHeader } from "./InstructorHeader";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface InstructorLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

export function InstructorLayout({ 
  children, 
  breadcrumbs = [],
  title 
}: InstructorLayoutProps) {
  return (
    <SidebarProvider>
      <InstructorSidebar />
      <SidebarInset>
        <InstructorHeader breadcrumbs={breadcrumbs} title={title} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

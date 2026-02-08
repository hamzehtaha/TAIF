"use client";

import { InstructorProvider } from "@/contexts/InstructorContext";

export default function InstructorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstructorProvider>
      {children}
    </InstructorProvider>
  );
}

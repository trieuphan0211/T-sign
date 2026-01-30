import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import React from "react";

export default function ProtectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <AppHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

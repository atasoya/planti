"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <div className="container mx-auto p-4 pt-6">
        <Navbar />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  composer?: ReactNode;
}

export function AppLayout({ children, className, composer }: AppLayoutProps) {
  return (
    <div className={cn("slate-root", className)}>
      <div className="slate-container">
        {children}
        {composer}
      </div>
    </div>
  );
}

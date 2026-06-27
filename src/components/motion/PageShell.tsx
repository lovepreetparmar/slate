"use client";

import { type ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { StickyNav } from "@/components/layout/StickyNav";

interface PageShellProps {
  backHref: string;
  title?: string;
  children: ReactNode;
  headerCenter?: ReactNode;
  showHeaderActions?: boolean;
}

export function PageShell({
  backHref,
  title,
  children,
  headerCenter,
  showHeaderActions = true,
}: PageShellProps) {
  return (
    <AppLayout>
      <StickyNav
        backHref={backHref}
        title={title}
        center={headerCenter}
        trailing={showHeaderActions ? <HeaderActions /> : undefined}
      />
      <div className="slate-page-content">{children}</div>
    </AppLayout>
  );
}

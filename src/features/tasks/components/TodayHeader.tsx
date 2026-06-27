"use client";

import { HeaderActions } from "@/components/layout/HeaderActions";

interface TodayHeaderProps {
  displayDate: string;
}

export function TodayHeader({ displayDate }: TodayHeaderProps) {
  return (
    <header className="slate-header">
      <div className="slate-header-top">
        <p className="slate-header-label">Today</p>
        <HeaderActions />
      </div>
      <h1 className="slate-header-date" suppressHydrationWarning>
        {displayDate}
      </h1>
    </header>
  );
}

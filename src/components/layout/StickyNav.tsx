"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { navigateBack } from "@/lib/navigation";

interface StickyNavProps {
  title?: string;
  backHref?: string;
  onBack?: () => void;
  center?: ReactNode;
  trailing?: ReactNode;
}

export function StickyNav({
  title,
  backHref,
  onBack,
  center,
  trailing,
}: StickyNavProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      navigateBack(backHref, router.push);
    }
  };

  const showBack = Boolean(backHref || onBack);

  return (
    <header className="slate-nav">
      <div className="slate-nav-inner">
        <div className="slate-nav-leading">
          {showBack ? (
            <button
              onClick={handleBack}
              className="slate-nav-back"
              aria-label="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Back</span>
            </button>
          ) : (
            <span className="slate-nav-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="slate-nav-center">
          {center ?? (title ? <h1 className="slate-nav-title">{title}</h1> : null)}
        </div>

        <div className="slate-nav-trailing">
          {trailing ?? <span className="slate-nav-placeholder" aria-hidden="true" />}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { triggerSelectionHaptic } from "@/lib/haptics";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface SlateActionButtonProps {
  href: string;
  label: string;
  isActive?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
  variant?: "icon" | "avatar";
}

export function SlateActionButton({
  href,
  label,
  isActive = false,
  onNavigate,
  children,
  variant = "icon",
}: SlateActionButtonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "slate-action-btn-wrap",
        !reducedMotion && "slate-action-btn-wrap--tap"
      )}
    >
      <Link
        href={href}
        onClick={() => {
          triggerSelectionHaptic();
          onNavigate?.();
        }}
        className={cn(
          "slate-action-btn",
          variant === "avatar" && "slate-action-btn-avatar",
          isActive && "is-active"
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        prefetch
      >
        {children}
      </Link>
    </div>
  );
}

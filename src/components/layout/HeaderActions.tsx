"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { setNavDirection } from "@/lib/navigation";
import { ProfileAvatar } from "@/features/auth/components/ProfileAvatar";
import { HistoryIcon } from "./HistoryIcon";
import { SlateActionButton } from "./SlateActionButton";

export function HeaderActions() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const showHistory = !pathname.startsWith("/history");
  const showProfile = !pathname.startsWith("/profile");

  if (!showHistory && !showProfile) return null;

  return (
    <div className="slate-header-actions">
      {showHistory ? (
        <SlateActionButton
          href="/history"
          label="View history"
          onNavigate={() => setNavDirection("forward")}
        >
          <HistoryIcon />
        </SlateActionButton>
      ) : null}
      {showProfile ? (
        <SlateActionButton
          href="/profile"
          label="Open profile"
          onNavigate={() => setNavDirection("forward")}
          variant="avatar"
        >
          <ProfileAvatar
            name={session?.user?.name}
            email={session?.user?.email}
            image={session?.user?.image}
            size="sm"
            fit="fill"
            sharedLayout
          />
        </SlateActionButton>
      ) : null}
    </div>
  );
}

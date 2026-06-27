"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { setNavDirection } from "@/lib/navigation";
import { usePreferences } from "@/hooks/usePreferences";
import { PageShell } from "@/components/motion/PageShell";
import { ProfileAvatar } from "./ProfileAvatar";
import { SlateThemeSlider } from "./SlateThemeSlider";

const APP_VERSION = "0.1.0";
const BUILD_NUMBER = "2026.06.09";

export function ProfileScreen() {
  const { data: session } = useSession();
  const { themePreference, setThemePreference } = usePreferences();

  const user = session?.user;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <PageShell backHref="/" title="Profile">
      <section className="slate-profile-hero">
        <ProfileAvatar
          name={user?.name}
          email={user?.email}
          image={user?.image}
          size="lg"
          sharedLayout
        />
        <p className="slate-profile-name">{user?.name ?? "Slate User"}</p>
        <p className="slate-profile-email">{user?.email}</p>
      </section>

      <section className="slate-settings-section">
        <h2 className="slate-settings-label">Appearance</h2>
        <p className="slate-settings-sublabel">Theme</p>
        <SlateThemeSlider
          value={themePreference}
          onChange={setThemePreference}
        />
      </section>

      <section className="slate-settings-section">
        <h2 className="slate-settings-label">History</h2>
        <Link
          href="/history"
          onClick={() => setNavDirection("forward")}
          className="slate-settings-row"
        >
          <span>View Archived Slates</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </section>

      <section className="slate-settings-section">
        <h2 className="slate-settings-label">About</h2>
        <div className="slate-settings-info-row">
          <span>Version</span>
          <span>{APP_VERSION}</span>
        </div>
        <div className="slate-settings-info-row">
          <span>Build Number</span>
          <span>{BUILD_NUMBER}</span>
        </div>
      </section>

      <section className="slate-settings-section slate-settings-account">
        <h2 className="slate-settings-label">Account</h2>
        <button onClick={handleSignOut} className="slate-sign-out">
          Sign Out
        </button>
      </section>
    </PageShell>
  );
}

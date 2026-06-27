"use client";

import { motion } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { getUserInitials } from "@/lib/user";
import { SLATE_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "sm" | "lg";
  fit?: "default" | "fill";
  className?: string;
  sharedLayout?: boolean;
}

export function ProfileAvatar({
  name,
  email,
  image,
  size = "sm",
  fit = "default",
  className,
  sharedLayout = false,
}: ProfileAvatarProps) {
  const hydrated = useHydrated();
  const initials = getUserInitials(name, email);

  const content = image ? (
    <img
      src={image}
      alt=""
      className="slate-avatar-image"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="slate-avatar-initials">{initials}</span>
  );

  const classes = cn(
    "slate-avatar",
    size === "sm" && fit === "default" && "slate-avatar-sm",
    size === "lg" && "slate-avatar-lg",
    fit === "fill" && "slate-action-avatar",
    className
  );

  if (sharedLayout && hydrated) {
    return (
      <motion.div
        layoutId="profile-avatar"
        layout="position"
        className={classes}
        transition={SLATE_TRANSITION.layout}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={classes}>{content}</div>;
}

"use client";

import { useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  consumeNavDirection,
  navigateBack,
  type NavDirection,
} from "@/lib/navigation";
import { getPageExitVariants, getPageVariants, SLATE_TRANSITION } from "@/lib/motion";

const SWIPE_BACK_ROUTES: Record<string, string> = {
  "/profile": "/",
  "/history": "/",
};

function getSwipeBackHref(pathname: string): string | null {
  if (SWIPE_BACK_ROUTES[pathname]) {
    return SWIPE_BACK_ROUTES[pathname];
  }
  if (pathname.startsWith("/history/") && pathname !== "/history") {
    return "/history";
  }
  return null;
}

const STATIC_ROUTES = new Set(["/login", "/offline"]);

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const prevPathRef = useRef(pathname);
  const directionRef = useRef<NavDirection>("forward");
  const swipeBackHref = getSwipeBackHref(pathname);

  if (STATIC_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  if (prevPathRef.current !== pathname) {
    directionRef.current = consumeNavDirection();
    prevPathRef.current = pathname;
  }

  const direction = directionRef.current;
  const enter = getPageVariants(direction, isMobile, "stack", reducedMotion);
  const exit = getPageExitVariants(direction, isMobile, reducedMotion);

  return (
    <LayoutGroup id="slate">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        className="slate-page-transition"
        initial={enter.initial}
        animate={enter.animate}
        exit={exit}
        transition={SLATE_TRANSITION.page}
        style={{ willChange: "transform, opacity" }}
        drag={
          swipeBackHref && isMobile && !reducedMotion ? "x" : false
        }
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.05, right: 0.28 }}
        onDragEnd={(_, info) => {
          if (!swipeBackHref) return;
          if (info.offset.x > 72 || info.velocity.x > 380) {
            navigateBack(swipeBackHref, router.push);
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
    </LayoutGroup>
  );
}

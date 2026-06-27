import type { TargetAndTransition, Transition, Variants } from "framer-motion";

export const SLATE_EASE = [0.25, 0.1, 0.25, 1] as const;
export const SLATE_EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const SLATE_DURATION = {
  fast: 0.2,
  normal: 0.3,
  page: 0.3,
  slow: 0.4,
} as const;

export const SLATE_TRANSITION = {
  page: {
    duration: SLATE_DURATION.page,
    ease: SLATE_EASE,
  } satisfies Transition,
  layout: {
    duration: SLATE_DURATION.normal,
    ease: SLATE_EASE,
  } satisfies Transition,
  enter: {
    duration: SLATE_DURATION.normal,
    ease: SLATE_EASE_OUT,
  } satisfies Transition,
  exit: {
    duration: SLATE_DURATION.fast,
    ease: SLATE_EASE,
  } satisfies Transition,
  theme: {
    duration: 0.25,
    ease: SLATE_EASE,
  } satisfies Transition,
} as const;

export type PageTransitionType = "stack" | "push" | "fade";

export function getPageVariants(
  direction: "forward" | "back",
  isMobile: boolean,
  type: PageTransitionType,
  reducedMotion: boolean
): { initial: TargetAndTransition; animate: TargetAndTransition } {
  if (reducedMotion) {
    return { initial: { opacity: 0 }, animate: { opacity: 1 } };
  }

  if (!isMobile) {
    const offset = direction === "forward" ? 16 : -10;
    const depth = type === "push" ? 1.02 : 1;
    return {
      initial: { opacity: 0, x: offset, scale: depth },
      animate: { opacity: 1, x: 0, scale: 1 },
    };
  }

  if (direction === "back") {
    return {
      initial: { x: "-18%", opacity: 0.92 },
      animate: { x: 0, opacity: 1 },
    };
  }

  const pushDepth = type === "push" ? 0.985 : 1;
  const fade = type === "stack" ? 0.92 : 1;
  return {
    initial: { x: "100%", opacity: fade, scale: pushDepth },
    animate: { x: 0, opacity: 1, scale: 1 },
  };
}

export function getPageExitVariants(
  direction: "forward" | "back",
  isMobile: boolean,
  reducedMotion: boolean
): TargetAndTransition {
  if (reducedMotion) {
    return { opacity: 0 };
  }

  if (!isMobile) {
    const offset = direction === "forward" ? -12 : 14;
    return { opacity: 0, x: offset, scale: 0.99 };
  }

  if (direction === "forward") {
    return { x: "-22%", opacity: 0.88, scale: 0.98 };
  }

  return { x: "100%", opacity: 0.9, scale: 0.985 };
}

export const TASK_CREATE_DURATION = 0.3;

export const TASK_CREATE_TRANSITION = {
  duration: TASK_CREATE_DURATION,
  ease: SLATE_EASE_OUT,
} satisfies Transition;

export const taskEnterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    filter: "blur(3px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: {
      height: { duration: 0.28, ease: SLATE_EASE },
      marginTop: { duration: 0.28, ease: SLATE_EASE },
      marginBottom: { duration: 0.28, ease: SLATE_EASE },
      opacity: { duration: 0.12, ease: SLATE_EASE },
    },
  },
};

export const taskEnterReducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

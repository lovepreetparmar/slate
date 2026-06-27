"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  triggerClearHaptic,
  triggerEraseCompleteHaptic,
  triggerEraseThresholdHaptic,
} from "@/lib/haptics";

const DRAG_START_PX = 4;
const SPRING = { type: "spring" as const, stiffness: 520, damping: 34 };

type SwipeDirection = "left" | "right";

interface UseHorizontalSwipeOptions {
  enabled: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  /** @deprecated Use onSwipeRight */
  onComplete?: () => boolean | void;
  /** Return true when the item is dismissed (skip snap-back). */
  onSwipeRight?: () => boolean | void;
  /** Return true when the item is dismissed (skip snap-back). */
  onSwipeLeft?: () => boolean | void;
  allowSwipeLeft?: boolean;
  allowSwipeRight?: boolean;
  reducedMotion: boolean;
  thresholdRatio?: number;
  completeDuration?: number;
  useClearHaptic?: boolean;
}

export function useHorizontalSwipe({
  enabled,
  containerRef,
  onComplete,
  onSwipeRight,
  onSwipeLeft,
  allowSwipeLeft = false,
  allowSwipeRight = true,
  reducedMotion,
  thresholdRatio = 0.55,
  completeDuration = 0.24,
  useClearHaptic = false,
}: UseHorizontalSwipeOptions) {
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompletingRef = useRef(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const thresholdHitRef = useRef(false);
  const draggingRef = useRef(false);
  const directionRef = useRef<SwipeDirection | null>(null);
  const axisRef = useRef<"horizontal" | "vertical" | null>(null);

  const handleSwipeRight = onSwipeRight ?? onComplete;
  const threshold = maxDrag * thresholdRatio;

  const rightProgress = useTransform(x, [0, maxDrag], [0, 1]);
  const leftProgress = useTransform(x, [-maxDrag, 0], [1, 0]);
  const revealOpacityRight = useTransform(
    rightProgress,
    [0, 0.1, 0.35],
    [0, 0.45, 1]
  );
  const revealOpacityLeft = useTransform(
    leftProgress,
    [0, 0.1, 0.35],
    [0, 0.45, 1]
  );
  const archiveTintOpacity = useTransform(
    rightProgress,
    [0, 0.12, 1],
    [0, 0.06, 0.78]
  );
  const deleteTintOpacity = useTransform(
    leftProgress,
    [0, 0.12, 1],
    [0, 0.06, 0.78]
  );
  const archiveBorderOpacity = useTransform(
    rightProgress,
    [0, 0.12, 1],
    [0, 0.2, 1]
  );
  const deleteBorderOpacity = useTransform(
    leftProgress,
    [0, 0.12, 1],
    [0, 0.2, 1]
  );

  useEffect(() => {
    isCompletingRef.current = isCompleting;
  }, [isCompleting]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setMaxDrag(Math.max(el.offsetWidth * 0.78, 160));
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (!enabled) {
      x.set(0);
      setIsDragging(false);
      draggingRef.current = false;
      thresholdHitRef.current = false;
      directionRef.current = null;
      axisRef.current = null;
    }
  }, [enabled, x]);

  const springBack = useCallback(() => {
    thresholdHitRef.current = false;
    draggingRef.current = false;
    directionRef.current = null;
    axisRef.current = null;
    setIsDragging(false);
    if (reducedMotion) {
      x.set(0);
      return;
    }
    void animate(x, 0, SPRING);
  }, [reducedMotion, x]);

  const completeSwipe = useCallback(
    async (direction: SwipeDirection) => {
      const onDone = direction === "right" ? handleSwipeRight : onSwipeLeft;
      if (!onDone) return;

      draggingRef.current = false;
      setIsDragging(false);
      setIsCompleting(true);

      if (direction === "right" && useClearHaptic) {
        triggerClearHaptic();
      } else {
        triggerEraseCompleteHaptic();
      }

      const target = direction === "right" ? maxDrag : -maxDrag;

      if (reducedMotion) {
        const dismissed = onDone() === true;
        if (!dismissed) {
          x.set(0);
        }
        setIsCompleting(false);
        thresholdHitRef.current = false;
        directionRef.current = null;
        axisRef.current = null;
        return;
      }

      await animate(x, target, {
        duration: completeDuration,
        ease: [0.25, 0.1, 0.25, 1],
      });

      const dismissed = onDone() === true;

      if (!dismissed) {
        await animate(x, 0, {
          duration: completeDuration,
          ease: [0.25, 0.1, 0.25, 1],
        });
      }

      setIsCompleting(false);
      thresholdHitRef.current = false;
      directionRef.current = null;
      axisRef.current = null;
    },
    [
      completeDuration,
      handleSwipeRight,
      maxDrag,
      onSwipeLeft,
      reducedMotion,
      useClearHaptic,
      x,
    ]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const onPointerDown = (e: PointerEvent) => {
      if (isCompletingRef.current) return;
      if (e.button !== 0) return;

      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      pointerIdRef.current = e.pointerId;
      thresholdHitRef.current = false;
      draggingRef.current = false;
      directionRef.current = null;
      axisRef.current = null;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId || isCompletingRef.current) {
        return;
      }

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      if (!axisRef.current) {
        if (Math.abs(dx) <= DRAG_START_PX && Math.abs(dy) <= DRAG_START_PX) {
          return;
        }

        if (Math.abs(dy) > Math.abs(dx)) {
          axisRef.current = "vertical";
          pointerIdRef.current = null;
          return;
        }

        axisRef.current = "horizontal";
      }

      if (axisRef.current === "vertical") return;

      if (!directionRef.current) {
        if (dx > 0 && allowSwipeRight) {
          directionRef.current = "right";
        } else if (dx < 0 && allowSwipeLeft) {
          directionRef.current = "left";
        } else {
          return;
        }
      }

      const direction = directionRef.current;
      if (!direction) return;
      if (direction === "right" && dx < 0) return;
      if (direction === "left" && dx > 0) return;

      e.preventDefault();
      if (!draggingRef.current) {
        draggingRef.current = true;
        setIsDragging(true);
        el.setPointerCapture(e.pointerId);
      }

      const clamped =
        direction === "right"
          ? Math.min(Math.max(0, dx), maxDrag)
          : Math.max(Math.min(0, dx), -maxDrag);
      x.set(clamped);

      const absClamped = Math.abs(clamped);
      if (absClamped >= threshold && !thresholdHitRef.current) {
        thresholdHitRef.current = true;
        triggerEraseThresholdHaptic();
      } else if (absClamped < threshold) {
        thresholdHitRef.current = false;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;

      const wasDragging = draggingRef.current;
      pointerIdRef.current = null;

      if (!wasDragging) return;

      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }

      const direction = directionRef.current;
      const absX = Math.abs(x.get());

      if (direction && absX >= threshold) {
        const onDone = direction === "right" ? handleSwipeRight : onSwipeLeft;
        if (onDone) {
          void completeSwipe(direction);
        } else {
          springBack();
        }
      } else {
        springBack();
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;
      if (draggingRef.current) {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
        springBack();
      }
    };

    const captureOpts = { capture: true };
    const moveOpts = { capture: true, passive: false };
    el.addEventListener("pointerdown", onPointerDown, captureOpts);
    el.addEventListener("pointermove", onPointerMove, moveOpts);
    el.addEventListener("pointerup", onPointerUp, captureOpts);
    el.addEventListener("pointercancel", onPointerCancel, captureOpts);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown, captureOpts);
      el.removeEventListener("pointermove", onPointerMove, moveOpts);
      el.removeEventListener("pointerup", onPointerUp, captureOpts);
      el.removeEventListener("pointercancel", onPointerCancel, captureOpts);
    };
  }, [
    allowSwipeLeft,
    allowSwipeRight,
    completeSwipe,
    containerRef,
    enabled,
    handleSwipeRight,
    maxDrag,
    onSwipeLeft,
    springBack,
    threshold,
    x,
  ]);

  const triggerComplete = useCallback(
    (direction: SwipeDirection = "right") => {
      if (!enabled || isCompletingRef.current) return;
      if (direction === "left" && !allowSwipeLeft) return;
      if (direction === "right" && !allowSwipeRight) return;
      void completeSwipe(direction);
    },
    [allowSwipeLeft, allowSwipeRight, completeSwipe, enabled]
  );

  return {
    x,
    rightProgress,
    leftProgress,
    revealOpacity: revealOpacityRight,
    revealOpacityRight,
    revealOpacityLeft,
    archiveTintOpacity,
    deleteTintOpacity,
    archiveBorderOpacity,
    deleteBorderOpacity,
    isDragging,
    isCompleting,
    maxDrag,
    triggerComplete,
    springBack,
  };
}

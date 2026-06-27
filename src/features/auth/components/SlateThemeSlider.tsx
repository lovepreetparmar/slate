"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { applyThemeImmediate } from "@/lib/theme";
import { applyThemeProgress } from "@/lib/themeInterpolation";
import { triggerMidpointHaptic } from "@/lib/haptics";
import type { ThemePreference } from "@/types/theme";

const TRACK_WIDTH = 260;
const THUMB_SIZE = 40;
const TRACK_PADDING = 6;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

const SPRING = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.75 };

interface SlateThemeSliderProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}

export function SlateThemeSlider({ value, onChange }: SlateThemeSliderProps) {
  const x = useMotionValue(value === "light" ? TRAVEL : 0);
  const progress = useTransform(x, [0, TRAVEL], [0, 1]);
  const [ariaValue, setAriaValue] = useState(value === "light" ? 100 : 0);

  const isDragging = useRef(false);
  const pastMidpoint = useRef(value === "light");
  const committed = useRef(value);

  const snapTo = useCallback(
    (preference: ThemePreference, animateThumb = true) => {
      const target = preference === "light" ? TRAVEL : 0;
      committed.current = preference;

      if (animateThumb) {
        animate(x, target, {
          ...SPRING,
          onComplete: () => {
            applyThemeImmediate(preference);
          },
        });
      } else {
        x.set(target);
        applyThemeImmediate(preference);
      }

      setAriaValue(preference === "light" ? 100 : 0);
      pastMidpoint.current = preference === "light";
    },
    [x]
  );

  useEffect(() => {
    if (isDragging.current) return;
    if (committed.current === value) return;
    snapTo(value, false);
  }, [value, snapTo]);

  useEffect(() => {
    const unsubscribe = progress.on("change", (p) => {
      applyThemeProgress(p);
      setAriaValue(Math.round(p * 100));

      if (!isDragging.current) return;

      const isLightSide = p >= 0.5;
      if (isLightSide !== pastMidpoint.current) {
        pastMidpoint.current = isLightSide;
        triggerMidpointHaptic();
      }
    });

    return unsubscribe;
  }, [progress]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDragging.current = false;
    const current = x.get();
    const velocityBias = info.velocity.x * 0.12;
    const projected = current + velocityBias;
    const preference: ThemePreference = projected >= TRAVEL / 2 ? "light" : "dark";

    snapTo(preference, true);
    if (preference !== value) {
      onChange(preference);
    } else {
      applyThemeImmediate(preference);
    }
  };

  return (
    <div className="slate-theme-slider">
      <div className="slate-theme-slider-labels">
        <span className={value === "dark" ? "is-active" : ""}>Dark</span>
        <span className={value === "light" ? "is-active" : ""}>Light</span>
      </div>

      <div
        className="slate-theme-slider-track-wrap"
        role="slider"
        aria-label="Theme"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValue}
        aria-valuetext={value === "light" ? "Light" : "Dark"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            if (value !== "light") {
              snapTo("light", true);
              onChange("light");
            }
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            if (value !== "dark") {
              snapTo("dark", true);
              onChange("dark");
            }
          } else if (e.key === "Home") {
            e.preventDefault();
            snapTo("dark", true);
            onChange("dark");
          } else if (e.key === "End") {
            e.preventDefault();
            snapTo("light", true);
            onChange("light");
          }
        }}
      >
        <div
          className="slate-theme-slider-track"
          style={{ width: TRACK_WIDTH }}
        >
          <motion.div
            className="slate-theme-slider-thumb"
            drag="x"
            dragConstraints={{ left: 0, right: TRAVEL }}
            dragElastic={0}
            dragMomentum={false}
            style={{ x, left: TRACK_PADDING }}
            onDragStart={() => {
              isDragging.current = true;
            }}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </div>
      </div>
    </div>
  );
}

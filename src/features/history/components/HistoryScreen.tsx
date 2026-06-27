"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHistoryArchives } from "@/hooks/useHistory";
import { PageShell } from "@/components/motion/PageShell";
import { ArchiveListSkeleton } from "@/components/motion/Skeleton";
import { formatSlateDateFull } from "@/lib/history";
import { setNavDirection } from "@/lib/navigation";
import { SLATE_TRANSITION } from "@/lib/motion";

function taskCountLabel(count: number) {
  return count === 1 ? "1 task completed" : `${count} tasks completed`;
}

export function HistoryScreen() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { slates, isLoading, isEmpty, hasMore, loadMore, isLoadingMore } =
    useHistoryArchives(search, true);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore, slates.length]);

  return (
    <PageShell backHref="/" title="History">
      <div className="slate-history-page">
        <div className="slate-history-search-wrap">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search slates..."
            className="slate-history-search"
            aria-label="Search archived slates"
          />
        </div>

        {isLoading && <ArchiveListSkeleton />}

        {!isLoading && isEmpty && (
          <p className="slate-page-empty">
            {search
              ? "No slates match your search."
              : "No archived slates yet."}
          </p>
        )}

        <ul className="slate-archive-list">
          {slates.map((slate, index) => (
            <motion.li
              key={slate.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...SLATE_TRANSITION.enter,
                delay: Math.min(index * 0.04, 0.24),
              }}
            >
              <Link
                href={`/history/${slate.date}`}
                onClick={() => setNavDirection("forward")}
                className="slate-archive-row"
              >
                <div className="slate-archive-row-main">
                  <motion.span
                    layoutId={`archive-date-${slate.date}`}
                    className="slate-archive-row-date"
                    transition={SLATE_TRANSITION.layout}
                  >
                    {formatSlateDateFull(slate.date)}
                  </motion.span>
                  <span className="slate-archive-row-meta">
                    {taskCountLabel(slate.taskCount)}
                  </span>
                </div>
                <svg
                  className="slate-archive-row-chevron"
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
            </motion.li>
          ))}
        </ul>

        {hasMore && (
          <div ref={loadMoreRef} className="slate-history-load-more">
            {isLoadingMore && <ArchiveListSkeleton count={2} />}
          </div>
        )}
      </div>
    </PageShell>
  );
}

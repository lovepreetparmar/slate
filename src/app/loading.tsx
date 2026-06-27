import { SkeletonLine } from "@/components/motion/Skeleton";

export default function Loading() {
  return (
    <div className="slate-root slate-today" aria-busy="true" aria-label="Loading">
      <div className="slate-container slate-today-shell">
        <header className="slate-today-header">
          <SkeletonLine width="40%" className="slate-skeleton-title" />
        </header>
        <div className="slate-today-scroll">
          <div className="slate-skeleton-group">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="slate-skeleton-task-row">
                <SkeletonLine width={`${75 - i * 10}%`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

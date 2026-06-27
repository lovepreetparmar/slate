"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="slate-root slate-error-page">
      <div className="slate-container slate-error-shell">
        <h1 className="slate-error-title">Something went wrong</h1>
        <p className="slate-error-text">
          Slate hit an unexpected error. You can try again or reload the page.
        </p>
        <div className="slate-error-actions">
          <button type="button" onClick={reset} className="slate-btn-primary">
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="slate-btn-ghost"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

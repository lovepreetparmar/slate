export default function OfflinePage() {
  return (
    <main className="slate-page">
      <div className="slate-surface flex items-center justify-center min-h-[20rem] px-8">
        <div className="text-center">
          <p className="slate-header-label mb-3">Offline</p>
          <p className="slate-login-subtitle">
            Your tasks are saved locally and will sync when you&apos;re back
            online.
          </p>
        </div>
      </div>
    </main>
  );
}

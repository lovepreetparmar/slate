"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

interface AuthConfig {
  hasGoogle: boolean;
  hasMagicLink: boolean;
  hasDev: boolean;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [config, setConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then(setConfig)
      .catch(() =>
        setConfig({ hasGoogle: false, hasMagicLink: false, hasDev: false })
      );
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await signIn("dev", {
        email: email.trim().toLowerCase(),
        callbackUrl: "/",
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = "/";
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await signIn("nodemailer", {
        email: email.trim(),
        callbackUrl: "/",
        redirect: false,
      });
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!config) {
    return (
      <p className="text-center slate-login-subtitle">Loading...</p>
    );
  }

  const hasAnyProvider = config.hasGoogle || config.hasMagicLink || config.hasDev;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-12">
        <h1 className="slate-login-title mb-2">Slate</h1>
        <p className="slate-login-subtitle">Your personal slate for today.</p>
      </div>

      {!hasAnyProvider && (
        <p className="slate-login-subtitle text-sm mb-6">
          Set AUTH_DEV_MODE=true in .env for local development.
        </p>
      )}

      {config.hasGoogle && (
        <button onClick={handleGoogleSignIn} className="slate-btn mb-4">
          Continue with Google
        </button>
      )}

      {config.hasDev && (
        <>
          {config.hasGoogle && (
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-[var(--text-muted)]">or</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>
          )}

          <form onSubmit={handleDevSignIn}>
            <label htmlFor="dev-email" className="sr-only">
              Email address
            </label>
            <input
              id="dev-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="slate-field mb-3"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="slate-btn slate-btn-primary disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-4 opacity-70">
            Development mode
          </p>
        </>
      )}

      {config.hasMagicLink && !config.hasDev && (
        <>
          {config.hasGoogle && (
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-[var(--text-muted)]">or</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>
          )}

          {emailSent ? (
            <p className="slate-login-subtitle text-sm text-center">
              Check your email for a sign-in link.
            </p>
          ) : (
            <form onSubmit={handleMagicLinkSignIn}>
              <label htmlFor="magic-email" className="sr-only">
                Email address
              </label>
              <input
                id="magic-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="slate-field mb-3"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="slate-btn slate-btn-primary disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send magic link"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

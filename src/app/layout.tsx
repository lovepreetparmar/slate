import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppStatus } from "@/components/AppStatus";
import { auth } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Slate",
  description: "Your personal slate for today.",
  applicationName: "Slate",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Slate",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark" suppressHydrationWarning data-theme="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)] focus:rounded-md">
          Skip to content
        </a>
        <SessionProvider session={session}>
          <QueryProvider>
            <SyncProvider>
              <ThemeProvider>
                <AppStatus />
                {children}
              </ThemeProvider>
            </SyncProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

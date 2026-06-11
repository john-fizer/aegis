import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Spectral } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEGIS — AI Governance & Acquisition Strategy",
  description:
    "Multi-agent AI strategy platform for evaluating AI use cases, vendors, risks, and acquisition readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${archivo.variable} ${plexMono.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border/70 bg-background/80 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
                AEGIS
              </span>
              <span className="eyebrow hidden sm:inline">
                AI Governance &amp; Acquisition Strategy
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/evaluation/new"
                className="transition-colors hover:text-foreground"
              >
                New Evaluation
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>
        <footer className="border-t border-border/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <span className="eyebrow">AEGIS Platform — MVP</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Multi-agent evaluation council
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

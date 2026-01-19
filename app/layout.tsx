import type { Metadata } from "next";
import { IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { auth } from "@/lib/auth/config";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Platform",
  description: "A self-hosted personal website and community platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plexSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <div className="app-shell">
              <Sidebar session={session} />
              <main className="main-feed">
                {children}
              </main>
              {/* Right panel placeholder - will add widgets later */}
              <aside className="right-panel">
                <div className="right-panel-card">
                  <p className="text-xs uppercase tracking-[0.2em]">Context</p>
                  <p className="mt-2 text-sm">
                    Add highlights, tags, or a short status update here.
                  </p>
                </div>
              </aside>
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

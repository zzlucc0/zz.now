import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/lib/auth/config";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
                <div className="text-sm text-muted-foreground">Context panel</div>
              </aside>
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

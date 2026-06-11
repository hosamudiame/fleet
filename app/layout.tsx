import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const previewTitle = "Fleetops | Live Fleet Command Center";
const previewDescription =
  "Run vehicles, drivers, routes, and exceptions from one sharp operations desk.";

export const metadata: Metadata = {
  title: previewTitle,
  description: previewDescription,
  applicationName: "Fleetops",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: previewTitle,
    description: previewDescription,
    siteName: "Fleetops",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: previewTitle,
    description: previewDescription,
  },
};

function ThemeScript() {
  const script = `
    (() => {
      try {
        const stored = localStorage.getItem("fleetops-theme");
        const theme = stored === "dark" || stored === "light"
          ? stored
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-canvas antialiased">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

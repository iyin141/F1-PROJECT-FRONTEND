import type { Metadata } from "next";
import { Bebas_Neue, DM_Mono, DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { QueryProvider } from "@/_Stores/QueryProvider";
import { Sidebar } from "@/components/Sidebar";
import { NavigationProgress } from "@/components/NavigationProgress";

import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display-font",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-body-font",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-code-font",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "F1 Control Room",
  description: "Dark-first Formula 1 dashboard foundation for season data and race analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-text">
        <NavigationProgress />
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <QueryProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 min-w-0 md:pl-[15%]">
                {children}
              </div>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

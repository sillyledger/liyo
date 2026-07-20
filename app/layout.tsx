import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Liyo — your developer shelf",
  description:
    "One shareable page for your stack, tools, books, and setup. Show how you build, not just what you build.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking, runs before hydration to avoid a flash of the wrong
            theme — sets .dark on <html> from a stored choice or, absent
            one, prefers-color-scheme. suppressHydrationWarning above is
            needed because this script mutates <html>'s class before React
            hydrates it. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-bg font-sans text-fg antialiased">
        {children}
      </body>
    </html>
  );
}

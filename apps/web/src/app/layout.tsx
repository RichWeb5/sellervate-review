import type { Metadata } from "next";
import { Hanken_Grotesk, Literata } from "next/font/google";
import "./globals.css";

const uiFont = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-ui" });
const readingFont = Literata({ subsets: ["latin"], variable: "--font-read" });

export const metadata: Metadata = {
  title: "Sellervate Review",
  description: "Review the replies your team sent, and read back what your lead thought of yours.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="review" className={`${uiFont.variable} ${readingFont.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}

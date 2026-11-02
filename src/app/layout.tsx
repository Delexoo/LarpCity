import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "LarpCity",
    template: "%s · LarpCity",
  },
  description:
    "Create polished mock financial and social dashboards for screenshots — LarpCity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${spaceDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--bg)] text-[var(--paper)]">
        {children}
      </body>
    </html>
  );
}

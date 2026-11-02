import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}

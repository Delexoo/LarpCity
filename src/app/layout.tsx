import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: `Create polished mock financial and social dashboards for screenshots — ${BRAND_NAME}.`,
  metadataBase: new URL("https://larpingkit.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}

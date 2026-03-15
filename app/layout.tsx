import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Four Boxes Diner — Second Amendment Education",
  description:
    "Serving hot, fresh Second Amendment news and analysis. Free online courses covering constitutional history, firearm safety, and gun laws.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen bg-[#0f1117] text-[#e8e6e3]`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

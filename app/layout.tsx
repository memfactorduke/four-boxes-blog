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
  title: "Second Amendment Online — by Mark Smith (Four Boxes Diner)",
  description:
    "Free online courses covering constitutional history, firearm safety, and gun laws. Second Amendment education by Mark Smith of The Four Boxes Diner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen bg-[#13151a] text-[#e8e6e3]`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

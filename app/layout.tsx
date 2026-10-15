import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getMenuCounts } from "@/lib/menu-counts";

export const metadata: Metadata = {
  title: "Rhinox Scientifica",
  description:
    "A connected STEM platform for education, exploration, experimentation and innovation.",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon-180.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header counts={getMenuCounts()} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
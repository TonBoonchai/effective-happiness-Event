import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext";
import Navbar from "../src/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Effective Happiness Event",
  description: "Event Ticketing System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F8F6F2] text-[#4A4A4A]`}
      >
        <AuthProvider>
          <Navbar />
          <main className="pt-[70px]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

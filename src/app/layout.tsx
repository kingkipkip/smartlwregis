import type { Metadata } from "next";
import { Prompt, Geist_Mono } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin", "thai"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart LWregis",
  description: "ระบบจัดการคำร้องขอแก้ไขผลการเรียน (Smart LWregis)",
  icons: {
    icon: "/school_logo.png",
    shortcut: "/school_logo.png",
    apple: "/school_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${prompt.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

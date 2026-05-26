import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ACLS Reader — คู่มือทบทวน ACLS",
    template: "%s | ACLS Reader",
  },
  description: "เนื้อหาความรู้ ACLS และ Q&A เชิงลึก สำหรับทบทวน",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

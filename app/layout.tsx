import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagGuard Advisor — Smart Crypto Position Advisor",
  description:
    "Demo: analyze holdings and get Avg Down / Cut Loss / Avg Up / Take Profit signals.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

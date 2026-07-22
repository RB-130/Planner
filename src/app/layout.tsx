import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhD Planner",
  description: "Dagschema en planning voor het PhD-traject",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Kanban Board",
  description: "A polished Kanban board built with Next.js App Router, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-foreground">
        {children}
      </body>
    </html>
  );
}

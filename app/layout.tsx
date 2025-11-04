import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moondream Live Demo",
  description: "Real-time video analysis with Moondream AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


import type React from "react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import "./globals.css"; // Tailwind styles

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

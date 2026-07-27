import "@alydev/themes/default.css";
import type { ReactNode } from "react";

export const metadata = { title: "Calix + Next.js" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui" }}>{children}</body>
    </html>
  );
}

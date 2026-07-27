import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "Calix", template: "%s · Calix" },
  description: "A production-grade, headless, multi-calendar DatePicker for React.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <RootProvider search={{ options: { type: "static" } }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

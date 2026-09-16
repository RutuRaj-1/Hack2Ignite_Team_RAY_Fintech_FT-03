import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: {
    default: "FINBRIDGE — AI-Powered Inclusive Micro-Lending",
    template: "%s | FINBRIDGE",
  },
  description:
    "FINBRIDGE empowers MSMEs and self-employed individuals with AI-driven alternative credit assessment, micro-lending, and financial intelligence tools.",
  keywords: [
    "micro-lending",
    "MSME loans",
    "alternative credit scoring",
    "financial inclusion",
    "India fintech",
    "AI finance",
  ],
  openGraph: {
    title: "FINBRIDGE — AI-Powered Inclusive Micro-Lending",
    description:
      "Break the credit barrier. Secure micro-loans using your real financial story.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

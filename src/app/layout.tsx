import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import AIAgentChatbot from "@/components/AIAgentChatbot";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "जनCare | From First Symptom to Complete Care",
  description: "AI-assisted, offline-first healthcare coordination platform connecting patients, frontline health workers, doctors and healthcare facilities.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

import { LanguageProvider } from "@/lib/i18nContext";
import OfflineSyncManager from "@/components/OfflineSyncManager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(reg) {
                  console.log('[JanCare PWA] SW registered:', reg.scope);
                }).catch(function(err) {
                  console.warn('[JanCare PWA] SW registration failed:', err);
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg-brand text-text-primary">
        <LanguageProvider>
          {children}
          <OfflineSyncManager />
          <AIAgentChatbot />
        </LanguageProvider>
      </body>
    </html>
  );
}

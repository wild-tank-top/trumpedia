"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import GoogleAnalytics from "./components/GoogleAnalytics";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      {children}
    </SessionProvider>
  );
}

"use client";

import { AppProviders } from "@/components/wallet/WalletProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppProviders>
        {children}
        <Toaster />
      </AppProviders>
    </ThemeProvider>
  );
}

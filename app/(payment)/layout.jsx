"use client"
import { SessionProvider } from "next-auth/react";

export default function PaymentLayout({
  children,
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </SessionProvider>
  );
}
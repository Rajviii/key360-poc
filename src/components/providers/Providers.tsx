"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@/lib/react-query";
import { NotificationProvider } from "@/context/NotificationContext";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  );
}

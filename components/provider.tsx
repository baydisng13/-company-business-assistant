"use client";

import queryClient from '@/lib/queryClient';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Toaster } from './ui/sonner';
import { ThemeProvider as NextThemesProvider } from "next-themes"

function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <QueryClientProvider client={queryClient}>

      <NextThemesProvider {...props}>{children}</NextThemesProvider>
      <Toaster />
    </QueryClientProvider>
  )
}


export default Provider;
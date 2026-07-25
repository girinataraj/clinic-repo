import React from 'react';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { router } from './app/routes';
import { AuthProvider } from './app/contexts/AuthContext';
import { ThemeProvider } from './app/contexts/ThemeContext';
import { ErrorBoundary } from './app/components/ErrorBoundary';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

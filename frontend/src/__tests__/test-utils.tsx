import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a fresh QueryClient for each test to prevent state leakage
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// All providers that wrap the application
interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Custom render method that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override render with custom render
export { customRender as render };

// Helper to create a mock API response
export function createMockResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  };
}

// Helper to create a mock error response
export function createMockErrorResponse(message: string, status = 400) {
  const error = new Error(message) as Error & {
    response?: { status: number; data: { message: string } };
  };
  error.response = {
    status,
    data: { message },
  };
  return error;
}

// Mock authenticated user for testing protected components
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'QUALITY_MANAGER',
  organizationId: 'test-org-id',
  isActive: true,
};

// Mock organization
export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
};

// Helper to wait for loading states to finish
export async function waitForLoadingToFinish() {
  // Wait for any pending React state updates
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement, type ReactNode, Component, type ErrorInfo } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/components/ui'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by test ErrorBoundary:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return <div>Test Error Boundary Fallback</div>
    }
    return this.props.children
  }
}

interface AllProvidersProps {
  children: ReactNode;
  initialRoute?: string;
}

/**
 * A wrapper component that provides all necessary context providers for testing.
 */
export const AllProviders = ({ children, initialRoute = '/' }: AllProvidersProps) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  </MemoryRouter>
)

/**
 * Custom render method that includes all providers by default.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    ...renderOptions
  }: { route?: string } & Omit<RenderOptions, 'wrapper'> = {}
) {
  return {
    ...render(ui, {
      wrapper: ({ children }) => <AllProviders initialRoute={route}>{children}</AllProviders>,
      ...renderOptions
    })
  }
}

// Re-export everything from RTL
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'



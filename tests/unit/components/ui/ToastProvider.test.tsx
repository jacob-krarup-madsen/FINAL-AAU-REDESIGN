import { ToastProvider, useToast } from '@/components/ui'
import type { ToastOptions } from '@/components/ui/Misc'
import { useEffect } from 'react'

interface TestComponentProps {
  message: string;
  options?: ToastOptions;
  type?: string;
}

const TestComponent = ({ message, options, type = 'success' }: TestComponentProps) => {
  const toast = useToast()
  useEffect(() => {
    if (message) {
      if (type === 'success') toast.success(message, options)
      else if (type === 'error') toast.error(message, options)
      else if (type === 'info') toast.info(message, options)
      else toast.addToast(message, options)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(<ToastProvider><div>Content</div></ToastProvider>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('adds and removes toasts', () => {
    render(
      <ToastProvider>
        <TestComponent message="Test Toast" />
      </ToastProvider>
    )
    expect(screen.getByText('Test Toast')).toBeInTheDocument()
    
    const closeBtn = screen.getByLabelText('Close')
    fireEvent.click(closeBtn)
    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument()
  })

  it('supports different variants', () => {
    const { unmount: u1 } = render(
      <ToastProvider>
        <TestComponent message="Success" type="success" />
      </ToastProvider>
    )
    expect(screen.getByText('Success')).toBeInTheDocument()
    u1()

    const { unmount: u2 } = render(
      <ToastProvider>
        <TestComponent message="Error" type="error" />
      </ToastProvider>
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
    u2()

    const { unmount: u3 } = render(
      <ToastProvider>
        <TestComponent message="Info" type="info" />
      </ToastProvider>
    )
    expect(screen.getByText('Info')).toBeInTheDocument()
    u3()
  })

  it('auto-dismisses toasts', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <TestComponent message="Auto Dismiss" options={{ duration: 1000 }} />
      </ToastProvider>
    )
    expect(screen.getByText('Auto Dismiss')).toBeInTheDocument()
    
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    
    expect(screen.queryByText('Auto Dismiss')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('does not auto-dismiss if duration is 0', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <TestComponent message="No Dismiss" options={{ duration: 0 }} />
      </ToastProvider>
    )
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByText('No Dismiss')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('renders unknown variant with fallback color', () => {
    render(
      <ToastProvider>
        <TestComponent message="Warning Toast" type="addToast" options={{ variant: 'warning' as any }} />
      </ToastProvider>
    )
    expect(screen.getByText('Warning Toast')).toBeInTheDocument()
    const closeBtn = screen.getByLabelText('Close')
    const toastEl = closeBtn.closest('[style*="background"]')
    expect(toastEl).toBeInTheDocument()
  })

  it('calls addToast with default options', () => {
    render(
      <ToastProvider>
        <TestComponent message="Default Toast" type="addToast" />
      </ToastProvider>
    )
    expect(screen.getByText('Default Toast')).toBeInTheDocument()
    // Verify defaults: duration=4000 so toast stays (no auto-remove within test)
  })

  it('throws error when used outside of ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestComponent message="fail" />)).toThrow('useToast must be used within ToastProvider')
    spy.mockRestore()
  })
})

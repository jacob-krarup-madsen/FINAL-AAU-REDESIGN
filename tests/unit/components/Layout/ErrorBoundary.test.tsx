import useStore from '@/store'
import { ErrorBoundary } from '@/components/Layout'

function Explode(): React.ReactNode {
  throw new Error('KABOOM')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    useStore.setState({ lang: 'en' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Explode />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('resets error state on "Try again" click', () => {
    let shouldThrow = true
    function ConditionalExplode() {
      if (shouldThrow) throw new Error('KABOOM')
      return <div>After reset</div>
    }

    render(
      <ErrorBoundary>
        <ConditionalExplode />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    shouldThrow = false
    fireEvent.click(screen.getByText('Try again'))

    expect(screen.getByText('After reset')).toBeInTheDocument()
  })

  it('supports keyboard trigger on Enter or Space', () => {
    let shouldThrow = true
    function ConditionalExplode() {
      if (shouldThrow) throw new Error('KABOOM')
      return <div>After reset</div>
    }

    render(
      <ErrorBoundary>
        <ConditionalExplode />
      </ErrorBoundary>
    )

    shouldThrow = false
    const button = screen.getByText('Try again')

    fireEvent.keyDown(button, { key: 'Enter' })
    expect(screen.getByText('After reset')).toBeInTheDocument()
  })
})

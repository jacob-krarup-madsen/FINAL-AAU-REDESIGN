import { PageSkeleton } from '@/components/ui'

describe('PageSkeleton', () => {
  it('renders loading status container', () => {
    render(<PageSkeleton />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })
})

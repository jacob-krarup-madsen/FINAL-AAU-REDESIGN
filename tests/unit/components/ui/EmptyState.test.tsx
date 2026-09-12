import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { AllProviders } from '@/__tests__/setup/test-utils'

describe('EmptyState', () => {
  it('renders correctly', () => {
    render(<EmptyState title="Test" icon={Inbox} />, { wrapper: AllProviders })
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders without icon', () => {
    render(<EmptyState title="No Icon" />, { wrapper: AllProviders })
    expect(screen.getByText('No Icon')).toBeInTheDocument()
  })
})

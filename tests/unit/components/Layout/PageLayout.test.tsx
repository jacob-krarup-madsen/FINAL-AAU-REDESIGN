import { renderWithProviders } from '@/__tests__/setup/test-utils'
import { PageLayout } from '@/components/Layout'

describe('PageLayout', () => {
  it('renders header title and main content children', () => {
    renderWithProviders(
      <PageLayout title="Layout Title" pageKey="test">
        <div data-testid="layout-content">Main Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Layout Title')).toBeDefined()
    expect(screen.getByTestId('layout-content')).toBeDefined()
  })
})

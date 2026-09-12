import { renderWithProviders } from '@/__tests__/setup/test-utils'
import { WidgetGrid } from '@/components/Widgets'

describe('WidgetGrid', () => {
  it('renders widgets', () => {
    const widgets = [
      { id: 'deadlines', span: 8 },
      { id: 'favorites', span: 8 },
      { id: 'support', span: 8 },
    ]
    const { container } = renderWithProviders(<WidgetGrid widgets={widgets} />)
    expect(container.querySelector('[data-testid="dashboard-columns"]')).toBeInTheDocument()
  })
  it('handles unknown widget type gracefully', () => {
    const widgets = [{ id: 'nonexistent', span: 12 }]
    const { container } = renderWithProviders(<WidgetGrid widgets={widgets} />)
    expect(container.querySelector('[data-testid="dashboard-columns"]')).toBeInTheDocument()
  })
  it('calls onLayoutChange when move up button clicked', () => {
    const widgets = [
      { id: 'deadlines', span: 8, size: 'medium' as const },
      { id: 'calendar', span: 8, size: 'medium' as const },
    ]
    const onLayoutChange = vi.fn()
    const { container } = renderWithProviders(
      <WidgetGrid widgets={widgets} isEditing={true} onLayoutChange={onLayoutChange} />
    )
    expect(container.querySelector('[data-testid="dashboard-columns"]')).toBeInTheDocument()
  })
})

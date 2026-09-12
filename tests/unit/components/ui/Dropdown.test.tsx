import { waitFor, render, screen, fireEvent } from '@testing-library/react'
import { Dropdown } from '@/components/ui/Dialog'

describe('Dropdown', () => {
  it('renders trigger and opens menu on click', async () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button data-testid="trigger">Open</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={vi.fn()}>Item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  it('closes on second trigger click', async () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button data-testid="trigger">Open</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={vi.fn()}>Item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes on outside click', async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Dropdown>
          <Dropdown.Trigger>
            <button data-testid="trigger">Open</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item onClick={vi.fn()}>Item</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.mouseDown(screen.getByTestId('outside'))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes on Escape', async () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button data-testid="trigger">Open</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={vi.fn()}>Item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes when item is clicked', async () => {
    const onClick = vi.fn()
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button data-testid="trigger">Open</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={onClick}>Item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Item'))
    await waitFor(() => {
      expect(onClick).toHaveBeenCalled()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('supports function-as-child trigger with isOpen state', async () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          {({ ref, onKeyDown, onClick }: any, { isOpen }: any) => (
            <button
              ref={ref as any}
              onKeyDown={onKeyDown}
              onClick={onClick}
              data-testid="trigger"
              data-open={isOpen}
            >
              {isOpen ? 'Close' : 'Open'}
            </button>
          )}
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={vi.fn()}>Item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveAttribute('data-open', 'false')
    expect(trigger).toHaveTextContent('Open')

    fireEvent.click(trigger)
    await waitFor(() => {
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-open', 'true')
      expect(screen.getByTestId('trigger')).toHaveTextContent('Close')
    })
  })

  it('navigates items with ArrowDown', async () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button data-testid="trigger">Open</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={vi.fn()}>First</Dropdown.Item>
          <Dropdown.Item onClick={vi.fn()}>Second</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(screen.getByText('First').closest('[role="menuitem"]')).toHaveFocus()
  })

  it('applies custom className to menu', async () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button data-testid="trigger">Open</button>
        </Dropdown.Trigger>
        <Dropdown.Menu className="custom-menu-class">
          <Dropdown.Item onClick={vi.fn()}>Item</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    fireEvent.click(screen.getByTestId('trigger'))
    await waitFor(() => {
      expect(screen.getByRole('menu')).toHaveClass('custom-menu-class')
    })
  })
})

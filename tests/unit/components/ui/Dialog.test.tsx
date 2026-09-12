import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'

describe('Dialog', () => {
  it('renders DialogTrigger', () => {
    render(
      <Dialog open={false} onOpenChange={vi.fn()}>
        <DialogTrigger data-testid="trigger">Open</DialogTrigger>
      </Dialog>
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger')
  })

  it('renders DialogClose', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogClose data-testid="close">Close</DialogClose>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByTestId('close')).toHaveAttribute('data-slot', 'dialog-close')
  })

  it('renders DialogContent with children', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <p>Modal body content</p>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Modal body content')).toBeInTheDocument()
  })

  it('renders DialogContent without close button', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent showCloseButton={false}>Content</DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('renders DialogHeader', () => {
    const { container } = render(<DialogHeader>Header</DialogHeader>)
    const header = container.querySelector('[data-slot="dialog-header"]')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Header')
  })

  it('renders DialogFooter without close button by default', () => {
    const { container } = render(<DialogFooter>Footer</DialogFooter>)
    const footer = container.querySelector('[data-slot="dialog-footer"]')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('Footer')
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('renders DialogFooter with close button', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent showCloseButton={false}>
          <DialogFooter showCloseButton>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Close')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders DialogTitle inside dialog', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('renders DialogDescription inside dialog', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders full dialog with header/footer/content', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal Title</DialogTitle>
          </DialogHeader>
          <p>Modal body</p>
          <DialogFooter>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })
})

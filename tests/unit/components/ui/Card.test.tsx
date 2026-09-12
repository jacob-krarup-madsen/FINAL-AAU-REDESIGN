import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '@/components/ui/Card';
import { Star } from 'lucide-react';

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Hello World</Card>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies default variant class by default', () => {
    render(<Card>Content</Card>)
    // Matches the default variant class added via CVA
    const card = document.querySelector('.card--default')
    expect(card).toBeDefined()
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Card variant="elevated">Content</Card>)
    expect(document.querySelector('.card--elevated')).toBeDefined()

    rerender(<Card variant="outlined">Content</Card>)
    expect(document.querySelector('.card--outlined')).toBeDefined()

    rerender(<Card variant="brand">Content</Card>)
    expect(document.querySelector('.card--brand')).toBeDefined()
  })

  it('renders header when provided', () => {
    render(<Card><Card.Header data-testid="card-header">Header</Card.Header></Card>)
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(document.querySelector('.card__header')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(<Card><Card.Footer data-testid="card-footer">Footer</Card.Footer></Card>)
    expect(screen.getByTestId('card-footer')).toBeInTheDocument()
    expect(document.querySelector('.card__footer')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="my-custom-class">Content</Card>)
    expect(document.querySelector('.my-custom-class')).toBeDefined()
  })

  it('forwards additional props', () => {
    render(<Card data-testid="test-card" aria-label="Test Card">Content</Card>)
    const card = screen.getByTestId('test-card')
    expect(card).toHaveAttribute('aria-label', 'Test Card')
  })

  it('renders card__body when children are provided', () => {
    render(<Card><Card.Body>Test Content</Card.Body></Card>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(document.querySelector('.card__body')).toBeInTheDocument()
  })

  it('does not render card__body without children inside it', () => {
    const { container } = render(<Card><Card.Header>Header</Card.Header></Card>)
    expect(container.querySelector('.card__body')).not.toBeInTheDocument()
  })

  it('renders Decoration with icon', () => {
    const { container } = render(<Card><Card.Decoration icon={Star} /></Card>)
    expect(container.querySelector('.card__decoration')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders Decoration without icon', () => {
    const { container } = render(<Card><Card.Decoration /></Card>)
    expect(container.querySelector('.card__decoration')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('handles click and keyboard actions on interactive card', () => {
    const onClick = vi.fn()
    const { container } = render(<Card onClick={onClick}>Interactive</Card>)
    const card = container.firstChild as HTMLElement

    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(card, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(3)

    fireEvent.keyDown(card, { key: 'Escape' })
    expect(onClick).toHaveBeenCalledTimes(3)
  })
})

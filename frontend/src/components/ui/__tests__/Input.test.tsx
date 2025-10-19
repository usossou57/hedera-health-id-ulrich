import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { User } from 'lucide-react'
import Input from '../Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Test Label" />)
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Test" error="This field is required" />)
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('renders with icon', () => {
    render(<Input icon={<User data-testid="user-icon" />} />)
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('handles input changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
  })
})

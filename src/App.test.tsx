import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /simple rubik solver/i }),
    ).toBeInTheDocument()
  })

  it('shows the move list and count after shuffle then solve', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /shuffle/i }))
    fireEvent.click(screen.getByRole('button', { name: /solve/i }))
    expect(await screen.findByText(/\d+ moves/)).toBeInTheDocument()
    expect(screen.getByTestId('move-list')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  }, 60000)
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('plays the solution move by move and ends solved; Reset interrupts', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /shuffle/i }))
    fireEvent.click(screen.getByRole('button', { name: /solve/i }))
    await screen.findByText(/\d+ moves/)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    // Without WebGL (jsdom) each move commits immediately, so the queue drains and the list goes away.
    await waitFor(() => expect(screen.queryByTestId('move-list')).toBeNull())
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.queryByTestId('move-list')).toBeNull()
  }, 60000)
})

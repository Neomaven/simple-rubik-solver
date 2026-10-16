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
    // Without WebGL (jsdom) each move commits immediately, so Play runs straight to the end.
    await screen.findByText(/the cube is solved/i)
    expect(screen.getByTestId('move-list')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.queryByTestId('move-list')).toBeNull()
  }, 60000)

  it('steps with Next/Previous and Restart, highlighting the current move', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /shuffle/i }))
    fireEvent.click(screen.getByRole('button', { name: /solve/i }))
    await screen.findByText(/\d+ moves/)
    const total = screen.getByTestId('move-list').children.length
    expect(screen.getByTestId('step-status')).toHaveTextContent(`Step 1 of ${total}`)
    expect(screen.getByTestId('move-list').children[0]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByTestId('step-status')).toHaveTextContent(`Step 2 of ${total}`))
    expect(screen.getByTestId('move-list').children[1]).toHaveAttribute('aria-current', 'step')

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    await waitFor(() => expect(screen.getByTestId('step-status')).toHaveTextContent(`Step 1 of ${total}`))

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByTestId('step-status')).toHaveTextContent(`Step 2 of ${total}`))
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    await waitFor(() => expect(screen.getByTestId('step-status')).toHaveTextContent(`Step 1 of ${total}`))
  }, 60000)
})

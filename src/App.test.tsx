import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /simple rubik solver/i }),
    ).toBeInTheDocument()
  })

  it('lays out three panels: stacked by default, side by side from lg', () => {
    render(<App />)
    const layout = screen.getByTestId('layout')
    expect(layout).toHaveClass('grid-cols-1', 'lg:grid-cols-3')
    for (const id of ['panel-left', 'panel-center', 'panel-right']) {
      expect(layout).toContainElement(screen.getByTestId(id))
    }
    expect(screen.getByTestId('panel-left')).toContainElement(screen.getByRole('radiogroup', { name: /palette/i }))
    expect(screen.getByTestId('panel-center')).toContainElement(screen.getByRole('button', { name: /solve/i }))
  })

  it('shows a friendly message for an invalid cube', () => {
    render(<App />)
    // Recolour one non-centre sticker: colour counts become invalid.
    fireEvent.click(screen.getByRole('radio', { name: /red/i }))
    fireEvent.click(screen.getByLabelText('U sticker 0'))
    fireEvent.click(screen.getByRole('button', { name: /solve/i }))
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/exactly 9 times/i)
    expect(alert).not.toHaveTextContent(/appears \d+ times, expected/)
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

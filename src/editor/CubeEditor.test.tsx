import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { setSticker } from '../cube/edit'
import { solvedState, type Face } from '../cube/state'
import CubeEditor from './CubeEditor'

function Harness({ spy }: { spy?: (i: number, c: Face) => void }) {
  const [cube, setCube] = useState(solvedState())
  return (
    <CubeEditor
      cube={cube}
      onSetSticker={(i, c) => {
        spy?.(i, c)
        setCube(setSticker(cube, i, c))
      }}
    />
  )
}

describe('CubeEditor', () => {
  it('paints a non-center sticker and updates counts', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))
    fireEvent.click(screen.getByLabelText('U sticker 0'))
    expect(screen.getByLabelText('U sticker 0')).toHaveAttribute('data-color', 'R')
    expect(screen.getByTestId('count-R')).toHaveTextContent('10/9')
    expect(screen.getByTestId('count-U')).toHaveTextContent('8/9')
  })

  it('does not change a center', () => {
    const spy = vi.fn()
    render(<Harness spy={spy} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))
    const center = screen.getByLabelText('U sticker 4')
    fireEvent.click(center)
    expect(spy).not.toHaveBeenCalled()
    expect(center).toHaveAttribute('data-color', 'U')
    expect(screen.getByTestId('count-U')).toHaveTextContent('9/9')
  })
})

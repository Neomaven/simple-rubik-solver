import { fireEvent, render, screen } from '@testing-library/react'
import { GEOMETRY, solvedState } from '../cube/state'
import { FACE_COLORS } from './colors'
import CubeView from './CubeView'

const view = () => screen.getByTestId('cube-view')
const num = (name: string) => Number(view().getAttribute(name))

describe('CubeView', () => {
  it('renders the cube view with zoom buttons', () => {
    render(<CubeView cube={solvedState()} />)
    expect(screen.getByRole('img', { name: /rubik/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
  })

  it('orbits on pointer drag', () => {
    render(<CubeView cube={solvedState()} />)
    const before = num('data-azimuth')
    fireEvent.pointerDown(view(), { pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(view(), { pointerId: 1, clientX: 140, clientY: 100 })
    fireEvent.pointerUp(view(), { pointerId: 1 })
    expect(num('data-azimuth')).not.toBe(before)
  })

  it('zooms with the wheel and the buttons', () => {
    render(<CubeView cube={solvedState()} />)
    const start = num('data-distance')
    fireEvent.click(screen.getByRole('button', { name: /zoom in/i }))
    const closer = num('data-distance')
    expect(closer).toBeLessThan(start)
    fireEvent.click(screen.getByRole('button', { name: /zoom out/i }))
    expect(num('data-distance')).toBeGreaterThan(closer)
    fireEvent.wheel(view(), { deltaY: 100 })
    expect(num('data-distance')).toBeGreaterThan(start)
  })
})

describe('cube geometry and colours', () => {
  it('has 54 stickers over six faces, each with its own colour', () => {
    expect(GEOMETRY).toHaveLength(54)
    expect(new Set(GEOMETRY.map((g) => g.normal.join(','))).size).toBe(6)
    expect(new Set(Object.values(FACE_COLORS)).size).toBe(6)
  })
})

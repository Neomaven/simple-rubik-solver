import { act, renderHook } from '@testing-library/react'
import { useCubeStore } from './store'
import { applyMove, applyMoves, solvedState, type Move } from './state'

const moves: Move[] = [
  { face: 'R', turns: 1 },
  { face: 'U', turns: 2 },
  { face: 'F', turns: 3 },
]

describe('useCubeStore animation queue', () => {
  it('commits queued moves one at a time, in order', () => {
    const { result } = renderHook(() => useCubeStore())
    act(() => result.current.play(moves))
    expect(result.current.queue).toEqual(moves)
    expect(result.current.cube).toBe(solvedState())

    act(() => result.current.advance())
    expect(result.current.queue).toEqual(moves.slice(1))
    expect(result.current.cube).toBe(applyMove(solvedState(), moves[0]))

    act(() => result.current.advance())
    act(() => result.current.advance())
    expect(result.current.queue).toEqual([])
    expect(result.current.cube).toBe(applyMoves(solvedState(), moves))
  })

  it('reset interrupts the queue and restores the solved cube', () => {
    const { result } = renderHook(() => useCubeStore())
    act(() => result.current.play(moves))
    act(() => result.current.advance())
    act(() => result.current.reset())
    expect(result.current.queue).toEqual([])
    expect(result.current.cube).toBe(solvedState())
    act(() => result.current.advance()) // a late completion must do nothing
    expect(result.current.cube).toBe(solvedState())
  })

  it('shuffle also interrupts the queue', () => {
    const { result } = renderHook(() => useCubeStore())
    act(() => result.current.play(moves))
    act(() => result.current.shuffle())
    expect(result.current.queue).toEqual([])
  })
})

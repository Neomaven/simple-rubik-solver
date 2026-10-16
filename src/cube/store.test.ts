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

  it('steps through a solution forward, back and to the solved cube', () => {
    const scrambled = applyMoves(solvedState(), moves)
    const { result } = renderHook(() => useCubeStore(scrambled))
    act(() => result.current.solve())
    const solution = result.current.solution!
    expect(result.current.step).toBe(0)

    act(() => result.current.stepForward())
    expect(result.current.queue).toEqual([solution[0]])
    act(() => result.current.stepForward()) // ignored while animating
    expect(result.current.queue).toHaveLength(1)
    act(() => result.current.advance())
    expect(result.current.step).toBe(1)
    expect(result.current.cube).toBe(applyMove(scrambled, solution[0]))

    act(() => result.current.stepBack())
    act(() => result.current.advance())
    expect(result.current.step).toBe(0)
    expect(result.current.cube).toBe(scrambled)

    for (let i = 0; i < solution.length; i++) {
      act(() => result.current.stepForward())
      act(() => result.current.advance())
    }
    expect(result.current.step).toBe(solution.length)
    expect(result.current.cube).toBe(solvedState())
    expect(result.current.solution).toEqual(solution)

    act(() => result.current.restart())
    expect(result.current.step).toBe(0)
    expect(result.current.cube).toBe(scrambled)
  }, 60000)

  it('shuffle also interrupts the queue', () => {
    const { result } = renderHook(() => useCubeStore())
    act(() => result.current.play(moves))
    act(() => result.current.shuffle())
    expect(result.current.queue).toEqual([])
  })
})

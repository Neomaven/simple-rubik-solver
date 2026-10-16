// Shared cube state for the UI: the cube, the last solve error and the solution.

import { useCallback, useState } from 'react'
import { shuffleCube } from './shuffle'
import { solveCube } from './solver'
import { setSticker } from './edit'
import { applyMove, solvedState, type CubeState, type Face, type Move } from './state'
import type { ValidationError } from './validate'

export interface CubeStore {
  cube: CubeState
  error: ValidationError | null
  solution: Move[] | null
  /** Moves still to be animated; the head is the one currently turning. */
  queue: Move[]
  setCube: (state: CubeState) => void
  /** Recolor one sticker; centers are ignored. */
  editSticker: (index: number, color: Face) => void
  solve: () => void
  shuffle: () => void
  /** Stop any animation and go back to the solved cube. */
  reset: () => void
  /** Animate the moves one after another, committing each to the state as it finishes. */
  play: (moves: Move[]) => void
  advance: () => void
}

export function useCubeStore(initial: CubeState = solvedState()): CubeStore {
  const [cube, setCubeState] = useState<CubeState>(initial)
  const [error, setError] = useState<ValidationError | null>(null)
  const [solution, setSolution] = useState<Move[] | null>(null)

  const [queue, setQueue] = useState<Move[]>([])

  // Any direct change of the cube interrupts a running animation queue.
  const setCube = useCallback((state: CubeState) => {
    setQueue([])
    setCubeState(state)
    setError(null)
    setSolution(null)
  }, [])

  const editSticker = useCallback(
    (index: number, color: Face) => setCube(setSticker(cube, index, color)),
    [cube, setCube],
  )

  const reset = useCallback(() => setCube(solvedState()), [setCube])

  const play = useCallback((moves: Move[]) => setQueue(moves), [])

  /** Called when the animation of the head of the queue has finished: commit it to the state. */
  const advance = useCallback(() => {
    if (queue.length === 0) return
    setCubeState(applyMove(cube, queue[0]))
    setQueue(queue.slice(1))
    if (queue.length === 1) setSolution(null)
  }, [cube, queue])

  const solve = useCallback(() => {
    const result = solveCube(cube)
    if (result.ok) {
      setError(null)
      setSolution(result.moves)
    } else {
      setError(result.error)
      setSolution(null)
    }
  }, [cube])

  const shuffle = useCallback(() => setCube(shuffleCube(cube)), [cube, setCube])

  return { cube, error, solution, queue, setCube, editSticker, solve, shuffle, reset, play, advance }
}

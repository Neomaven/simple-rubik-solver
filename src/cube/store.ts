// Shared cube state for the UI: the cube, the last solve error and the solution.

import { useCallback, useState } from 'react'
import { shuffleCube } from './shuffle'
import { solveCube } from './solver'
import { setSticker } from './edit'
import { invertMove } from './notation'
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
  /** Number of solution moves already applied (0..solution.length). */
  step: number
  stepForward: () => void
  stepBack: () => void
  /** Return to the cube as it was when the solution was computed. */
  restart: () => void
}

export function useCubeStore(initial: CubeState = solvedState()): CubeStore {
  const [cube, setCubeState] = useState<CubeState>(initial)
  const [error, setError] = useState<ValidationError | null>(null)
  const [solution, setSolution] = useState<Move[] | null>(null)

  const [queue, setQueue] = useState<Move[]>([])
  const [step, setStep] = useState(0)
  // +1 / -1 while a solution step is animating, 0 for plain `play`.
  const [direction, setDirection] = useState<0 | 1 | -1>(0)
  const [origin, setOrigin] = useState<CubeState | null>(null)

  // Any direct change of the cube interrupts a running animation queue.
  const setCube = useCallback((state: CubeState) => {
    setQueue([])
    setDirection(0)
    setStep(0)
    setOrigin(null)
    setCubeState(state)
    setError(null)
    setSolution(null)
  }, [])

  const editSticker = useCallback(
    (index: number, color: Face) => setCube(setSticker(cube, index, color)),
    [cube, setCube],
  )

  const reset = useCallback(() => setCube(solvedState()), [setCube])

  const play = useCallback((moves: Move[]) => {
    setDirection(0)
    setQueue(moves)
  }, [])

  /** Animate the next solution move (no-op while animating or at the end). */
  const stepForward = useCallback(() => {
    if (!solution || queue.length > 0 || step >= solution.length) return
    setDirection(1)
    setQueue([solution[step]])
  }, [solution, queue, step])

  /** Animate the previous solution move in reverse. */
  const stepBack = useCallback(() => {
    if (!solution || queue.length > 0 || step <= 0) return
    setDirection(-1)
    setQueue([invertMove(solution[step - 1])])
  }, [solution, queue, step])

  /** Go back to the cube as it was when the solution was computed, at step 0. */
  const restart = useCallback(() => {
    if (!solution || origin === null) return
    setQueue([])
    setDirection(0)
    setStep(0)
    setCubeState(origin)
  }, [solution, origin])

  /** Called when the animation of the head of the queue has finished: commit it to the state. */
  const advance = useCallback(() => {
    if (queue.length === 0) return
    setCubeState(applyMove(cube, queue[0]))
    setQueue(queue.slice(1))
    if (direction !== 0) setStep(step + direction)
  }, [cube, queue, direction, step])

  const solve = useCallback(() => {
    const result = solveCube(cube)
    if (result.ok) {
      setError(null)
      setSolution(result.moves)
      setStep(0)
      setDirection(0)
      setOrigin(cube)
    } else {
      setError(result.error)
      setSolution(null)
    }
  }, [cube])

  const shuffle = useCallback(() => setCube(shuffleCube(cube)), [cube, setCube])

  return {
    cube,
    error,
    solution,
    queue,
    step,
    setCube,
    editSticker,
    solve,
    shuffle,
    reset,
    play,
    advance,
    stepForward,
    stepBack,
    restart,
  }
}

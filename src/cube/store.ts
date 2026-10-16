// Shared cube state for the UI: the cube, the last solve error and the solution.

import { useCallback, useState } from 'react'
import { shuffleCube } from './shuffle'
import { solveCube } from './solver'
import { solvedState, type CubeState, type Move } from './state'
import type { ValidationError } from './validate'

export interface CubeStore {
  cube: CubeState
  error: ValidationError | null
  solution: Move[] | null
  setCube: (state: CubeState) => void
  solve: () => void
  shuffle: () => void
}

export function useCubeStore(initial: CubeState = solvedState()): CubeStore {
  const [cube, setCubeState] = useState<CubeState>(initial)
  const [error, setError] = useState<ValidationError | null>(null)
  const [solution, setSolution] = useState<Move[] | null>(null)

  const setCube = useCallback((state: CubeState) => {
    setCubeState(state)
    setError(null)
    setSolution(null)
  }, [])

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

  return { cube, error, solution, setCube, solve, shuffle }
}

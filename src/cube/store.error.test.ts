import { act, renderHook } from '@testing-library/react'
import { useCubeStore } from './store'

vi.mock('./solver', () => ({
  solveCube: () => {
    throw new Error('boom')
  },
}))

describe('useCubeStore solver failures', () => {
  it('turns a thrown solver error into a SOLVER error and no solution', () => {
    const { result } = renderHook(() => useCubeStore())
    act(() => result.current.solve())
    expect(result.current.error?.code).toBe('SOLVER')
    expect(result.current.solution).toBeNull()
  })
})

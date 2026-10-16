import { applyMoves, isSolved, parseAlgorithm, solvedState } from '../cube'
import { createSolverClient, type WorkerLike } from './client'
import { handleMessage } from './core'
import { SolverError, type SolverRequest, type SolverResponse } from './protocol'

const scrambled = applyMoves(solvedState(), parseAlgorithm("R U R' U' F2 D L B'"))

/** Fake worker that answers asynchronously using the real handler. */
function fakeWorker(): WorkerLike {
  const w: WorkerLike = {
    onmessage: null,
    onerror: null,
    onmessageerror: null,
    postMessage(req: SolverRequest) {
      setTimeout(() => w.onmessage?.({ data: handleMessage(req) } as MessageEvent<SolverResponse>), 0)
    },
    terminate() {},
  }
  return w
}

describe('solver core', () => {
  it('answers init', () => {
    expect(handleMessage({ id: 1, type: 'init' })).toEqual({ id: 1, type: 'ready' })
  })

  it('solves a valid scrambled state', () => {
    const res = handleMessage({ id: 2, type: 'solve', state: scrambled })
    if (res.type !== 'solved') throw new Error('expected solved')
    expect(isSolved(applyMoves(scrambled, res.moves))).toBe(true)
  })

  it('returns no moves for a solved cube', () => {
    expect(handleMessage({ id: 3, type: 'solve', state: solvedState() })).toEqual({
      id: 3,
      type: 'solved',
      moves: [],
    })
  })

  it('reports invalid states as validation errors', () => {
    const res = handleMessage({ id: 4, type: 'solve', state: 'U' })
    expect(res).toMatchObject({ type: 'error', code: 'VALIDATION' })
  })
})

describe('solver client', () => {
  it('returns moves asynchronously', async () => {
    const client = createSolverClient(fakeWorker)
    await client.init()
    const moves = await client.solve(scrambled)
    expect(isSolved(applyMoves(scrambled, moves))).toBe(true)
  })

  it('rejects with a SolverError for invalid states', async () => {
    const client = createSolverClient(fakeWorker)
    await expect(client.solve('bad')).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('surfaces a friendly error on worker failure', async () => {
    const w: WorkerLike = { ...fakeWorker(), postMessage: () => {} }
    const client = createSolverClient(() => w)
    const p = client.solve(scrambled)
    w.onerror?.(new Event('error'))
    await expect(p).rejects.toBeInstanceOf(SolverError)
    await expect(p).rejects.toMatchObject({ code: 'WORKER_FAILURE', message: expect.stringContaining('try again') })
  })

  it('surfaces an error when the worker cannot be created', async () => {
    const client = createSolverClient(() => {
      throw new Error('no worker')
    })
    await expect(client.init()).rejects.toMatchObject({ code: 'WORKER_FAILURE' })
  })
})

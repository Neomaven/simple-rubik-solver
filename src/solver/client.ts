import type { Move } from '../cube'
import { SolverError, type SolverRequest, type SolverResponse } from './protocol'

export interface WorkerLike {
  onmessage: ((event: MessageEvent<SolverResponse>) => void) | null
  onerror: ((event: Event) => void) | null
  onmessageerror: ((event: MessageEvent) => void) | null
  postMessage(message: SolverRequest): void
  terminate(): void
}

export interface SolverClient {
  /** Start loading the solver tables; resolves once ready. Safe to call repeatedly. */
  init(): Promise<void>
  solve(state: string): Promise<Move[]>
  terminate(): void
}

const FAILURE_MESSAGE = 'The solver stopped unexpectedly. Please reload and try again.'

const defaultFactory = (): WorkerLike =>
  new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike

export function createSolverClient(factory: () => WorkerLike = defaultFactory): SolverClient {
  let worker: WorkerLike | null = null
  let nextId = 1
  let initPromise: Promise<void> | null = null
  const pending = new Map<number, { resolve: (r: SolverResponse) => void; reject: (e: SolverError) => void }>()

  function failAll() {
    const error = new SolverError('WORKER_FAILURE', FAILURE_MESSAGE)
    for (const p of pending.values()) p.reject(error)
    pending.clear()
    worker?.terminate()
    worker = null
    initPromise = null
  }

  function request(req: Omit<SolverRequest, 'id'>): Promise<SolverResponse> {
    return new Promise((resolve, reject) => {
      if (!worker) {
        try {
          worker = factory()
        } catch {
          reject(new SolverError('WORKER_FAILURE', FAILURE_MESSAGE))
          return
        }
        worker.onmessage = (event) => {
          const p = pending.get(event.data.id)
          if (!p) return
          pending.delete(event.data.id)
          p.resolve(event.data)
        }
        worker.onerror = failAll
        worker.onmessageerror = failAll
      }
      const id = nextId++
      pending.set(id, { resolve, reject })
      worker.postMessage({ ...req, id } as SolverRequest)
    })
  }

  function unwrap(res: SolverResponse): SolverResponse {
    if (res.type === 'error') throw new SolverError(res.code, res.message)
    return res
  }

  return {
    init() {
      initPromise ??= request({ type: 'init' }).then(unwrap).then(() => undefined)
      initPromise.catch(() => {})
      return initPromise
    },
    async solve(state) {
      const res = unwrap(await request({ type: 'solve', state }))
      return res.type === 'solved' ? res.moves : []
    },
    terminate() {
      failAll()
    },
  }
}

import { formatMove } from './cube'
import { useCubeStore } from './cube/store'
import CubeView from './view/CubeView'

export default function App() {
  const { cube, error, solution, queue, solve, shuffle, reset, play, advance } = useCubeStore()

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Simple Rubik Solver</h1>
      <CubeView cube={cube} queue={queue} onMoveDone={advance} />
      <div className="flex gap-2">
        <button className="rounded bg-blue-600 px-4 py-2" onClick={solve}>
          Solve
        </button>
        <button className="rounded bg-slate-600 px-4 py-2" onClick={shuffle}>
          Shuffle
        </button>
        <button className="rounded bg-slate-600 px-4 py-2" onClick={reset}>
          Reset
        </button>
        {solution && solution.length > 0 && (
          <button
            className="rounded bg-green-600 px-4 py-2 disabled:opacity-50"
            disabled={queue.length > 0}
            onClick={() => play(solution)}
          >
            Play
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-red-400">
          {error.message}
        </p>
      )}
      {solution && (
        <section aria-label="Solution">
          <p>{solution.length === 0 ? 'Already solved (0 moves)' : `${solution.length} moves`}</p>
          <ol className="flex flex-wrap gap-2" data-testid="move-list">
            {solution.map((move, i) => (
              <li key={i}>{formatMove(move)}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  )
}

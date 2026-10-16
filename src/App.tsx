import { friendlyError } from './cube/errors'
import { useCubeStore } from './cube/store'
import CubeEditor from './editor/CubeEditor'
import SolutionPlayer from './player/SolutionPlayer'
import CubeView from './view/CubeView'

export default function App() {
  const { cube, error, solution, queue, step, editSticker, solve, shuffle, reset, advance, stepForward, stepBack, restart } =
    useCubeStore()

  const panel = 'flex min-w-0 flex-col items-center gap-4'

  return (
    <main className="min-h-screen bg-slate-900 p-4 text-white">
      <h1 className="mb-4 text-center text-2xl font-bold sm:text-3xl">Simple Rubik Solver</h1>
      {/* Stacked on mobile; three side-by-side panels from the lg breakpoint. */}
      <div data-testid="layout" className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        <section aria-label="Cube setup" data-testid="panel-left" className={panel}>
          <CubeEditor cube={cube} onSetSticker={editSticker} />
        </section>
        <section aria-label="Cube view" data-testid="panel-center" className={panel}>
          <CubeView cube={cube} queue={queue} onMoveDone={advance} />
          <div className="flex flex-wrap justify-center gap-2">
            <button className="rounded bg-blue-600 px-4 py-2" onClick={solve}>
              Solve
            </button>
            <button className="rounded bg-slate-600 px-4 py-2" onClick={shuffle}>
              Shuffle
            </button>
            <button className="rounded bg-slate-600 px-4 py-2" onClick={reset}>
              Reset
            </button>
          </div>
          {error && (
            <p role="alert" className="text-center text-red-400">
              {friendlyError(error)}
            </p>
          )}
        </section>
        <div data-testid="panel-right" className={panel}>
          {solution ? (
            <SolutionPlayer
              moves={solution}
              step={step}
              busy={queue.length > 0}
              onNext={stepForward}
              onPrevious={stepBack}
              onRestart={restart}
            />
          ) : (
            <p className="text-center text-slate-400">Press Solve to see the step-by-step solution here.</p>
          )}
        </div>
      </div>
    </main>
  )
}

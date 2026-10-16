import { useCubeStore } from './cube/store'
import CubeEditor from './editor/CubeEditor'
import SolutionPlayer from './player/SolutionPlayer'
import CubeView from './view/CubeView'

export default function App() {
  const { cube, error, solution, queue, step, editSticker, solve, shuffle, reset, advance, stepForward, stepBack, restart } =
    useCubeStore()

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Simple Rubik Solver</h1>
      <CubeView cube={cube} queue={queue} onMoveDone={advance} />
      <CubeEditor cube={cube} onSetSticker={editSticker} />
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
      </div>
      {error && (
        <p role="alert" className="text-red-400">
          {error.message}
        </p>
      )}
      {solution && (
        <SolutionPlayer
          moves={solution}
          step={step}
          busy={queue.length > 0}
          onNext={stepForward}
          onPrevious={stepBack}
          onRestart={restart}
        />
      )}
    </main>
  )
}

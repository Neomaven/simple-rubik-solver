import { useEffect, useState } from 'react'
import { formatMove, type Move } from '../cube'

const FACE_NAMES = { U: 'Up', R: 'Right', F: 'Front', D: 'Down', L: 'Left', B: 'Back' } as const

export function describeMove(move: Move): string {
  const face = `${FACE_NAMES[move.face]} face`
  if (move.turns === 2) return `Turn the ${face} a half turn (180°).`
  return `Turn the ${face} a quarter turn ${move.turns === 1 ? 'clockwise' : 'counter-clockwise'}.`
}

interface Props {
  moves: Move[]
  /** Number of moves already applied. */
  step: number
  /** True while a move is animating. */
  busy: boolean
  onNext: () => void
  onPrevious: () => void
  onRestart: () => void
}

/** Move list, step counter, instruction and Previous/Next/Play/Pause/Restart controls. */
export default function SolutionPlayer({ moves, step, busy, onNext, onPrevious, onRestart }: Props) {
  const [playing, setPlaying] = useState(false)
  const total = moves.length
  const atEnd = step >= total

  // While playing, start the next move as soon as the previous one has finished.
  useEffect(() => {
    if (!playing || busy) return
    if (atEnd) setPlaying(false)
    else onNext()
  }, [playing, busy, atEnd, step, onNext])

  const pause = () => setPlaying(false)
  const button = 'rounded bg-slate-600 px-3 py-1 disabled:opacity-50'

  return (
    <section aria-label="Solution">
      <p>{total === 0 ? 'Already solved (0 moves)' : `${total} moves`}</p>
      {total > 0 && (
        <>
          <ol className="flex flex-wrap gap-2" data-testid="move-list">
            {moves.map((move, i) => (
              <li
                key={i}
                aria-current={i === step ? 'step' : undefined}
                className={i === step ? 'rounded bg-green-600 px-1 font-bold' : i < step ? 'text-slate-400' : ''}
              >
                {formatMove(move)}
              </li>
            ))}
          </ol>
          <p data-testid="step-status">Step {Math.min(step + 1, total)} of {total}</p>
          <p data-testid="instruction">{atEnd ? 'Done — the cube is solved.' : describeMove(moves[step])}</p>
          <div className="flex flex-wrap gap-2">
            <button
              className={button}
              disabled={busy || step === 0}
              onClick={() => {
                pause()
                onPrevious()
              }}
            >
              Previous
            </button>
            <button className={button} disabled={busy || atEnd} onClick={() => { pause(); onNext() }}>
              Next
            </button>
            {playing ? (
              <button className={button} onClick={pause}>
                Pause
              </button>
            ) : (
              <button className={button} disabled={atEnd} onClick={() => setPlaying(true)}>
                Play
              </button>
            )}
            <button
              className={button}
              disabled={step === 0 && !busy}
              onClick={() => {
                pause()
                onRestart()
              }}
            >
              Restart
            </button>
          </div>
        </>
      )}
    </section>
  )
}

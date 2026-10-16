import { handleMessage } from './core'
import type { SolverRequest } from './protocol'

self.onmessage = (event: MessageEvent<SolverRequest>) => {
  self.postMessage(handleMessage(event.data))
}

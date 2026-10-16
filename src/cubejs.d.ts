declare module 'cubejs' {
  export default class Cube {
    constructor(other?: Cube)
    isSolved(): boolean
    solve(maxDepth?: number): string
    move(algorithm: string): this
    clone(): Cube
    asString(): string
    static initSolver(): void
    static fromString(str: string): Cube
    static random(): Cube
    static scramble(): string
  }
}

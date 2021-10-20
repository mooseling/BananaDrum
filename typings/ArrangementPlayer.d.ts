declare interface ArrangementPlayer {
  play(): void
  loop(turnLoopingOn?:boolean): void
}

declare interface NotePlayHistory {
  record(noteEvent:NoteEvent, loopNumber:number): void
  check(noteEvent:NoteEvent, loopNumber:number): boolean
}

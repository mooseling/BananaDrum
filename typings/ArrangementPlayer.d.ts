declare interface ArrangementPlayer {
  play(): void
  pause(): void
  loop(turnLoopingOn?:boolean): void
}

declare interface NoteEvent {
  realTime: RealTime
  note: Note
}

declare interface NotePlayHistory {
  record(noteEvent:NoteEvent, loopNumber:number): void
  check(noteEvent:NoteEvent, loopNumber:number): boolean
}

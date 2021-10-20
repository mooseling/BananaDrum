declare interface UntimedNote {
  instrument: Instrument,
  noteStyle: NoteStyle,
  audioBuffer: AudioBuffer
}
declare interface Note extends UntimedNote {
  timing: string
}

declare interface NoteEvent {
  realTime: number,
  note: Note
}

declare interface NoteEventSource {
  getNoteEvents(interval:Interval): NoteEvent[]
}

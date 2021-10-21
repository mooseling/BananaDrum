declare interface UntimedNote {
  instrument: Instrument,
  noteStyle: NoteStyle,
  audioBuffer: AudioBuffer
}
declare interface Note extends UntimedNote {
  timing: Timing
}

declare interface NoteEvent {
  realTime: RealTime,
  note: Note
}

declare interface NoteEventSource {
  getNoteEvents(interval:Interval): NoteEvent[]
}

declare type Timing = string
declare type RealTime = number

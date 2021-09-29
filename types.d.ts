declare interface PlayableNote {
  time: number,
  audioBuffer: AudioBuffer
}

declare interface NoteSource {
  getNotes(intervalStart: number, intervalEnd: number): PlayableNote[]
}

declare interface PlayableNote {
  time: number,
  audioBuffer: AudioBuffer
}

declare interface NoteSource {
  getNotes(startTime: number, endTime: number): PlayableNote[]
}

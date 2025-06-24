// The goal here is to have intermediate objects which capture the state of the composition
// They will be used for share links, undo/redo, and tab state preservation
// Tab state preservation may require saving objects into history.state, so must be serialisable/simple

export interface ArrangementSnapshot {
  title: string
  timeParams: TimeParamsSnapshot
  tracks: TrackSnapshot[]
}

export interface TrackSnapshot {
  id: number
  instrumentId: string
  notes: string[]
  polyrhythms: PolyrhythmSnapshot[]
}

export interface PolyrhythmSnapshot {
  id: number
  start: number
  end: number
  length: number
}

export interface TimeParamsSnapshot {
  timeSignature: string,
  tempo: number,
  length: number,
  pulse: string,
  stepResolution: number
}


// The main purpose of this object is to turn into a shareable link
// So the properties line up with what will be separate query params
export interface SerialisedArrangement {
  title: string
  composition: string
  version: number
}

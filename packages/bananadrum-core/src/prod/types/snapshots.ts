export interface ArrangementSnapshot {
  title: string
  timeParams: TimeParamsSnapshot
  tracks: TrackSnapshot[]
}

export interface TrackSnapshot {
  id: number
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
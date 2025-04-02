import { ArrangementView, Instrument, NoteStyle, NoteView, PolyrhythmView, TimeParamsView, TrackView } from './types'


export interface EditCommand_ArrangementTitle {
  arrangement: ArrangementView
  newTitle: string
}

export interface EditCommand_ArrangementAddTrack {
  arrangement: ArrangementView
  addTrack: Instrument
}

export interface EditCommand_ArrangementRemoveTrack {
  arrangement: ArrangementView
  removeTrack: TrackView
}

export interface EditCommand_ArrangementClear {
  arrangement: ArrangementView
  command: 'clear all tracks'
}

export interface EditCommand_ArrangementClearSelection {
  arrangement: ArrangementView
  clearSelection: Map<TrackView, {selectedNotes: Set<NoteView>}>
}

export interface EditCommand_ArrangementAddPolyrhythms {
  arrangement: ArrangementView
  addPolyrhythms: {
    length: number
    selection: Map<TrackView, {range:[NoteView, NoteView]}>
  }
}

export interface EditCommand_TrackRemovePolyrhythm {
  track: TrackView
  removePolyrhythm: PolyrhythmView
}

export interface EditCommand_TrackClear {
  track: TrackView
  command: 'clear'
}

export interface EditCommand_Note {
  note: NoteView
  noteStyle: NoteStyle
}

export interface EditCommand_TimeParamsTimeSignature {
  timeParams: TimeParamsView
  timeSignature: string
  pulse: string
  stepResolution: number
}

export interface EditCommand_TimeParamsTempo {
  timeParams: TimeParamsView
  tempo: number
}

export interface EditCommand_TimeParamsLength {
  timeParams: TimeParamsView
  length: number
}

// We would really like to use "exclusive or" in the union types below, but TypeScript doesn't currently support this
// Support may come, so rather than try to enforce it, we're keeping things simple for now
// Possible approach: https://effectivetypescript.com/2021/11/11/optional-never/
// Or libraries: ts-xor, ts-essentials

export type EditCommand_Arrangement =
  EditCommand_ArrangementTitle
  | EditCommand_ArrangementAddPolyrhythms
  | EditCommand_ArrangementAddTrack
  | EditCommand_ArrangementRemoveTrack
  | EditCommand_ArrangementClear
  | EditCommand_ArrangementClearSelection

export type EditCommand_Track =
  EditCommand_TrackRemovePolyrhythm
  | EditCommand_TrackClear

export type EditCommand_TimeParams =
  EditCommand_TimeParamsTempoChange
  | EditCommand_TimeParamsTimeSignature
  | EditCommand_TimeParamsTempo
  | EditCommand_TimeParamsLength

export type EditCommand = 
  EditCommand_Arrangement
  | EditCommand_Track
  | EditCommand_Note
  | EditCommand_TimeParams

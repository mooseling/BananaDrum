import { ArrangementView, InstrumentMeta, NoteStyle, NoteView, Polyrhythm, TimeParamsView, TrackView } from './types'


export interface EditCommand_ArrangementChangeTitle {
  arrangement: ArrangementView
  newTitle: string
}

export interface EditCommand_ArrangementChangeAddTrack {
  arrangement: ArrangementView
  addTrack: InstrumentMeta
}

export interface EditCommand_ArrangementChangeRemoveTrack {
  arrangement: ArrangementView
  removeTrack: TrackView
}

export interface EditCommand_ArrangementChangeClear {
  arrangement: ArrangementView
  command: 'clear all tracks'
}

export interface EditCommand_TrackAddPolyrhythm {
  track: TrackView
  addPolyrhythm: {
    start: NoteView
    end: NoteView
    length: number
  }
}

export interface EditCommand_TrackRemovePolyrhythm {
  track: TrackView
  removePolyrhythm: Polyrhythm
}

export interface EditCommand_TrackClear {
  track: TrackView
  command: 'clear'
}

export interface EditCommand_Note {
  note: NoteView
  noteStyle: NoteStyle
}

export interface EditCommand_TimeParamsTempoChange {
  timeParams: TimeParamsView

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

export type EditCommand_Arrangement =
  EditCommand_ArrangementChangeTitle
  | EditCommand_ArrangementChangeAddTrack
  | EditCommand_ArrangementChangeRemoveTrack
  | EditCommand_ArrangementChangeClear

export type EditCommand_Track =
  EditCommand_TrackAddPolyrhythm
  | EditCommand_TrackRemovePolyrhythm
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
declare interface PackedTimeParams {
  timeSignature: string
  tempo: number
  length: number
}

declare interface TimeParams extends PackedTimeParams, Publisher {
  isValid(timing:Timing): boolean
}

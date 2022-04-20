declare namespace Banana {
  interface PackedTimeParams {
    timeSignature: string
    tempo: number
    length: number
    pulse: string
    stepResolution: number
  }

  interface TimeParams extends PackedTimeParams, Subscribable {
    isValid(timing:Timing): boolean
    readonly timings: Timing[]
  }
}

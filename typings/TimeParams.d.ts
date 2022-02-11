declare namespace Banana {
  interface PackedTimeParams {
    timeSignature: string
    tempo: number
    length: number
  }

  interface TimeParams extends PackedTimeParams, Subscribable {
    isValid(timing:Timing): boolean
  }
}

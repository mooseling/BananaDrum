declare interface PackedTimeParams {
  timeSignature: string
  tempo: number
  length: number
}

declare type TimeParams = PackedTimeParams & Publisher

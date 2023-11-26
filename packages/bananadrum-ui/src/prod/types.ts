import { RealTime, Subscribable } from 'bananadrum-core'
import { BananaDrumPlayer, EventEngineState } from 'bananadrum-player'

export interface BananaDrumUi {
  bananaDrumPlayer: BananaDrumPlayer
  wrapper: HTMLElement
}

export interface AnimationEngine extends Subscribable {
  connect(animation:(realTime:RealTime) => void): void
  disconnect(animation:(realTime:RealTime) => void): void
  get state(): EventEngineState
}
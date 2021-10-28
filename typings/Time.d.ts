// Unfortunately we can't declare anything to be an integer
declare type TripletExtension = ''|'T'|'TT'
declare type TimingBit = `${number}${TripletExtension}`
declare type OptionalTimingBit = ``|`.${TimingBit}`

// Timings are bars.beats.sixteenths, and can be extended to bars.beats.sixteenths.sixtyfourths
declare type Timing = `${TimingBit}.${TimingBit}.${TimingBit}${OptionalTimingBit}`
declare type RealTime = number

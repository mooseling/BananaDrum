// Timings are in the format #.#.#(.#)
// Which is bars.beats.sixteenths(.sixtyfourths)
// I refer to a each # as a bit, or timing-bit
// Bits are integers
// Bits can be modified by appending 'T' or 'TT' to indicate triplets

// I tried to enforce the above using unions of primitive types
// The error messages then enumerated all possbible string formats
// And this was way too annoying and noisy

declare type Timing = string
declare type RealTime = number


// =========== Thoughts on triplets ===========
// The format begs the question: how do we notate other polyrhythms?
// (A whole track which is polyrhythmic to the piece is a separate issue)
// Triplets should be the most common special case of timing
// And our format sort of matches up with dotted notes in western music

// One idea is to chance 'T' to (3)
// So something like 2.1T.1 becomes 2.1(3).1
// It's natural to extend this to other fractions of beats

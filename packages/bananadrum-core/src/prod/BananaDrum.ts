import { createArrangement, unpackArrangement } from "./Arrangement";
import { urlDecodeArrangement } from "./compression";
import { Library } from "./Library";
import { Arrangement, BananaDrum, PackedInstrument } from "./types";


export function createBananaDrum(instrumentCollection?:PackedInstrument[], compressedArrangement?:string): BananaDrum {
  if (compressedArrangement) {
    if (instrumentCollection)
      Library.load(instrumentCollection);
    
    const arrangement = getNewArrangement(compressedArrangement);
    
    return {library: Library, arrangement};
  }
}


function getNewArrangement(compressedArrangement?:string): Arrangement {
  if (compressedArrangement) {
    const packedArrangement = urlDecodeArrangement(compressedArrangement);
    return unpackArrangement(packedArrangement);
  }
  return createArrangement();
}
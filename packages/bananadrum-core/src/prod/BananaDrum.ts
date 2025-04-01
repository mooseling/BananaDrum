import { deserialiseArrangement } from "./serialisation.js";
import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types/types.js";
import { EditCommand } from './types/edit_commands.js';


export function createBananaDrum(
  instrumentCollection:PackedInstrument[], toLoad:{serialisedArrangement:string, version:number, title?:string}
): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangement = deserialiseArrangement(toLoad.serialisedArrangement, toLoad.version, toLoad.title);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function edit(command:EditCommand) {}

  return {library, arrangement, edit};
}

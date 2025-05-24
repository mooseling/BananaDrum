import { ArrangementSnapshot } from '../types/snapshots.js';
import { baseUrl } from './constants.js';
import { serialiseArrangementSnapshot, SerialisedArrangement } from './serialisers.js';



// We generate a share link from a snapshot so we can generate it from the undo-redo stack
export function getShareLink(arrangementSnapshot:ArrangementSnapshot): string {
  const serialisedArrangement = serialiseArrangementSnapshot(arrangementSnapshot);
  const compositionParam = `a${serialisedArrangement.version}=${serialisedArrangement.composition}`;

  if (serialisedArrangement.title)
    return `${baseUrl}?t=${encodeURIComponent(serialisedArrangement.title)}&${compositionParam}`;

  return `${baseUrl}?${compositionParam}`;
}


export function getSerialisedArrangementFromParams(searchParams:URLSearchParams): SerialisedArrangement {
  const title = searchParams.get('t') || undefined; // SearchParams.get can return null, but we prefer undefined

  if (searchParams.get('a2'))
    return {composition:searchParams.get('a2'), version:2, title};

  if (searchParams.get('a'))
    return {composition:searchParams.get('a'), version:1, title};

  return null;
}

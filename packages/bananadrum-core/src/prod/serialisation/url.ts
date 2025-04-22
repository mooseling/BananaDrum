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

  const sharedArrangement2 = searchParams.get('a2');
  if (sharedArrangement2)
    return {composition:sharedArrangement2, version:2, title};

  const sharedArrangementV1 = searchParams.get('a');
  if (sharedArrangementV1)
    return {composition:sharedArrangementV1, version:1, title};

  return null;
}
import { ArrangementSnapshot } from '../types/snapshots';
import { baseUrl } from './constants';
import { serialiseArrangementSnapshot, SerialisedArrangement } from './serialisers';



// We generate a share link from a snapshot so we can generate it from the undo-redo stack
export function getShareLink(arrangementSnapshot:ArrangementSnapshot): string {
  const serialisedArrangement = serialiseArrangementSnapshot(arrangementSnapshot);
  const compositionTag = 'a' + serialisedArrangement.version;

  if (serialisedArrangement.title)
    return `${baseUrl}?t=${encodeURIComponent(serialisedArrangement.title)}&${compositionTag}=${serialisedArrangement.composition}`;

  return `${baseUrl}?${compositionTag}=${serialisedArrangement}`;
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
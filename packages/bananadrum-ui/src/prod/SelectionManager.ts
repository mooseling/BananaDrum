import { createPublisher, Note, Subscribable, Track } from "bananadrum-core";

export interface SelectionManager extends Subscribable {
  handleClick(note:Note): void
  deselectAll(): void
  selectedNotes: Note[]
  trackRanges: Map<Track, [Note, Note]>
}

export function createSelectionManager(): SelectionManager {
  const publisher = createPublisher();
  const selectedNotes:Note[] = [];
  const trackRanges:Map<Track, [Note, Note]> = new Map();
  let anchor:Note|null = null;

  return {
    handleClick, deselectAll, selectedNotes, trackRanges,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };


  function startSelection(note:Note) {
    selectedNotes.push(note);
    anchor = note;
    trackRanges[note.track.id] = [note, note];
    publisher.publish();
  }


  function handleClick(clickedNote:Note) {
    if (!selectedNotes.length) {
      startSelection(clickedNote);
      return;
    }

    if (clickedNote === anchor) {
      deselectAll();
      publisher.publish();
      return;
    }

    if (!selectedNotes.includes(clickedNote))
      selectedNotes.push(clickedNote);

    if (anchor.track === clickedNote.track) {
      trackRanges.set(anchor.track, handleSameTrackSelectAction(selectedNotes, anchor, clickedNote));
    } else {
      selectedNotes.splice(0);
      startSelection(clickedNote);
      return;
    }


    publisher.publish();
  }


  function deselectAll() {
    selectedNotes.splice(0);
    anchor = null;
    for (const trackId in trackRanges)
      delete trackRanges[trackId];
    publisher.publish();
  }
}


// Will modify selectedNotes in place, and return [first, last]
function handleSameTrackSelectAction(selectedNotes:Note[], anchor:Note, clickedNote:Note): [Note, Note] {
  let first:Note, last:Note;

  const noteIterator = clickedNote.track.getNoteIterator();
  let foundClickedNote = false;
  let foundAnchor = false;

  for (const note of noteIterator) {
    if (foundClickedNote) {
      if (foundAnchor) {
        // We are after the desired region

        if (selectedNotes.includes(note))
          selectedNotes.splice(selectedNotes.indexOf(note), 1); // Unselect notes that are after the anchor
        else
          break; // Once we find unselected notes, we're done. The selection is correct.

      } else {
        // We are somewhere inside the desired region, looking for the anchor

        if (note === anchor) {
          foundAnchor = true;
          last = note;
        } else {
          if (selectedNotes.includes(note))
            break; // We have found the existing selection, and we've added to it, so now we're done
          else
            selectedNotes.push(note);
        }

      }
    } else {
      if (foundAnchor) {
        // We are in the desired region, looking for the clicked-note

        if (note === clickedNote) {
          foundClickedNote = true;
          last = note;
        } else if (!selectedNotes.includes(note)) {
          selectedNotes.push(note); // Unselected notes get selected
        }

      } else {
        // We are before the desired region, looking for the anchor or clicked-note

        if (note === anchor) {
          foundAnchor = true;
          first = note;
        } else {
          if (note === clickedNote) {
            foundClickedNote = true;
            first = note;
          } else if (selectedNotes.includes(note)) {
            selectedNotes.splice(selectedNotes.indexOf(note), 1); // Selected notes get removed
          }
        }
      }
    }
  }

  return [first, last];
}

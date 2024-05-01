import { createPublisher, Note, Subscribable, Track } from "bananadrum-core";

export interface SelectionManager extends Subscribable {
  isSelected(note:Note): boolean
  handleClick(note:Note): void
  deselectAll(): void
  selections: Map<Track, TrackSelection>
}

interface TrackSelection {
  selectedNotes: Set<Note>
  range: [Note, Note]
}

export function createSelectionManager(): SelectionManager {
  const publisher = createPublisher();
  const selections:Map<Track, TrackSelection> = new Map();
  let anchor:Note|null = null;
  let lastClickedNote:Note|null = null;

  return {
    isSelected, handleClick, deselectAll, selections,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };


  function isSelected(note:Note): boolean {
    if (!selections.has(note.track))
      return false;

    return selections.get(note.track).selectedNotes.has(note);
  }


  function handleClick(clickedNote:Note) {
    if (clickedNote === lastClickedNote)
      return;

    lastClickedNote = clickedNote;

    if (!selections.size)
      return startSelection(clickedNote);

    if (clickedNote === anchor)
      return deselectAll();

    // Step 1: Rejig selection tracks before anything else
    const selectedTracks = getSelectedTracks(anchor.track.arrangement.tracks, new Set(selections.keys()), anchor, clickedNote);

    for (const track of selections.keys()) {
      if (!selectedTracks.has(track))
        selections.delete(track);
    }

    selectedTracks.forEach(track => {
      if (!selections.has(track))
        selections.set(track, createTrackSelection());
    });

    // Step 2: Then rejig the selection notes in each track
    selectedTracks.forEach(track => {
      const selection = selections.get(track);

      if (track === anchor.track) {
        if (track === clickedNote.track) {
          selection.range = handleSameTrackSelectAction(selection.selectedNotes, anchor, clickedNote);
        } else {
          selection.range = handleSelectActionForAnchorTrackButNotClickedTrack(track, selection.selectedNotes, anchor, clickedNote);
        }
      } else {
        if (track === clickedNote.track) {
          selection.range = handleSelectActionForClickedTrackButNotAnchorTrack(track, selection.selectedNotes, anchor, clickedNote);
        } else {
          selection.range = handleDifferentTrackSelectAction(track, selection.selectedNotes, anchor, clickedNote);
        }
      }
    });

    publisher.publish();
  }


  function startSelection(note:Note) {
      selections.set(note.track, createTrackSelection(note));
      anchor = note;
      publisher.publish();
    }


  function deselectAll() {
    if (selections.size) {
      anchor = null;
      lastClickedNote = null;
      selections.clear();
      publisher.publish();
    }
  }
}


// Will update selectedTracks in place, and also return it. Makes sense at the caller.
function getSelectedTracks(tracks:Track[], selectedTracks:Set<Track>, anchor:Note, clickedNote:Note): Set<Track> {
  if (anchor.track === clickedNote.track) {
    selectedTracks.clear();
    selectedTracks.add(anchor.track);
    return selectedTracks;
  }

  handleSelectAction(
    tracks,
    selectedTracks,
    track => track === anchor.track,
    track => track === anchor.track,
    track => track === clickedNote.track,
    track => track === clickedNote.track,
  );

  return selectedTracks;
}


// Will modify selectedNotes in place, and return [first, last]
function handleSameTrackSelectAction(selectedNotes:Set<Note>, anchor:Note, clickedNote:Note): [Note, Note] {
  return handleSelectAction(
    clickedNote.track.getNoteIterator(),
    selectedNotes,
    note => note === anchor,
    note => note === anchor,
    note => note === clickedNote,
    note => note === clickedNote
  );
}


// Will modify selectedNotes in place, and return [first, last]
function handleSelectActionForAnchorTrackButNotClickedTrack(track:Track, selectedNotes:Set<Note>, anchor:Note, clickedNote:Note): [Note, Note] {
  const clickedNoteViewer = document.getElementById('note-' + clickedNote.id);
  const clickedNoteLeft = clickedNoteViewer.getBoundingClientRect().x;
  const clickedNoteRight = clickedNoteLeft + clickedNoteViewer.clientWidth;

  return handleSelectAction(
    track.getNoteIterator(),
    selectedNotes,
    note => note === anchor,
    note => note === anchor,
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft <= clickedNoteLeft && noteRight > clickedNoteLeft;
    },
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft < clickedNoteRight && noteRight >= clickedNoteRight;
    }
  );
}


// Will modify selectedNotes in place, and return [first, last]
function handleSelectActionForClickedTrackButNotAnchorTrack(track:Track, selectedNotesInTrack:Set<Note>, anchor:Note, clickedNote:Note) {
  const anchorNoteViewer = document.getElementById('note-' + anchor.id);
  const anchorLeft = anchorNoteViewer.getBoundingClientRect().x;
  const anchorRight = anchorLeft + anchorNoteViewer.clientWidth;

  return handleSelectAction(
    track.getNoteIterator(),
    selectedNotesInTrack,
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft <= anchorLeft && noteRight > anchorLeft;
    },
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft < anchorRight && noteRight >= anchorRight;
    },
    note => note === clickedNote,
    note => note === clickedNote
  );
}


function handleDifferentTrackSelectAction(track:Track, selectedNotesInTrack:Set<Note>, anchor:Note, clickedNote:Note) {
  const anchorNoteViewer = document.getElementById('note-' + anchor.id);
  const clickedNoteViewer = document.getElementById('note-' + clickedNote.id);

  const anchorLeft = anchorNoteViewer.getBoundingClientRect().x;
  const anchorRight = anchorLeft + anchorNoteViewer.clientWidth;

  const clickedNoteLeft = clickedNoteViewer.getBoundingClientRect().x;
  const clickedNoteRight = clickedNoteLeft + clickedNoteViewer.clientWidth;

  return handleSelectAction(
    track.getNoteIterator(),
    selectedNotesInTrack,
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft <= anchorLeft && noteRight > anchorLeft;
    },
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft < anchorRight && noteRight >= anchorRight;
    },
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft <= clickedNoteLeft && noteRight > clickedNoteLeft;
    },
    note => {
      const noteViewer = document.getElementById('note-' + note.id);
      const noteLeft = noteViewer.getBoundingClientRect().x;
      const noteRight = noteLeft + noteViewer.clientWidth;
      return noteLeft < clickedNoteRight && noteRight >= clickedNoteRight;
    },
  );
}


// Could selectedItems be a set?
function handleSelectAction<T>(iterator:Iterable<T>, selectedItems:Set<T>,
    matchesAnchorOnLeft:(item:T)=>boolean, matchesAnchorOnRight:(item:T)=>boolean,
    matchesClickedItemOnLeft:(item:T)=>boolean, matchesClickedItemOnRight:(item:T)=>boolean
): [T, T] {
  let first:T, last:T;
  let foundClickedItem = false;
  let foundAnchor = false;

  for (const item of iterator) {
    if (foundClickedItem) {
      if (foundAnchor) {
        // We are after the desired region

        if (selectedItems.has(item))
          selectedItems.delete(item); // Unselect notes that are after the anchor
        else
          break; // Once we find unselected notes, we're done. The selection is correct.

      } else {
        // We are somewhere inside the desired region, looking for the anchor

        if (matchesAnchorOnRight(item)) {
          selectedItems.add(item); // In the 1-track selection case, the anchor is already in there. But Set is fine with that.
          foundAnchor = true;
          last = item;
        } else {
          if (selectedItems.has(item))
            break; // We have found the existing selection, and we've added to it, so now we're done
          else
            selectedItems.add(item);
        }

      }
    } else {
      if (foundAnchor) {
        // We are in the desired region, looking for the clicked-note

        if (matchesClickedItemOnRight(item)) {
          selectedItems.add(item);
          foundClickedItem = true;
          last = item;
        } else if (!selectedItems.has(item)) {
          selectedItems.add(item); // Unselected notes get selected
        }

      } else {
        // We are before the desired region, looking for the anchor or clicked-note

        if (matchesAnchorOnLeft(item)) {
          selectedItems.add(item); // In the 1-track selection case, the anchor is already in there. But Set is fine with that.
          foundAnchor = true;
          first = item;

          if (matchesClickedItemOnRight(item)) { // It's possible that one note matches up with both anchor and clickedNote
            foundClickedItem = true;
            last = item;
          }
        } else {
          if (matchesClickedItemOnLeft(item)) {
            selectedItems.add(item);
            foundClickedItem = true;
            first = item;

            if (matchesAnchorOnRight(item)) {
              foundAnchor = true;
              last = item;
            }
          } else if (selectedItems.has(item)) {
            selectedItems.delete(item); // Previously selected outside the new region notes get removed
          }
        }
      }
    }
  }

  return [first, last];
}


function createTrackSelection(note?:Note): TrackSelection {
  if (note){
    return {
      selectedNotes: new Set<Note>().add(note),
      range: [note, note]
    };
  }

  return {
    selectedNotes: new Set(),
    range: [null, null]
  };
}

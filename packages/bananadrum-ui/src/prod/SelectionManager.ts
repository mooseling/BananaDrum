import { createPublisher, NoteView, Subscribable, TrackView } from "bananadrum-core";

export interface SelectionManager extends Subscribable {
  isSelected(note:NoteView): boolean
  handleClick(note:NoteView): void
  deselectAll(): void
  selections: Map<TrackView, TrackSelection>
}


interface TrackSelection {
  selectedNotes: Set<NoteView>
  range: [NoteView, NoteView]
}


export function createSelectionManager(): SelectionManager {
  const publisher = createPublisher();
  const trackSelections:Map<TrackView, TrackSelection> = new Map();
  let anchor:NoteView|null = null;
  let lastClickedNote:NoteView|null = null;

  return {
    isSelected, handleClick, deselectAll, selections: trackSelections,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };


  function isSelected(note:NoteView): boolean {
    if (!trackSelections.has(note.track))
      return false;

    return trackSelections.get(note.track).selectedNotes.has(note);
  }


  function handleClick(clickedNote:NoteView) {
    if (clickedNote === lastClickedNote)
      return;

    lastClickedNote = clickedNote;

    if (!trackSelections.size || clickedNote === anchor)
      return restartSelection(clickedNote);

    // Step 1: Rejig selection tracks before anything else
    recalcSelectedTracks(clickedNote);

    if (trackSelections.size === 1) {
      const trackSelection = trackSelections.get(anchor.track);
      const noteIterator = anchor.track.getNoteIterator();

      deselectUntilMatch(trackSelection, noteIterator, note => note === anchor || note === clickedNote);
      selectUntilMatch(trackSelection, noteIterator, note => note === anchor || note === clickedNote);
      deselectUntilNoMoreSelected(trackSelection, noteIterator);
    } else {
      const anchorNoteViewer = document.getElementById('note-' + anchor.id);
      const clickedNoteViewer = document.getElementById('note-' + clickedNote.id);
      const {left:anchorLeft, right:anchorRight} = anchorNoteViewer.getBoundingClientRect();
      const {left:clickedNoteLeft, right:clickedNoteRight} = clickedNoteViewer.getBoundingClientRect();
      const leftBound = anchorLeft < clickedNoteLeft ? anchorLeft : clickedNoteLeft;
      const rightBound = anchorRight > clickedNoteRight ? anchorRight : clickedNoteRight;

      // In this case, we know no track contains both anchor and clickedNote. Some may not include either.
      for (const track of trackSelections.keys()) {
        const trackSelection = trackSelections.get(track);
        const noteIterator = track.getNoteIterator();
        const [knownNote, knownNoteIsOnLeftEdge, knownNoteIsOnRightEdge] =
          anchor.track === track ? [anchor, anchorLeft === leftBound, anchorRight === rightBound]
          : clickedNote.track === track ? [clickedNote, clickedNoteLeft === leftBound, clickedNoteRight === rightBound]
          : [null];

        if (knownNote) {
          const leftEdgeTest = knownNoteIsOnLeftEdge
            ? (note:NoteView) => note === knownNote
            : getAboutHalfCoveredTest(leftBound, rightBound);
          deselectUntilMatch(trackSelection, noteIterator, leftEdgeTest);

          if (knownNoteIsOnRightEdge) {
            if (!knownNoteIsOnLeftEdge) // If it's both edges, it's already been added
              selectUntilMatch(trackSelection, noteIterator, note => note === knownNote);
          } else {
            selectUntilNoMoreMatches(trackSelection, noteIterator, getAboutHalfCoveredTest(leftBound, rightBound));
          }

          deselectUntilNoMoreSelected(trackSelection, noteIterator);
        } else {
          const inclusionTest = getAboutHalfCoveredTest(leftBound, rightBound);

          deselectUntilMatch(trackSelection, noteIterator, inclusionTest);
          selectUntilNoMoreMatches(trackSelection, noteIterator, inclusionTest);
          deselectUntilNoMoreSelected(trackSelection, noteIterator);
        }
      }
    }

    publisher.publish();
  }


  function restartSelection(note:NoteView) {
    trackSelections.clear();
    trackSelections.set(note.track, createTrackSelection(note));
    anchor = note;
    publisher.publish();
  }


  // We use a simple, inefficient algorithm to recalc selected tracks
  // This is ok. Note-selection is more optimised because there are many more notes, and selecting notes involves dom-searching
  function recalcSelectedTracks(clickedNote:NoteView) {
    const allTracks = anchor.track.arrangement.tracks;
    const anchorTrackIndex = allTracks.indexOf(anchor.track);
    const clickedTrackIndex = allTracks.indexOf(clickedNote.track);
    const [start, end] = anchorTrackIndex < clickedTrackIndex ? [anchorTrackIndex, clickedTrackIndex] : [clickedTrackIndex, anchorTrackIndex];

    let index = 0;
    for (; index < start; index++)
      trackSelections.delete(allTracks[index]);
    for (; index <= end; index++) {
      if (!trackSelections.has(allTracks[index]))
        trackSelections.set(allTracks[index], createTrackSelection());
    }
    for (; index < allTracks.length; index++)
      trackSelections.delete(allTracks[index]);
  }


  function deselectAll() {
    if (trackSelections.size) {
      anchor = null;
      lastClickedNote = null;
      trackSelections.clear();
      publisher.publish();
    }
  }
}


function createTrackSelection(note?:NoteView): TrackSelection {
  if (note) {
    return {
      selectedNotes: new Set<NoteView>().add(note),
      range: [note, note]
    };
  }

  return {
    selectedNotes: new Set(),
    range: [null, null]
  };
}


function getAboutHalfCoveredTest(leftBound:number, rightBound:number): ((note:NoteView) => boolean) {
  const selectionWidth = rightBound - leftBound;

  return (note:NoteView) => {
    const testElement = document.getElementById('note-' + note.id);
    const {left, right, width} = testElement.getBoundingClientRect();

    if (right > rightBound) {
      if (left > rightBound)
        return false; // This element is to the right of the selection area, with no overlap
      if (left > leftBound)
        return (rightBound - left) / width > 0.4; // This element covers the right edge of the selection area
      return selectionWidth / width > 0.4; // This element is wider than the selection area, and completely covers it
    } else {
      if (right < leftBound)
        return false; // This element is to the left of the selection area, with no overlap
      if (left < leftBound)
        return (right - leftBound) / width > 0.4; // This element covers the left edge of the selection area
      return true; // This element is completely inside the selection area
    }
  }
}



/* =============== Selection Recalc Function =============== */

// It's not possible to iterate over the iterator in several small chunks, using for..of and break
// On break, the iterator does some cleanup and becomes useless. So we use while loops instead.

// First, we are before the new selection, looking for the start-note
function deselectUntilMatch(trackSelection:TrackSelection, iterator:IterableIterator<NoteView>, matches:(note:NoteView)=>boolean) {
  let note:NoteView;

  while((note = iterator.next().value)) {
    // Once we find the start-note, we enter the new selection, so this function is done
    if (matches(note)) {
      trackSelection.range[0] = note;
      trackSelection.range[1] = note; // For cases where there's only one selected note in this track
      trackSelection.selectedNotes.add(note);
      return;
    }

    // ...otherwise, any previously selected notes out here get removed from the selection
    trackSelection.selectedNotes.delete(note);
  }
}


// Inside the new selection
// Case 1: Looking for the end note and we know it's in this track
function selectUntilMatch(trackSelection:TrackSelection, iterator:IterableIterator<NoteView>, matches:(note:NoteView)=>boolean) {
  let note:NoteView;

  while ((note = iterator.next().value)) {
    // Anything in here gets added to the selection
    trackSelection.selectedNotes.add(note);

    if (matches(note)) {
      trackSelection.range[1] = note;
      return;
    }
  }
}


// Inside the new selection
// Case 2: Looking until we find notes outside the selection
function selectUntilNoMoreMatches(trackSelection:TrackSelection, iterator:IterableIterator<NoteView>, matches:(note:NoteView)=>boolean) {
  let note:NoteView;

  while ((note = iterator.next().value)) {
    // Keep adding notes if they match
    if (matches(note)) {
      trackSelection.selectedNotes.add(note);
      trackSelection.range[1] = note;
    } else {
      // Otherwise, remove the note from the selection and finish this loop
      trackSelection.selectedNotes.delete(note);
      return;
    }
  }
}


// And finally we are after the new selection, removing any previously selected notes
function deselectUntilNoMoreSelected(trackSelection:TrackSelection, iterator:IterableIterator<NoteView>) {
  let note:NoteView;

  while((note = iterator.next().value)) {
    if (trackSelection.selectedNotes.has(note))
      trackSelection.selectedNotes.delete(note);
    else
      return; // Once we find no more selected notes, we're done
  }
}

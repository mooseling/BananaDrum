import { createPublisher, Note, Subscribable } from "bananadrum-core";

export interface SelectionManager extends Subscribable {
  handleClick(note:Note): void
  clearSelection(): void
  selectedNotes: Note[]
  getFirst(): Note
  getLast(): Note
}

export function createSelectionManager(): SelectionManager {
  const publisher = createPublisher();
  const selectedNotes:Note[] = [];
  let anchor:Note|null = null;
  let first:Note|null = null;
  let last:Note|null = null;

  window.addEventListener('click', event => {
    if (event.target instanceof Element) {
      if (!event.target.closest('.overlay[data-overlay-name="selection_controls"]'))
        clearSelection();
    }
  });

  return {
    handleClick, clearSelection, selectedNotes, getFirst, getLast,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };


  function getFirst() {
    return first;
  }


  function getLast() {
    return last;
  }


  function startSelection(note:Note) {
    selectedNotes.push(note);
    anchor = first = last = note;
    publisher.publish();
  }


  function handleClick(clickedNote:Note) {
    if (!selectedNotes.length) {
      startSelection(clickedNote);
      return;
    }

    if (clickedNote === anchor) {
      clearSelection();
      publisher.publish();
      return;
    }

    if (anchor.track !== clickedNote.track) {
      selectedNotes.splice(0);
      startSelection(clickedNote);
      return;
    }

    if (!selectedNotes.includes(clickedNote))
      selectedNotes.push(clickedNote);

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

    publisher.publish();
  }


  function clearSelection() {
    selectedNotes.splice(0);
    anchor = first = last = null;
    publisher.publish();
  }
}

// window.history is used for:
//  - Storing tab-ID so we can reload tab state on accidental refreshes, etc
//  - Allowing the back button to close overlays on mobile, rather than go back


export function initBackButtonHandling(handler:()=>boolean): void {
  // First add a buffer history state, so we can catch popstate
  // We should have tabID in history.state as soon as the script executes, so we preserve the state
  window.history.pushState(window.history.state, '');

  window.addEventListener('popstate', () => {
    // If we ever store more data in history, we will have to make sure to copy it to the new state at this point
    // But currently it's just tabID, which doesn't change

    const shouldGoBack = handler();
    if (shouldGoBack)
      window.history.back(); // Exit page
    else
      window.history.forward(); // Go back onto buffer state
  })
}

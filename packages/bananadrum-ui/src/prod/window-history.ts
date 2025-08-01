// window.history is used for:
//  - Storing tab-ID so we can reload tab state on accidental refreshes, etc
//  - Allowing the back button to close overlays on mobile, rather than go back


export function initBackButtonHandling(handler:()=>boolean): void {
  // First add a buffer history state, so we can catch popstate
  // We should have tabID in history.state as soon as the script executes, so we preserve the state
  window.history.pushState(window.history.state, '');

  window.addEventListener('popstate', (event) => {
    // It's possible that tabID changed
    window.history.replaceState(event.state, '');

    const shouldGoBack = handler();
    if (shouldGoBack)
      window.history.back(); // Exit page
    else
      window.history.forward(); // Go back onto buffer state
  })
}

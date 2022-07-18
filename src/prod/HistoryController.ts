export const HistoryController = {
  init() {
    addBufferState();
    window.addEventListener('popstate', () => {
      if (confirm('You pressed the back button. Leave Banana Drum?')) {
        window.history.back();
      } else {
        window.history.pushState({}, '');
      }
    });
  }
}


function addBufferState() {
  window.history.pushState({}, '');
}

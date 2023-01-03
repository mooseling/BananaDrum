class CompositionRepeater {
  private timeParams:Banana.TimeParams;
  private lastLength:number;

  constructor(timeParams:Banana.TimeParams) {
    this.timeParams = timeParams;
    this.lastLength = timeParams.length;
    timeParams.subscribe(this.handleLengthChange);
  }


  private handleLengthChange() {
    if (this.timeParams.length <= this.lastLength)
      return;

    // Copy all old stuff
    // Paste until thing is full
  }
}

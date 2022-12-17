declare namespace Banana {
  type CopyRequest = {
    track:Track,
    start:Timing,
    end:Timing
  }

  type PasteRequest = {
    track:Track,
    start:Timing,
    end?:Timing
  }

  interface TrackClipboard {
    copy(copyRequest:CopyRequest): void
    paste(pasteRequest:PasteRequest): void
  }

  interface MultitrackClipboard {
    copy(copyRequests:CopyRequest[]): void
    paste(pasteRequests:PasteRequest[]): void
  }
}

declare namespace Banana {
  type CopyRequest = {
    start:Timing,
    end:Timing
  }

  type PasteRequest = {
    start:Timing,
    end?:Timing
  }

  interface TrackClipboard {
    readonly length: number
    copy(copyRequest:CopyRequest): void
    paste(pasteRequest:PasteRequest): void
  }

  interface MultitrackClipboard {
    copy(copyRequests:CopyRequest[]): void
    paste(pasteRequests:PasteRequest[]): void
  }
}

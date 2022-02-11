declare namespace Banana {
  interface OverlayState extends Publisher {
    visible: boolean
    toggle(): void
  }
}

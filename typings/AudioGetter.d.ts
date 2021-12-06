declare namespace Banana {
  interface AudioGetter {
    get(filename: string): Promise<AudioBuffer>
  }
}

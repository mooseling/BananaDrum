declare interface AudioGetter {
  get(filename: string): Promise<AudioBuffer>
}

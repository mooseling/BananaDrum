// Currently this module knows where we keep sound files
// Later we will probably want to move this to a config file
const path = 'sounds';
const ctx: AudioContext = new AudioContext();

export async function loadAudio(filename: string): Promise<AudioBuffer> {
  const filepath = `${path}/${filename}`;
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

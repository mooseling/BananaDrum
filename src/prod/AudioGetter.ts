// Currently this module knows where we keep sound files
// Later we will probably want to move this to a config file
const path = 'sounds';
let ctx: AudioContext = new AudioContext();

export const AudioGetter:Banana.AudioGetter = {
  async get(filename: string): Promise<AudioBuffer> {
    const filepath = `${path}/${filename}`;
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }
};

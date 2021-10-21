// Currently this module knows where we keep sound files
// Later we will probably want to move this to a config file
const path = 'sounds';
let ctx: null|AudioContext = null;

export const AudioGetter:AudioGetter = {
  async get(filename: string): Promise<AudioBuffer> {
    const filepath = `${path}/${filename}`;
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    if (ctx === null)
      ctx = new AudioContext();
    return ctx.decodeAudioData(arrayBuffer);
  }
};

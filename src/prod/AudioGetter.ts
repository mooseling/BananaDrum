// Currently this module knows where we keep sound files
// Later we will probably want to move this to a config file
const path = 'sounds';

export const AudioGetter:AudioGetter = {
  async get(filename: string): Promise<ArrayBuffer> {
    const filepath = `${path}/${filename}`;
    const response = await fetch(filepath);
    return response.arrayBuffer();
  }
};

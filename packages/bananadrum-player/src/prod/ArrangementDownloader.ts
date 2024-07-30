import { createPublisher, Subscribable } from "bananadrum-core";
import { ArrangementPlayer } from "./types";
import { createMp3Url, determineChannelCount, determineLength, mixTrack, mp3Encode, rescaleData } from "./download";


type ArrangementDownloaderState = 'not started' | 'working' | 'done' | 'failed';


interface ArrangementDownloader extends Subscribable {
  start(): void
  readonly state: ArrangementDownloaderState;
  readonly currentJob: string
  readonly downloadUrl: string
}


export function createArrangementDownloader(arrangementPlayer:ArrangementPlayer): ArrangementDownloader {
  const publisher = createPublisher();

  let state:ArrangementDownloaderState = 'not started';
  let currentJob:string = '';
  let downloadUrl:string;

  return {
    start,
    get state() { return state; },
    get currentJob() { return currentJob; },
    get downloadUrl() { return downloadUrl; },
    subscribe: publisher.subscribe,
    unsubscribe: publisher.unsubscribe
  };


  function start() {
    // TODO: Download lame.js

    updateJobAndState('Determining length and channel count...', 'working');
    const length = determineLength(arrangementPlayer);
    const channelCount = determineChannelCount(arrangementPlayer);

    if (channelCount === 0 || length === 0) {
      updateJobAndState("There doesn't seem to be anything in this composition", 'failed');
      return;
    }

    const audioDataInChannels = [];
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex++)
      audioDataInChannels.push(new Float32Array(length));

    arrangementPlayer.trackPlayers.forEach(trackPlayer => {
      const trackDisplayName = trackPlayer.track.instrument.displayName;
      updateJobAndState(`Mixing ${trackDisplayName}...`);
      mixTrack(trackPlayer, audioDataInChannels);
    });

    const rescaledAudioDataInChannels = audioDataInChannels.map((audioData, channelIndex) => {
      updateJobAndState(`Rescaling ${getChannelDescriptor(channelIndex)}...`);
      return rescaleData(audioData);
    });

    updateJobAndState('Converting to MP3...');
    const mp3Blobs = mp3Encode(rescaledAudioDataInChannels[0], rescaledAudioDataInChannels[1]); // MP3 only support mono and stereo, after all our careful handling

    updateJobAndState('Creating URL...');
    downloadUrl = createMp3Url(mp3Blobs);

    updateJobAndState('Done!', 'done');
  }


  function getChannelDescriptor(channelIndex:number): string {
    if (channelIndex === 0)
      return 'left channel';

    if (channelIndex === 1)
      return 'right channel';

    return 'channel' + channelIndex + 1;
  }


  function updateJobAndState(newCurrentJob:string, newState?:ArrangementDownloaderState): void {
    currentJob = newCurrentJob;
    if (newState)
      state = newState;
    publisher.publish();
  }
}

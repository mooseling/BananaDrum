import { BananaDrum } from 'bananadrum-core';
import { createArrangementPlayer } from "./ArrangementPlayer.js";
import { getEventEngine } from "./EventEngine.js";
import { BananaDrumPlayer } from './types.js';

export function createBananaDrumPlayer(bananaDrum:BananaDrum): BananaDrumPlayer {
  const eventEngine = getEventEngine();
  const arrangementPlayer = createArrangementPlayer(bananaDrum.arrangement);
  eventEngine.connect(arrangementPlayer);

  return {bananaDrum, eventEngine, arrangementPlayer};
}
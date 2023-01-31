import { createArrangementPlayer } from "./ArrangementPlayer";
import { getEventEngine } from "./EventEngine";
import { BananaDrum, BananaDrumPlayer } from "./types";

export function createBananaDrumPlayer(bananaDrum:BananaDrum): BananaDrumPlayer {
  const eventEngine = getEventEngine();
  const arrangementPlayer = createArrangementPlayer(bananaDrum.arrangement);

  return {bananaDrum, eventEngine, arrangementPlayer};
}
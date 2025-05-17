import { TrackView } from 'bananadrum-core';


const colourCount = {blue:0, purple:0, green:0, orange:0, yellow:0};
const trackColourMap:{[trackId:number]:string} = {};


// Return a hsl() colour value
export function getTrackColour(track:TrackView): string {
  if (!trackColourMap[track.id]) {
    const colourGroup = track.instrument.colourGroup;
    trackColourMap[track.id] = allColours[colourGroup][colourCount[colourGroup] % allColours[colourGroup].length];
    colourCount[colourGroup]++;
  }

  return trackColourMap[track.id];
}


// We have certain color categories that instruments fall into
// And an inverted colour for selections
const allColours: {[colourName:string]:string[]} = {
  // kitchen, cymbols
  yellow: [
    'hsl(52, 100%, 70%)',
    'hsl(55, 100%, 74%)',
    'hsl(58, 100%, 78%)',
    'hsl(61, 100%, 82%)',
    'hsl(64, 100%, 86%)',
    'hsl(67, 100%, 90%)'
  ],
  // High-mids: tamborims, repaniques
  orange: [
    'hsl(25, 80%, 63%)',
    'hsl(27, 84%, 66%)',
    'hsl(29, 88%, 69%)',
    'hsl(31, 92%, 73%)',
    'hsl(33, 96%, 76%)',
    'hsl(35, 100%, 79%)'
  ],
  // Mids: snare, caixa
  green: [
    'hsl(182, 63%, 49%)',
    'hsl(178, 62%, 55%)',
    'hsl(174, 61%, 62%)',
    'hsl(170, 60%, 69%)',
    'hsl(166, 59%, 75%)',
    'hsl(162, 57%, 82%)'
  ],
  // Low-mids: toms, timba, congas
  blue: [
    'hsl(200, 97%, 51%)',
    'hsl(196, 97%, 54%)',
    'hsl(192, 97%, 57%)',
    'hsl(188, 98%, 60%)',
    'hsl(184, 98%, 63%)',
    'hsl(180, 98%, 66%)'
  ],
  // surdos, bass drums
  purple: [
    'hsl(268, 61%, 69%)',
    'hsl(272, 69%, 73%)',
    'hsl(276, 77%, 77%)',
    'hsl(280, 85%, 81%)',
    'hsl(284, 93%, 85%)',
    'hsl(288, 100%, 89%)'
  ]
};


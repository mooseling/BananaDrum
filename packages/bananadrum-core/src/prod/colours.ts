// We have certain color categories that instruments fall into
const colours: {[colourName:string]:string[]} = {
  // surdos, bass drums
  purple: [
    'hsl(268, 61%, 69%)',
    'hsl(272, 69%, 73%)',
    'hsl(276, 77%, 77%)',
    'hsl(280, 85%, 81%)',
    'hsl(284, 93%, 85%)',
    'hsl(288, 100%, 89%)'
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
  // Mids: snare, caixa
  green: [
    'hsl(182, 63%, 34%)',
    'hsl(178, 62%, 40%)',
    'hsl(174, 61%, 47%)',
    'hsl(170, 60%, 54%)',
    'hsl(166, 59%, 60%)',
    'hsl(162, 57%, 67%)'
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
  // kitchen, cymbols
  yellow: [
    'hsl(52, 100%, 70%)',
    'hsl(55, 100%, 74%)',
    'hsl(58, 100%, 78%)',
    'hsl(61, 100%, 82%)',
    'hsl(64, 100%, 86%)',
    'hsl(67, 100%, 90%)'
  ]
};

const nextColourIndex = {blue:0, purple:0, green:0, orange:0, yellow:0};

// Return a hsl() colour value
export function getColour(colourName:string): string {
  const index = nextColourIndex[colourName];
  const colour = colours[colourName][index];
  nextColourIndex[colourName] = (index + 1) % colours[colourName].length;
  return colour;
}

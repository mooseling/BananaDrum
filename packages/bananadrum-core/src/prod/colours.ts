// We have certain color categories that instruments fall into
// And an inverted colour for selections
const allColours: {[colourName:string]:string[][]} = {
  // surdos, bass drums
  purple: [
    ['hsl(268, 61%, 69%)', 'hsl(94, 61%, 69%)'],
    ['hsl(272, 69%, 73%)', 'hsl(98, 69%, 73%)'],
    ['hsl(276, 77%, 77%)', 'hsl(102, 77%, 77%)'],
    ['hsl(280, 85%, 81%)', 'hsl(106, 85%, 81%)'],
    ['hsl(284, 93%, 85%)', 'hsl(108, 93%, 85%)'],
    ['hsl(288, 100%, 89%)', 'hsl(112, 100%, 89%)']
  ],
  // Low-mids: toms, timba, congas
  blue: [
    ['hsl(200, 97%, 51%)', 'hsl(20, 97%, 64%)'],
    ['hsl(196, 97%, 54%)', 'hsl(16, 97%, 67%)'],
    ['hsl(192, 97%, 57%)', 'hsl(12, 97%, 70%)'],
    ['hsl(188, 98%, 60%)', 'hsl(8, 98%, 73%)'],
    ['hsl(184, 98%, 63%)', 'hsl(4, 98%, 76%)'],
    ['hsl(180, 98%, 66%)', 'hsl(0, 98%, 79%)']
  ],
  // Mids: snare, caixa
  green: [
    ['hsl(182, 63%, 34%)', 'hsl(2, 63%, 55%)'],
    ['hsl(178, 62%, 40%)', 'hsl(358, 62%, 57%)'],
    ['hsl(174, 61%, 47%)', 'hsl(354, 61%, 59%)'],
    ['hsl(170, 60%, 54%)', 'hsl(350, 60%, 61%)'],
    ['hsl(166, 59%, 60%)', 'hsl(346, 59%, 63%)'],
    ['hsl(162, 57%, 67%)', 'hsl(342, 57%, 65%)']
  ],
  // High-mids: tamborims, repaniques
  orange: [
    ['hsl(25, 80%, 63%)', 'hsl(205, 80%, 63%)'],
    ['hsl(27, 84%, 66%)', 'hsl(207, 84%, 66%)'],
    ['hsl(29, 88%, 69%)', 'hsl(209, 88%, 69%)'],
    ['hsl(31, 92%, 73%)', 'hsl(211, 92%, 73%)'],
    ['hsl(33, 96%, 76%)', 'hsl(213, 96%, 76%)'],
    ['hsl(35, 100%, 79%)', 'hsl(215, 100%, 79%)']
  ],
  // kitchen, cymbols
  yellow: [
    ['hsl(52, 100%, 70%)', 'hsl(232, 100%, 72%)'],
    ['hsl(55, 100%, 74%)', 'hsl(235, 100%, 74%)'],
    ['hsl(58, 100%, 78%)', 'hsl(238, 100%, 76%)'],
    ['hsl(61, 100%, 82%)', 'hsl(241, 100%, 78%)'],
    ['hsl(64, 100%, 86%)', 'hsl(244, 100%, 80%)'],
    ['hsl(67, 100%, 90%)', 'hsl(247, 100%, 82%)']
  ]
};

const nextColourIndex = {blue:0, purple:0, green:0, orange:0, yellow:0};

// Return a hsl() colour value
export function getColours(colourName:string): string[] {
  const index = nextColourIndex[colourName];
  const trackColours = allColours[colourName][index];
  nextColourIndex[colourName] = (index + 1) % allColours[colourName].length;
  return trackColours;
}

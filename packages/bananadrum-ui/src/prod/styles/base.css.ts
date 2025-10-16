import { createGlobalTheme } from '@vanilla-extract/css';


const thickBorderWidth = '1.5pt';
const thinBorderWidth = '1pt';
const darkGray = '#606060';
const darkerBlue = '#003F5D';
const lightBlue = '#008ED3';
const lighterBlue = '#07ABFB';


export const baseStyles = createGlobalTheme('#wrapper', {
  colors: {
    yellow:  '#FFDE00',
    lightYellow: '#FFE739',
    lighterYellow: '#FFEB64',
    green: '#006666',
    darkGreen: '#005151',
    darkerGreen: '#003737',
    lightGreen: '#0A7B7B',
    lighterGreen: '#238B8B',
    lightestGreen: '#62BBBB',
    blue: '#006699',
    lightBlue,
    lighterBlue,
    darkBlue: '#00537B',
    darkerBlue,
    gray:	'#787878',
    darkGray,
    darkerGray:	'#303030',
    darkestGray: '#202020',
    lightGray: '#A0A0A0',
    lighterGray: '#D0D0D0',
    lightestGray: '#E8E8E8',
    secondaryGreen: 'hsl(94, 80%, 59%)',
    secondaryOrange: 'hsl(20, 97%, 64%)',
    secondaryYellow: 'rgb(255, 244, 122)',
    secondaryRed: 'hsl(2, 63%, 55%)',
    secondaryBlue: 'hsl(205, 80%, 63%)',
    secondaryPurple: 'hsl(232, 100%, 72%)'
  },
  borders: {
    thickBorderWidth,
    thickBorder: `${thickBorderWidth} solid ${darkGray}`,
    thinBorderWidth,
    thinBorder: `${thinBorderWidth} solid ${darkGray}`,
  },
  measurements: {
    noteHeight: '54pt',
    trackMetaWidth: '84.9pt',
  },
  anchors: {
    visitedColor: darkerBlue,
    hoverColor: lightBlue,
    activeColor: lighterBlue
  }
});

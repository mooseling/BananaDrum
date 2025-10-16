import { style } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import { baseStyles } from '../../styles/base.css.js';


export const noteViewerStyles = style({
  borderColor: baseStyles.colors.darkGray,
  marginTop: calc.multiply(-1, baseStyles.borders.thickBorderWidth),
  marginBottom: calc.multiply(-1, baseStyles.borders.thickBorderWidth),
  height: baseStyles.measurements.noteHeight,
  textAlign: 'center',
  lineHeight: baseStyles.measurements.noteHeight,
  cursor: 'pointer',
  WebkitUserSelect: 'none',
  userSelect: 'none',
  backgroundColor: 'white',
  overflowX: 'hidden',

  /* Some browsers use this. It's a nice effect but confusing when selecting. */
 WebkitTapHighlightColor: 'Transparent'
});

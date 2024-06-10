import { NoteStyle } from "bananadrum-core";

export function NoteStyleSymbolViewer({noteStyle}:{noteStyle:NoteStyle}): JSX.Element {
  if (!noteStyle)
    return null;
  const {symbol} = noteStyle;
  if (symbol) {
    if (symbol.src)
      return <img className="note-style-symbol" src={symbol.src} alt={symbol.string}/>;
    if (symbol.string)
      return <span className="note-style-symbol">{symbol.string}</span>;
  }
  return <span className="note-style-symbol">{noteStyle.id}</span>;
}

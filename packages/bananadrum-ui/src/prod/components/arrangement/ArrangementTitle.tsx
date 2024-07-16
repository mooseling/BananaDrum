import { useContext, useEffect, useRef } from "react";
import { ArrangementPlayerContext } from "./ArrangementViewer";
import { useStateSubscription } from "../../hooks/useStateSubscription";
import { Arrangement } from "bananadrum-core";

export function ArrangementTitle({editMode, onEditEnd}:{editMode:boolean, onEditEnd:(newTitle:string)=>void}): JSX.Element {
  const arrangement = useContext(ArrangementPlayerContext).arrangement;
  const title = useStateSubscription(arrangement, (arrangement:Arrangement) => arrangement.title);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {editMode && inputRef.current?.focus()}, [editMode]);

  return (
    <div id="title-wrapper" style={{textAlign:'center'}}>
      {
        editMode
          ? <input
            ref={inputRef}
            onBlur={(e) => onEditEnd((e.target as HTMLInputElement).value)}
            onKeyUp={e => e.key === 'Enter' && onEditEnd((e.target as HTMLInputElement).value)}
            style={{
              height: 'unset',
              width: '100%',
              border: 'none',
              textAlign: 'center',
              fontSize: '2em',
              fontWeight: 'bold',
              marginBlockStart: '0.67em',
              marginBlockEnd: '0.67em',
              padding: '0'
            }}
            value={arrangement.title}
            />
          : <h1>{title}</h1>
      }
    </div>
  );
}

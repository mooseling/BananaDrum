import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ArrangementPlayerContext } from "./ArrangementViewer";
import { useStateSubscription } from "../../hooks/useStateSubscription";
import { ArrangementView } from "bananadrum-core";
import { useSubscription } from "../../hooks/useSubscription";
import { useEditCommand } from '../../hooks/useEditCommand';



export function ArrangementTitle({editMode, onEditEnd}:{editMode:boolean, onEditEnd:()=>void}): JSX.Element {
  const arrangement = useContext(ArrangementPlayerContext).arrangement;
  const title = useStateSubscription(arrangement, (arrangement:ArrangementView) => arrangement.title);
  const edit = useEditCommand();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {editMode && inputRef.current?.focus()}, [editMode]);

  const [inputValue, setInputValue] = useState(arrangement.title);
  useSubscription(arrangement, () => setInputValue(arrangement.title));

  const keyUpHandler = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') { // Enter means submit the changes and stop editing
      edit({arrangement, newTitle: (event.target as HTMLInputElement).value});
      onEditEnd();
    }

    if (event.key === 'Escape') { // Escape means stop editing and discard the changes
      setInputValue(arrangement.title);
      onEditEnd();
    }
  }, []);

  // Click out of the input means submit the changes and stop editing
  const blurHandler = useCallback((event: React.FocusEvent) => {
    edit({arrangement, newTitle: (event.target as HTMLInputElement).value});
    onEditEnd();
  }, []);

  return (
    <div id="title-wrapper" style={{textAlign:'center'}}>
      {
        editMode
          ? <input
            ref={inputRef}
            onBlur={blurHandler}
            onChange={e => setInputValue(e.target.value)}
            onKeyUp={keyUpHandler}
            onKeyDown={e => e.stopPropagation()} // Don't want to trigger global keyboard handlers, like play-on-spacebar
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
            placeholder="Add a title..."
            value={inputValue}
            />
          : <h1>{title}</h1>
      }
    </div>
  );
}

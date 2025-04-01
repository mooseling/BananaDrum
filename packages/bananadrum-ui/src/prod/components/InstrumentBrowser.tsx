import { ArrangementView, InstrumentMeta } from 'bananadrum-core';
import { getLibrary } from 'bananadrum-core';
import { ArrangementPlayerContext } from './arrangement/ArrangementViewer.js';
import { useContext } from 'react';
import { EditFunction, useEditCommand } from '../hooks/useEditCommand.js';

export function InstrumentBrowser({close}:{close:() => void}): JSX.Element {
  return (
    <div className="viewport-wrapper">
      <div style={{padding:'20pt'}}>
        {getLibrary().instrumentMetas.map(meta => <InstrumentChooser key={meta.id} instrumentMeta={meta} close={close}/>)}
        <br />
        <br />
        <button className="push-button" onClick={close}>Back</button>
      </div>
    </div>
  );
}


function InstrumentChooser({instrumentMeta, close}:{instrumentMeta:InstrumentMeta, close:() => void}): JSX.Element {
  const {id, displayName} = instrumentMeta;
  const arrangement:ArrangementView = useContext(ArrangementPlayerContext).arrangement;
  const edit = useEditCommand();

  return (
    <button className="instrument-chooser push-button" onClick={() => (choose(id, arrangement, edit), close())}>
      {displayName}
    </button>
  );
}


function choose(id:string, arrangement:ArrangementView, edit:EditFunction) {
  edit({arrangement, addTrack:getLibrary().getInstrument(id)});
}

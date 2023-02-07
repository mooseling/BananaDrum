import { Arrangement, InstrumentMeta } from 'bananadrum-core';
import {Library} from 'bananadrum-core';
import {ArrangementPlayerContext} from './ArrangementViewer.js';
import {useContext} from 'react';

export function InstrumentBrowser({close}:{close:() => void}): JSX.Element {
  return (
    <div className="viewport-wrapper">
      <div style={{padding:'20pt'}}>
        {Library.instrumentMetas.map(meta => <InstrumentChooser key={meta.id} instrumentMeta={meta} close={close}/>)}
        <br />
        <br />
        <button className="push-button" onClick={close}>Back</button>
      </div>
    </div>
  );
}


function InstrumentChooser({instrumentMeta, close}:{instrumentMeta:InstrumentMeta, close:() => void}): JSX.Element {
  const {id, displayName} = instrumentMeta;
  const arrangement:Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <button className="instrument-chooser push-button" onClick={() => {choose(id, arrangement); close();}}>
      {displayName}
    </button>
  );
}


function choose(id:string, arrangement:Arrangement) {
  arrangement.addTrack(Library.getInstrument(id));
}

import {useContext} from 'react';
import {Library} from '../Library';
import {ArrangementPlayerContext} from './ArrangementViewer';

export function InstrumentBrowser({close}:{close:() => void}): JSX.Element {
  return (
    <div>
      {Library.instrumentMetas.map(meta => <InstrumentChooser key={meta.instrumentId} instrumentMeta={meta} close={close}/>)}
      <br />
      <br />
      <button className="push-button" onClick={close}>Back</button>
    </div>
  );
}


function InstrumentChooser({instrumentMeta, close}:{instrumentMeta:Banana.InstrumentMeta, close:() => void}): JSX.Element {
  const {instrumentId, displayName} = instrumentMeta;
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <button className="instrument-chooser push-button" onClick={() => {choose(instrumentId, arrangement); close();}}>
      {displayName}
    </button>
  );
}


function choose(instrumentId:string, arrangement:Banana.Arrangement) {
  arrangement.createTrack(Library.getInstrument(instrumentId));
}

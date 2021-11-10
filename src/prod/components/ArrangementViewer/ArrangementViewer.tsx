import React, {useState, useEffect } from 'react'
import {TrackViewer} from '../TrackViewer/TrackViewer';
import {ArrangementControls} from '../ArrangementControls';
import {ArrangementPlayer} from '../../ArrangementPlayer';

import {exampleArrangement} from '../../../test/lib/example-arrangement';
import {instrumentCollection} from '../../../test/lib/example-instruments';
import {Library} from '../../Library';
import {Arrangement} from '../../Arrangement';
import './arrangement-viewer.css'
type Ecosystem = {
  library: Library,
  newArrangement: Arrangement,
  arrangementPlayer: ArrangementPlayer
};



export default function ArrangementViewer(): JSX.Element {
  const [arrangement, setArrangement] = useState<Ecosystem>()

  useEffect(() => {
    createTestEcosystem()
  }, [])

  const createTestEcosystem = async (): Promise<void> => {
    const library = Library(instrumentCollection);
    await library.load();
    const newArrangement = Arrangement(library, exampleArrangement);
    const arrangementPlayer = ArrangementPlayer(newArrangement);
    setArrangement({library, newArrangement, arrangementPlayer})
  }

  if (arrangement === undefined) {
    return (
      <h1>loading</h1>
    )
  }
  return (
    <div className="arrangement-viewer">
      {Object.values(arrangement.newArrangement.tracks).map((track) => {
        console.log(track)
        return (<TrackViewer
          track={track}
          key={track.instrument.instrumentId}
          arrangement={arrangement.newArrangement}
        />)
      }
    )}
    </div>
  )
}
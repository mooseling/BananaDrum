import {useState, useEffect, useContext} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {Overlay, toggleOverlay} from './Overlay';
import {ShareButton} from './ShareButton';
import {NumberInput} from './General';
import {EventEngine} from '../EventEngine';


export function ArrangementControlsTop(): JSX.Element {
  const [playing, setPlaying] = useState(EventEngine.state === 'playing');
  const eventEngineSubscription = () => setPlaying(EventEngine.state === 'playing');
  useEffect(() => {
    EventEngine.subscribe(eventEngineSubscription);
    return () => EventEngine.unsubscribe(eventEngineSubscription);
  }, []);

  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <div className="arrangement-controls arrangement-controls-top">
      {
        playing ? (
          <button className="playback-control push-button" onClick={() => EventEngine.stop()}>
            <img src="images/icons/pause.svg" alt="stop" />
          </button>
        ) : (
          <button className="playback-control push-button" onClick={() => EventEngine.play()}>
            <img src="images/icons/play.svg" alt="play" />
          </button>
        )
      }
      <SmallSpacer />
      <TimeControls arrangement={arrangement} />
      <SmallSpacer />
      <ExpandingSpacer />
      <ShareButton />
    </div>
  );
}


function TimeControls({arrangement}:{arrangement:Banana.Arrangement}): JSX.Element {
  const {timeParams} = arrangement;
  let [state, update] = useState({arrangement});

  const subscription = () => update({arrangement});
  useEffect(() => {
    timeParams.subscribe(subscription);
    return () => timeParams.unsubscribe(subscription);
  }, []);

  const pluralBars = timeParams.length > 1;

  return (
    <div className="time-controls-wrapper">
      <div className="time-control">
        <select onChange={changeTimeSignature}>
          <option>4/4</option>
          <option>6/8</option>
          <option>5/4</option>
          <option>7/8</option>
        </select> time
      </div>
      <div className="time-control">
        <NumberInput
          getValue={() => String(timeParams.tempo)}
          setValue={(newValue:string) => timeParams.tempo = Number(newValue)}
        /> bpm
      </div>
      <div className="time-control">
        <NumberInput
          getValue={() => String(timeParams.length)}
          setValue={(newValue:string) => timeParams.length = Number(newValue)}
        /> {pluralBars ? 'bars' : 'bar'}
      </div>
    </div>
  );


  function changeTimeSignature(event:React.ChangeEvent<HTMLSelectElement>) {
    timeParams.timeSignature = event.target.value;
    switch (event.target.value) {
      case '4/4':
        timeParams.stepResolution = 16;
        timeParams.pulse = '1/4';
        break;
      case '6/8':
        timeParams.stepResolution = 16;
        timeParams.pulse = '3/8';
        break;
      case '5/4':
        timeParams.stepResolution = 16;
        timeParams.pulse = '1/2';
        break;
      case '7/8':
        timeParams.stepResolution = 16;
        timeParams.pulse = '1/2';
        break;
    }
  }
}


export function ArrangementControlsBottom(): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <div className="arrangement-controls arrangement-controls-bottom overlay-wrapper">
      <button
        className="push-button"
        onClick={() => toggleOverlay('instrument_browser', 'show')}
      >Add Instrument</button>
      <ExpandingSpacer />
      <button
        className="push-button"
        onClick={() => toggleOverlay('clear_tracks', 'show')}
      >Clear all tracks</button>
      <Overlay name="clear_tracks">
        <div style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <ExpandingSpacer />
          <button
            className="push-button"
            onClick={() => {
              for (const trackId in arrangement.tracks)
                arrangement.tracks[trackId].clear();
              toggleOverlay('clear_tracks', 'hide');
            }}
          >Really, clear tracks</button>
          <SmallSpacer />
          <button
            className="push-button"
            onClick={() => toggleOverlay('clear_tracks', 'hide')}
          >No, go back</button>
        </div>
      </Overlay>
    </div>
  );
}


function SmallSpacer(): JSX.Element {
  return <div style={{width:'8pt'}} />;
}


function ExpandingSpacer(): JSX.Element {
  return <div style={{flexGrow:1}} />;
}

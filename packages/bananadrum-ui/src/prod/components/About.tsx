import { errorLog } from "bananadrum-core";
import { useState } from "react";
import { useSubscription } from "../hooks/useSubscription";
import { toggleOverlay } from "./Overlay";

export function About(): JSX.Element {
  const [errorCount, setErrorCount] = useState(errorLog.getEntryCount());
  const errorButtonVisibilityClass = errorCount ? '' : 'hidden';
  const [errorReportIsVisibile, setErrorReportIsVisibile] = useState(false);

  useSubscription(errorLog, () => setErrorCount(errorLog.getEntryCount()));

  return (
    <div className="viewport-wrapper">
      <div id="about" className="welcome">
        <img src="images/banana-with-feet.svg" style={{height:"80pt"}}/>
        <h1>Welcome to Banana Drum!</h1>
        <p>On your lap or in your pocket, an easy way to compose and share samba grooves</p>
        <p>Send feedback and rhythms to <a target="_blank" href="https://www.facebook.com/bananadrum.net" rel="noreferrer">Banana Drum on Facebook</a>!</p>
        <p>
          <a target="_blank" href="https://jamofalltrades.com" rel="noreferrer">Check out the author</a>
          <br/>
          <a target="_blank" href="https://github.com/mooseling/BananaDrum" rel="noreferrer">Check out the code</a>
          <br/>
          <a target="_blank" href="https://trello.com/b/f6731Frf/bananadrum" rel="noreferrer">Check on progress</a>
        </p>
        <div className={errorButtonVisibilityClass}>
          <button
            id="report-error"
            className='push-button'
            onClick={() => setErrorReportIsVisibile(true)}
          >There were errors! Click to view error report.</button>
          <br/><br/>
          <div className={`display-linebreak ${errorReportIsVisibile ? '' : 'hidden'}`}>
            <p>{errorLog.getMessage()}</p>
            <br/>
          </div>
        </div>
        <button
          id="load-button"
          className="push-button"
          onClick={() => {
            toggleOverlay('about', 'hide');
            setErrorReportIsVisibile(false);
          }}
        >Back to my beat!</button>
      </div>
    </div>
  );
}

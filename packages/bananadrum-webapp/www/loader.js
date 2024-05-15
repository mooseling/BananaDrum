(function() {
  const bananaDrumVersion = '1.4.0-snapshot15';

  let errorLog = "Sorry to hear you had problems running Banana Drum! Please copy this whole page and send it to James.\nDon't know James? Get in touch with Banana Drum on Facebook: https://facebook.com/bananadrum.net/\n\n\n";
  window.onerror =  function(message, url, lineNumber, columnNumber, error) {
    reportTopLevelError(message, url, lineNumber, columnNumber, error);
  };


  if (!window.AudioContext) {
    if (window.webkitAudioContext)
      window.AudioContext = window.webkitAudioContext;
    else
      displayNoAudioContextMessage();
  }
  if (window.AudioContext) {
    requestPermissionsIfiOS()
      .then(loadBananaDrum)
      .catch(displayAudioPermissionsRequiredMessage);
  }


  function reportTopLevelError(message, url, lineNumber, columnNumber, error) {
    addErrorReportToLog(message, url, lineNumber, columnNumber, error);
    displayErrorReportButton();
  }


  function addErrorReportToLog(message, url, lineNumber, columnNumber, error) {
    let errorReport = '================================================\n';
    errorReport += 'Caught an exception at the top:\n';
    errorReport += message + '\n';
    errorReport += url + ':' + lineNumber + '.' + columnNumber + '\n';
    if (error) {
      errorReport += error.name + '\n';
      errorReport += error.message + '\n';
      if (error.stack)
        errorReport += '\n' + error.stack + '\n';
    }
    errorReport += '\n';
    errorReport += 'UserAgent:\n';
    errorReport += navigator.userAgent;
    errorReport += '\n\n';

    errorLog += errorReport;
  }


  function displayErrorReportButton() {
    const elementToReplace = document.getElementById('load-button-wrapper');
    if (!elementToReplace)
      return;

    const blurb = document.createElement('p');
    blurb.innerText = "Something went wrong and Banana Drum won't work. Please send me an error report, so I can make Banana Drum work on your device.";

    const button = document.createElement('button');
    button.innerText = 'Generate error report';
    button.addEventListener('click', function() {
      document.body.innerText = errorLog;
    });

    const newWrapperDiv = document.createElement('div');
    newWrapperDiv.appendChild(blurb);
    newWrapperDiv.appendChild(button);

    elementToReplace.replaceWith(newWrapperDiv);
  }


  function displayNoAudioContextMessage() {
    const elementToReplace = document.getElementById('load-button-wrapper');
    if (elementToReplace) {
      elementToReplace.innerHTML = "<p>Really sorry but Banana Drum won't run on this browser.</p><p>Banana Drum requires a browser feature called AudioContext, but Banana Drum didn't find it. Try to update your browser, or, if that doesn't help, <a href=https://facebook.com/bananadrum.net>get in touch on Facebook</a>. Maybe I need to fix something!</p>";
    }
  }


  function displayAudioPermissionsRequiredMessage() {
    const elementToReplace = document.getElementById('load-button-wrapper');
    if (elementToReplace) {
      elementToReplace.innerHTML = "<p>On iOS, Banana Drum needs your permission to play sound, but it may appear to be asking to use the microphone. You'll have to reload the page and grant that permission. Sorry it's a bit weird!</p>";
    }
  }


  function loadBananaDrum() {
    const script = document.createElement('script');
    script.src = '/bundle.js?v=' + bananaDrumVersion;
    document.body.appendChild(script);
  }


  function requestPermissionsIfiOS() {
    if(/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        return navigator.mediaDevices.getUserMedia({video:false, audio:true});
    }

    return new Promise(resolve => resolve());
  }
})();

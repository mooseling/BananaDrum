/* global document, window, navigator */
(function() {
  let errorLog = "Sorry to hear you had problems running Banana Drum! Please copy this whole page and send it to James.\nDon't know James? Get in touch with Banana Drum on Facebook: https://facebook.com/bananadrum.net/\n\n\n";
  window.onerror =  function(message, url, lineNumber, columnNumber, error) {
    reportTopLevelError(message, url, lineNumber, columnNumber, error);
  };


  function reportTopLevelError(message, url, lineNumber, columnNumber, error) {
    addErrorReportToLog(message, url, lineNumber, columnNumber, error);
    displayErrorReportButton();
  }


  function addErrorReportToLog(message, url, lineNumber, columnNumber, error) {
    let errorReport = '================================================\n';
    errorReport += 'Caught an exception at the top:';
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
    const newWrapperDiv = document.createElement('div');

    const blurb = document.createElement('p');
    blurb.innerText = "Something went wrong and Banana Drum won't work. Please send me an error report, so I can make Banana Drum work on your device.";

    const button = document.createElement('button');
    button.innerText = 'Generate error report';
    button.addEventListener('click', function() {
      document.body.innerText = errorLog;
    });

    newWrapperDiv.appendChild(blurb);
    newWrapperDiv.appendChild(button);

    elementToReplace.replaceWith(newWrapperDiv);
  }
})();

let errorLog = '';

export const ErrorHandler = {
  init() {
    window.onerror = handleError;
  },
  getReport() {
    if (errorLog)
      return errorReportHeader + '\n\n\n' + errorLog;
    else
      return noErrorsMessage;
  }
}


function handleError(message:string, url:string, lineNumber:number, columnNumber:number, error:Error) {
  errorLog += message + '\n';
  errorLog += url + ':' + lineNumber + '.' + columnNumber + '\n';
  if (error) {
    errorLog += error.name + '\n';
    errorLog += error.message + '\n';
    if (error.stack)
      errorLog += '\n' + error.stack + '\n\n';
  }
  errorLog += 'end\n'
  errorLog += '\n\n'
}



const dontKnowJamesMessage = "If you don't know James, message Banana Drum on Facebook: https://www.facebook.com/bananadrum.net/";
const errorReportHeader = "Please copy this whole page and send it to James.\n" + dontKnowJamesMessage;
const noErrorsMessage = "Unfortunately Banana Drum hasn't caught any errors. Please still tell James.\n" + dontKnowJamesMessage;

import { createPublisher } from "./Publisher.js";
import { Publisher, Subscribable } from "./types.js";

// It's been very difficult to solve compatibility problems, since they are usually on an iPhone belonging to Nick
// Guesswork has only gotten me so far, it's time to start trying to catch errors and make them reportable

// We catch two things: uncaught errors, and unhandled promise rejections
// We make the log subscribable so the React ui can make a button appear once there are errors to report

const logEntries:LogEntry[] = [];
const publisher:Publisher = createPublisher();

export const errorLog:ErrorLog = {
  getEntryCount() {
    return logEntries.length;
  },
  getMessage() {
    if (!logEntries.length)
      return "No errors to report. I'm not sure how you found this message!";

    return errorReportPreamble + JSON.stringify({
      userAgent: navigator.userAgent,
      errors: logEntries
    });
  },
  subscribe: publisher.subscribe,
  unsubscribe: publisher.unsubscribe
}


window.addEventListener('error', function({message, filename, lineno, colno, error}:ErrorEvent) {
  const logEntry:ErrorLogEntry = {
    type: 'Error',
    message,
    at: `${filename}:${lineno}.${colno}`,
    error
  };

  extendWithErrorDetails(logEntry, error);

  addToLog(logEntry);
});


window.addEventListener('unhandledrejection', function({reason}:PromiseRejectionEvent) {
  const logEntry: UnhandledRejectionLogEntry = {
    type: 'Unhandled rejection',
    reason: reason
  };

  extendWithErrorDetails(logEntry, reason as Error);

  addToLog(logEntry);
});


function extendWithErrorDetails(logEntry:LogEntry, error:Error) {
  if (error){
    logEntry.errorName = error.name;
    logEntry.errorMessage = error.message;
    if (error.stack)
      logEntry.stack = error.stack;
  }
}


function addToLog(logEntry:LogEntry) {
  logEntries.push(logEntry);
  publisher.publish();
}


const errorReportPreamble = "Sorry to hear you had problems running Banana Drum! Please copy this error report and send it to James.\nDon't know James? Get in touch with Banana Drum on Facebook: https://facebook.com/bananadrum.net/\n\nError Report:\n";


interface ErrorLog extends Subscribable {
  getEntryCount(): number
  getMessage(): string
}


interface LogEntry {
  type: 'Error' | 'Unhandled rejection'
  errorName?: string
  errorMessage?: string
  stack?: string
}


interface ErrorLogEntry extends LogEntry {
  type: 'Error'
  message: string | Event
  at: string
  error: Error
}


interface UnhandledRejectionLogEntry extends LogEntry {
  type: 'Unhandled rejection'
  reason: any

}
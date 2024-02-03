const errors:ErrorContainer[] = [];

export function getErrorMessage(): string {
  if (!errors.length)
    return null;

  return JSON.stringify({
    userAgent: navigator.userAgent,
    errors: errors.map(makeMoreReadable)
  });
}

window.onerror =  function(message, url, lineNumber, columnNumber, error) {
  errors.push({message, url, lineNumber, columnNumber, error});
};

function makeMoreReadable({message, url, lineNumber, columnNumber, error}:ErrorContainer): MoreReadableError {
  const moreReadableError:MoreReadableError = {
    message,
    at: `${url}:${lineNumber}.${columnNumber}`,
    error
  };

  if (error){
    moreReadableError.errorName = error.name;
    moreReadableError.errorMessage = error.message;
    if (error.stack)
      moreReadableError.stack = error.stack;
  }

  return 
}

type ErrorContainer = {
  message: string | Event,
  url: string,
  lineNumber: number,
  columnNumber: number,
  error: Error
};

type MoreReadableError = {
  message: string | Event,
  at: string,
  error: Error,
  errorName?: string,
  errorMessage?: string,
  stack?: string
}
import bigInt from 'big-integer';
import { conversionBase, urlCharacterToNumber, urlNumberToCharacter } from './constants.js';

// No negative numbers
export function urlEncodeNumber(input:bigInt.BigInteger): string {
  let output = '';

  do {
    const {quotient, remainder} = input.divmod(conversionBase);
    output = urlNumberToCharacter[remainder.toJSNumber()] + output;
    input = quotient;
  } while (input.greater(bigInt.zero));

  return output;
}


// No negative numbers
export function urlDecodeNumber(input:string): bigInt.BigInteger {
  let output = bigInt.zero;

  while (input.length) {
    output = output.times(conversionBase);
    output = output.plus(urlCharacterToNumber[input[0]]);
    input = input.substring(1);
  }

  return output;
}


export function interpretAsBaseN(inputDigits:number[], base:number): bigInt.BigInteger {
  let multiplier = bigInt.one;
  let total = bigInt.zero;

  for (let column = inputDigits.length - 1; column >= 0; column--) {
    const digit = bigInt(inputDigits[column]);
    total = total.plus(digit.times(multiplier));
    multiplier = multiplier.times(base);
  }

  return total;
}


// Used for converting from a URL to a Track, so the output represents an array of notes
export function convertToBaseN(input:bigInt.BigInteger, base:number): number[] {
  const output:number[] = [];

  do {
    const {quotient, remainder} = input.divmod(base);
    output.unshift(remainder.toJSNumber());
    input = quotient;
  } while (input.greater(bigInt.zero));

  return output;
}
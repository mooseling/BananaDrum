import bigInt from 'big-integer';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import { testableFunctions } from '../../prod/serialisation.js';

const {urlEncodeNumber, urlDecodeNumber, interpretAsBaseN, convertToBaseN} = testableFunctions;


describe('URL encoding numbers', function() {
  it ('decodes up to 100000 back to the same number', () => {
    const limit = bigInt(100000);

    for (let integer = bigInt.zero; integer.lesser(limit); integer = integer.plus(1)) {
      const encoded = urlEncodeNumber(integer);
      const decoded = urlDecodeNumber(encoded);
      assert(decoded.equals(integer), integer + ` -> ${encoded} -> ${decoded}`);
    }
  });
});

describe('Base N conversion', function() {
  it('Encodes/decodes random numbers', () => {
    for (let testCase = 0; testCase < 20; testCase++) {
      const {digits:originalDigits, base} = generateRandomBaseNNumber();
      const numberAsBigInt = interpretAsBaseN(originalDigits, base);
      const convertedDigits = convertToBaseN(numberAsBigInt, base);

      // Add leading zeroes to make arrays the same length
      while (convertedDigits.length < originalDigits.length)
        convertedDigits.unshift(0);

      convertedDigits.some((convertedDigit, index) => {
        assert(
          convertedDigit === originalDigits[index],
          `Base ${base} conversion failed on digit ${index}. Expected ${originalDigits[index]} but got ${convertedDigit}. `
          + `BigInt number: ${numberAsBigInt}. Original array:\n ${originalDigits}\n Converted array:\n ${convertedDigits}`
        );
      });
    }
  });
});

describe('URL encoding base-N numbers', function() {
  it('Encodes/decodes random numbers', () =>{
    for (let testCase = 0; testCase < 20; testCase++) {
      const {digits:originalDigits, base} = generateRandomBaseNNumber();
      const numberAsBigInt = interpretAsBaseN(originalDigits, base);
      const numberAsUrl = urlEncodeNumber(numberAsBigInt);
      const convertedUrl = urlDecodeNumber(numberAsUrl);
      const convertedDigits = convertToBaseN(convertedUrl, base);

      // Add leading zeroes to make arrays the same length
      while (convertedDigits.length < originalDigits.length)
        convertedDigits.unshift(0);

      convertedDigits.some((convertedDigit, index) => {
        assert(
          convertedDigit === originalDigits[index],
          `Base ${base} conversion failed on digit ${index}. Expected ${originalDigits[index]} but got ${convertedDigit}.\n`
          + `BigInt number:\n${numberAsBigInt}.\n Original array:\n ${originalDigits}\n Converted array:\n ${convertedDigits}`
          + `URL: ${numberAsUrl}\nURL into number: ${convertedUrl}`
        );
      });
    }
  });
});


function generateRandomBaseNNumber() {
  const base = randomInt(2, 20);
  const numColumns = randomInt(4, 200);
  const digits:number[] = new Array(numColumns);
  for (let column = 0; column < numColumns; column++)
    digits[column] = randomInt(0, base);

  return {digits, base};
}


function randomInt(min:number, max:number): number {
  const range = max - min;
  const randomNumber = Math.floor(Math.random() * range);
  return randomNumber + min;
}

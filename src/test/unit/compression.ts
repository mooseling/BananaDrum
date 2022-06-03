import {assert} from 'chai';
import {urlEncodeNumber, urlDecodeNumber} from '../../prod/compression';

describe('URL encoding numbers', function() {
  it ('decodes up to 100000 back to the same number', () => {
    for (let i = 0; i < 100000; i++) {
      const encoded = urlEncodeNumber(i);
      const decoded = urlDecodeNumber(encoded);
      assert(decoded === i, i + ` -> ${encoded} -> ${decoded}`)
    }
  });

  it ('decodes random cases back to the same number', () => {
    for (let i = 0; i < 20; i ++) {
      const input = Math.floor(Math.random() * 10000000000);
      const encoded = urlEncodeNumber(input);
      const decoded = urlDecodeNumber(encoded);
      assert(decoded === input, input + ` -> ${encoded} -> ${decoded}`)
    }
  });
});

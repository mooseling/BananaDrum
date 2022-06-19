import {assert} from 'chai';
import {instrumentCollection} from '../lib/example-instruments';

describe('Instrument Library', function() {


  it("doesn't have clashing instrument IDs", () => {
    assertNoClashes(instrumentCollection, 'id', (id:string) => `Duplicate instrument-id: ${id}`);
  });

  it("doesn't have clashing noteStyle IDs", () => {
    instrumentCollection.forEach(({packedNoteStyles, id}) => {
      assertNoClashes(packedNoteStyles, 'id',
      (noteStyleId:string) => `Duplicate noteStyle-id: ${id}.${noteStyleId}`);
    });
  });
});


function assertNoClashes(collection:any[], key:string, messageFunction:(value:any) => string) {
  const seenValues = [];
  collection.forEach(item => {
    const value = item[key];
    assert(!seenValues.includes(value), messageFunction(value));
    seenValues.push(value);
  });
}

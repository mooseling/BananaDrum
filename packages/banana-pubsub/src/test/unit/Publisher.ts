import { assert } from 'chai';
import { describe, it } from 'mocha';
import { createPublisher } from '../../prod/Publisher.js';


describe('Publisher', function() {
  it('Publishes a value to one subscribers', function() {
    const publisher = createPublisher<number>();

    let varToUpdate = 2;
    const subscription = (value:number) => varToUpdate = value;
    publisher.subscribe(subscription);
    publisher.publish(4);

    assert.equal(varToUpdate, 4);
  });
});
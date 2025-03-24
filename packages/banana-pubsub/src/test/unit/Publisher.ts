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

  it('Publishes a value to multiple subscribers', function() {
    const publisher = createPublisher<number>();

    let varToUpdate1 = 2;
    let varToUpdate2 = 3;
    let varToUpdate3 = 4;
    const subscription1 = (value:number) => varToUpdate1 = value;
    const subscription2 = (value:number) => varToUpdate2 = value;
    const subscription3 = (value:number) => varToUpdate3 = value;
    publisher.subscribe(subscription1);
    publisher.subscribe(subscription2);
    publisher.subscribe(subscription3);
    publisher.publish(1_000_000);

    assert.equal(varToUpdate1, 1_000_000);
    assert.equal(varToUpdate2, 1_000_000);
    assert.equal(varToUpdate3, 1_000_000);
  });

  it('Allows unsubscribing', function() {
    const publisher = createPublisher<number>();

    let varToUpdate1 = 2;
    let varToUpdate2 = 3;
    const subscription1 = (value:number) => varToUpdate1 = value;
    const subscription2 = (value:number) => varToUpdate2 = value;
    publisher.subscribe(subscription1);
    publisher.subscribe(subscription2);
    publisher.publish(1_000_000);

    assert.equal(varToUpdate1, 1_000_000);
    assert.equal(varToUpdate2, 1_000_000);

    publisher.unsubscribe(subscription2);
    publisher.publish(3.14159);

    assert.equal(varToUpdate1, 3.14159);
    assert.equal(varToUpdate2, 1_000_000);
  });

  it('Can unsubscribe-all', function() {
    const publisher = createPublisher<number>();

    let varToUpdate1 = 2;
    let varToUpdate2 = 3;
    const subscription1 = (value:number) => varToUpdate1 = value;
    const subscription2 = (value:number) => varToUpdate2 = value;
    publisher.subscribe(subscription1);
    publisher.subscribe(subscription2);
    publisher.publish(1_000_000);

    assert.equal(varToUpdate1, 1_000_000);
    assert.equal(varToUpdate2, 1_000_000);

    publisher.unsubscribeAll();
    publisher.publish(3.14159);

    assert.equal(varToUpdate1, 1_000_000);
    assert.equal(varToUpdate2, 1_000_000);
  });
});
import { assert } from 'chai';
import { describe, it } from 'mocha';
import { createPublisher } from '../../prod/Publisher.js';
import { extractSubscribable } from '../../prod/extractSubscribable.js';


describe('extractSubscribable', function() {
  it('Allows subscribing to a secret publisher', function() {
    const publisher = createPublisher<number>();
    const subscribable = extractSubscribable(publisher);

    let varToUpdate = 2;
    const subscription = (value:number) => varToUpdate = value;
    subscribable.subscribe(subscription);
    publisher.publish(4);

    assert.equal(varToUpdate, 4);
  });

  it('Allows unsubscribing from the secret publisher', function() {
    const publisher = createPublisher<number>();
    const subscribable = extractSubscribable(publisher);

    let varToUpdate = 2;
    const subscription = (value:number) => varToUpdate = value;
    subscribable.subscribe(subscription);
    publisher.publish(4);

    assert.equal(varToUpdate, 4);

    subscribable.unsubscribe(subscription);
    publisher.publish(33);

    assert.equal(varToUpdate, 4);
  });
});
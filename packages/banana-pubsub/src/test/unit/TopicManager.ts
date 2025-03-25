import { describe, it } from 'mocha';
import { createPublisher } from '../../prod/Publisher.js';
import { createTopicManager } from '../../prod/TopicManager.js';
import { Publisher, TopicManager } from '../../prod/types.js';
import { assert } from 'chai';


// A lot of this test is not about running code, but instead running tsc
// We are really constructing an example case of how we're going to use TopicManager in Banana Drum
// And we need to make sure it passes type checks, and also provides the type-safety we want
// I will comment each block below to explain how it corresponds to Banana Drum


// We will subscribe to a mixture of topics on different objects in Banana Drum
// For example, TimeParams will publish both numbers and strings on different topics
// timeSignature is a string, tempo is a number, etc
// So for these objects, we will write an interface which describes the topics it will expose
interface TypedTopicManager extends TopicManager {
  topics: {
    numberTopic: Publisher<number>
    stringTopic: Publisher<string>
  }
}


// The code here is equivalent to what we will write inside our creation function for, eg, TimeParams
function createTypedTopicManager(): TypedTopicManager {
  const topicManager = createTopicManager();
  topicManager.topics.numberTopic = createPublisher<number>();
  topicManager.topics.stringTopic = createPublisher<string>();

  return topicManager as TypedTopicManager;
}


describe('Publisher', function() {
  it('Works with the type system', function() {
    const typedTopicManager = createTypedTopicManager();

    let numberToUpdate = 1;
    let stringToUpdate = 'borp';
    const numberSubscription = (value:number) => numberToUpdate = value;
    const stringSubscription = (value:string) => stringToUpdate = value;
    typedTopicManager.topics.numberTopic.subscribe(numberSubscription);
    typedTopicManager.topics.stringTopic.subscribe(stringSubscription);

    // Importantly, the following lines would fail type checks:
    // typedTopicManager.topics.numberTopic.subscribe(stringSubscription);
    // typedTopicManager.topics.stringTopic.subscribe(numberSubscription);

    typedTopicManager.topics.numberTopic.publish(12);
    typedTopicManager.topics.stringTopic.publish('sporp');

    assert.equal(numberToUpdate, 12);
    assert.equal(stringToUpdate, 'sporp');
  });

  it('Allows bulk unsubscribe', function() {
    const typedTopicManager = createTypedTopicManager();

    let numberToUpdate = 1;
    let stringToUpdate = 'borp';
    const numberSubscription = (value:number) => numberToUpdate = value;
    const stringSubscription = (value:string) => stringToUpdate = value;
    typedTopicManager.topics.numberTopic.subscribe(numberSubscription);
    typedTopicManager.topics.stringTopic.subscribe(stringSubscription);

    typedTopicManager.topics.numberTopic.publish(12);
    typedTopicManager.topics.stringTopic.publish('sporp');

    assert.equal(numberToUpdate, 12);
    assert.equal(stringToUpdate, 'sporp');

    typedTopicManager.unsubscribeAll();

    typedTopicManager.topics.numberTopic.publish(1_000_000_000);
    typedTopicManager.topics.stringTopic.publish('fwoop');

    assert.equal(numberToUpdate, 12);
    assert.equal(stringToUpdate, 'sporp');
  });
});
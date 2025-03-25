import { describe, it } from 'mocha';
import { createPublisher } from '../../prod/Publisher.js';
import { createTopicPublisher } from '../../prod/TopicPublisher.js';
import { Publisher, TopicPublisher } from '../../prod/types.js';
import { assert } from 'chai';


// A lot of this test is not about running code, but instead running tsc
// We are really constructing an example case of how we're going to use TopicPublisher in Banana Drum
// And we need to make sure it passes type checks, and also provides the type-safety we want
// I will comment each block below to explain how it corresponds to Banana Drum


// We will subscribe to a mixture of topics on different objects in Banana Drum
// For example, TimeParams will publish both numbers and strings on different topics
// timeSignature is a string, tempo is a number, etc
// So for these objects, we will write an interface which describes the topics it will expose
interface MixedTopicPublisher extends TopicPublisher {
  topics: {
    numberTopic: Publisher<number>
    stringTopic: Publisher<string>
  }
}


// The code here is equivalent to what we will write inside our creation function for, eg, TimeParams
function createMixedTopicPublisher(): MixedTopicPublisher {
  const topicPublisher = createTopicPublisher();
  topicPublisher.topics.numberTopic = createPublisher<number>();
  topicPublisher.topics.stringTopic = createPublisher<string>();

  return topicPublisher as MixedTopicPublisher;
}


describe('Publisher', function() {
  it('Works with the type system', function() {
    const mixedTopicPublisher = createMixedTopicPublisher();

    let numberToUpdate = 1;
    let stringToUpdate = 'borp';
    const numberSubscription = (value:number) => numberToUpdate = value;
    const stringSubscription = (value:string) => stringToUpdate = value;
    mixedTopicPublisher.topics.numberTopic.subscribe(numberSubscription);
    mixedTopicPublisher.topics.stringTopic.subscribe(stringSubscription);

    // Importantly, the following lines would fail type checks:
    // mixedTopicPublisher.topics.numberTopic.subscribe(stringSubscription);
    // mixedTopicPublisher.topics.stringTopic.subscribe(numberSubscription);

    mixedTopicPublisher.topics.numberTopic.publish(12);
    mixedTopicPublisher.topics.stringTopic.publish('sporp');

    assert.equal(numberToUpdate, 12);
    assert.equal(stringToUpdate, 'sporp');
  });
});
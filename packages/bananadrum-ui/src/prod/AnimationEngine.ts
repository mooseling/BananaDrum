import {AnimationEngine} from './types';
import { createPublisher } from 'bananadrum-core';
import { EventEngine, EventEngineState } from 'bananadrum-player';


// Currently this is just doing auto-scroll
// Potentially, we could make an optimisation
// We could toggle autofollow on and off by connecting and disconnecting the callback
// If there are no registered callbacks, the engine can just do nothing
// Instead, we are currently always running the callback, and the callback is deciding to do nothing


export function getAnimationEngine(eventEngine:EventEngine): AnimationEngine {
  const animations = [];
  let state:EventEngineState = 'stopped';
  let nextAnimationId = null;
  const publisher = createPublisher();

  eventEngine.subscribe(() => {
    if (eventEngine.state === 'playing')
      return start();
    stop();
  });

  return {
    connect(animation) {
      animations.push(animation);
    },
    disconnect(animation) {
      const animationIndex = animations.indexOf(animation);
      if (animationIndex !== -1)
        animations.splice(animationIndex, 1);
    },
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get state() {return state;}
  }


  function start() {
    if (state === 'stopped') {
      state = 'playing';
      publisher.publish();
      loop();
    }
  }


  function stop() {
    if (state === 'playing') {
      cancelAnimationFrame(nextAnimationId);
      state = 'stopped';
      publisher.publish();
    }
  }


  function loop() {
    nextAnimationId = requestAnimationFrame(() => {
      animations.forEach(animation => animation(eventEngine.getTime()));
      loop();
    });
  }
}
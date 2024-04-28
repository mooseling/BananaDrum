import { Arrangement, Subscription } from "bananadrum-core";
import { useEffect } from "react";
import { useSubscription } from "./useSubscription";

export function useArrangementAndTracksSubscription(arrangement:Arrangement, callback:Subscription): void {
  useSubscription(arrangement, callback);

  useEffect(() => {
    const subscribedTracks:string[] = [];

    for (const trackId in arrangement.tracks) {
      arrangement.tracks[trackId].subscribe(callback);
      subscribedTracks.push(trackId);
    }

    const arrangementSubscription = () => {
      for (const trackId in arrangement.tracks) {
        if (!subscribedTracks.includes(trackId)) {
          arrangement.tracks[trackId].subscribe(callback);
          subscribedTracks.push(trackId);
        }
      }
    };
    arrangement.subscribe(arrangementSubscription);

    return () => {
      arrangement.unsubscribe(arrangementSubscription);
      subscribedTracks.forEach(trackId => {
        if (arrangement.tracks[trackId])
          arrangement.tracks[trackId].unsubscribe(callback);
      })
    }
  });
}

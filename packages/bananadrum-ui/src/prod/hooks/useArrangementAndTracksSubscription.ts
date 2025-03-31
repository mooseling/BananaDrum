import { ArrangementView, Subscription, TrackView } from "bananadrum-core";
import { useEffect } from "react";
import { useSubscription } from "./useSubscription";

export function useArrangementAndTracksSubscription(arrangement:ArrangementView, callback:Subscription): void {
  useSubscription(arrangement, callback);

  useEffect(() => {
    const subscribedTracks:Set<TrackView> = new Set();

    arrangement.tracks.forEach(track => {
      track.subscribe(callback);
      subscribedTracks.add(track);
    });

    const arrangementSubscription = () => {
      subscribedTracks.forEach(track => {
        if (!arrangement.tracks.includes(track)) {
          track.unsubscribe(callback);
          subscribedTracks.delete(track);
        }
      });

      arrangement.tracks.forEach(track => {
        if (!subscribedTracks.has(track)) {
          track.subscribe(callback);
          subscribedTracks.add(track);
        }
      });
    };
    arrangement.subscribe(arrangementSubscription);

    return () => {
      arrangement.unsubscribe(arrangementSubscription);
      subscribedTracks.forEach(track => track.unsubscribe(callback));
    }
  });
}

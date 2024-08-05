import { LameJS } from "./lamejs.types";

declare global {
  // eslint-disable-next-line no-var
  var bananaGlobals: {
    player:PlayerGlobals
  }
}

interface PlayerGlobals {
  lame: {
    loadPromise: Promise<void>
    setLoaded: () => void
    lamejs?: LameJS
  }
}



// ===================== Exports =====================
// Export things for access in modules

let lamejsResolve: () => void;
const lamejsPromise = new Promise<void>(resolve => lamejsResolve = resolve);

export const playerGlobals:PlayerGlobals = {
  lame: {
    loadPromise: lamejsPromise,
    setLoaded: lamejsResolve
  }
};



// ===================== window =====================
// Attach properties to window for other scripts to interact with

if (!window.bananaGlobals) {
  window.bananaGlobals = {
    player: playerGlobals
  };
} else if (!window.bananaGlobals.player){
  window.bananaGlobals.player = playerGlobals;
}

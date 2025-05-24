import { useContext } from 'react';
import { BananaDrumContext } from '../../BananaDrumUi';
import { useStateSubscription } from '../../hooks/useStateSubscription';
import { SmallSpacer } from '../SmallSpacer.js';

export function UndoRedo(): JSX.Element {
  const bananaDrum = useContext(BananaDrumContext);

   const canUndo = useStateSubscription(bananaDrum.topics.canUndo, () => bananaDrum.canUndo);
   const canRedo = useStateSubscription(bananaDrum.topics.canRedo, () => bananaDrum.canRedo);

   return (<div className='undo-redo-wrapper'>
    <button className='push-button medium gray' disabled={!canUndo} onClick={bananaDrum.undo}>
      <img src="images/icons/undo_white.svg" style={{height:'0.78em'}} />
    </button>
    <SmallSpacer />
    <button className='push-button medium gray' disabled={!canRedo}onClick={bananaDrum.redo}>
    <img src="images/icons/redo_white.svg" style={{height:'0.78em'}} />
    </button>
  </div>);
}
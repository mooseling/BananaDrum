import { useContext } from 'react';
import { BananaDrumContext } from '../../BananaDrumUi';
import { useStateSubscription } from '../../hooks/useStateSubscription';

export function UndoRedo(): JSX.Element {
  const bananaDrum = useContext(BananaDrumContext);

   const canUndo = useStateSubscription(bananaDrum.topics.canUndo, () => bananaDrum.canUndo);
   const canRedo = useStateSubscription(bananaDrum.topics.canRedo, () => bananaDrum.canRedo);

   return (<>
    {canUndo && (<button className='push-button medium gray' onClick={bananaDrum.undo}>Undo</button>)}
    {canRedo && (<button className='push-button medium gray' onClick={bananaDrum.redo}>Redo</button>)}
    </>)
}
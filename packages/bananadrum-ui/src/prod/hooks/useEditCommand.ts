import { useCallback, useContext } from 'react';
import { BananaDrumContext } from '../components/BananaDrumViewer.js';
import type { EditCommand } from 'bananadrum-core/types';


export type EditFunction = (command:EditCommand) => void


export function useEditCommand(): EditFunction {
  const bananaDrum = useContext(BananaDrumContext);
  return useCallback((command:EditCommand) => bananaDrum.edit(command), []);
}

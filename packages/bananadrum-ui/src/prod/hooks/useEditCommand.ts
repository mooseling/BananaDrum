import { useCallback, useContext } from 'react';
import { BananaDrumContext } from '../components/BananaDrumViewer.js';
import { EditCommand } from 'bananadrum-core';


export type EditFunction = (command:EditCommand) => void


export function useEditCommand(): EditFunction {
  const bananaDrum = useContext(BananaDrumContext);
  return useCallback((command:EditCommand) => bananaDrum.edit(command), []);
}

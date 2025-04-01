import { useCallback, useContext } from 'react';
import { BananaDrumContext } from '../BananaDrumUi';
import { EditCommand } from 'bananadrum-core';


export type EditFunction = (command:EditCommand) => void


export function useEditCommand(): EditFunction {
  const bananaDrum = useContext(BananaDrumContext);
  return useCallback((command:EditCommand) => bananaDrum.edit(command), []);
}
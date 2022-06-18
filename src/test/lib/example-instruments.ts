export const instrumentCollection:Banana.InstrumentCollection = [
  {
    id: '0',
    displayName: 'Agogo',
    packedNoteStyles: [],
    colourGroup: 'yellow'
  },
  {
    id: '1',
    displayName: 'Chocalho',
    packedNoteStyles: [],
    colourGroup: 'yellow'
  },
  {
    id: '2',
    displayName: 'Tamborim',
    packedNoteStyles: [],
    colourGroup: 'orange'
  },
  {
    id: '3',
    displayName: 'Repanique',
    packedNoteStyles: [],
    colourGroup: 'orange'
  },
  {
    id: '4',
    displayName: 'Caixa',
    packedNoteStyles: [],
    colourGroup: 'green'
  },
  // {
  //   id: '5',
  //   displayName: 'Timba',
  //   packedNoteStyles: [],
  //   colourGroup: 'blue'
  // },
  {
    id: '6',
    displayName: 'High Surdo',
    packedNoteStyles: [
      {
        id: '1',
        file: 'High_Surdo_Accent.mp3',
        symbol: {
          src:'images/icons/O.svg',
          string: 'accent'
        }
      },
      {
        id: '2',
        file: 'High_Surdo_Muted.mp3',
        symbol: {
          src:'images/icons/O_closed.svg',
          string: 'muted'
        }
      }
    ],
    colourGroup: 'purple'
  },
  {
    id: '7',
    displayName: 'Mid Surdo',
    packedNoteStyles: [
      {
        id: '1',
        file: 'Mid_Surdo_Accent.mp3',
        symbol: {
          src:'images/icons/O.svg',
          string: 'accent'
        }
      },
      {
        id: '2',
        file: 'Mid_Surdo_Muted.mp3',
        symbol: {
          src:'images/icons/O_closed.svg',
          string: 'muted'
        }
      }
    ],
    colourGroup: 'purple'
  },
  {
    id: '8',
    displayName: 'Low Surdo',
    packedNoteStyles: [
      {
        id: '1',
        file: 'Low_Surdo_Accent.mp3',
        symbol: {
          src:'images/icons/O.svg',
          string: 'accent'
        }
      },
      {
        id: '2',
        file: 'Low_Surdo_Muted.mp3',
        symbol: {
          src:'images/icons/O_closed.svg',
          string: 'muted'
        }
      }
    ],
    colourGroup: 'purple'
  },
];

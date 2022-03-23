export const instrumentCollection:Banana.InstrumentCollection = [
  {
    instrumentId: 'ride',
    displayName: 'Ride',
    packedNoteStyles: [
      {
        noteStyleId: 'tap',
        file: 'ride_tap.mp3',
        symbol:{src:'images/icons/o_closed_lower.svg'}
      },
      {
        noteStyleId: 'crash',
        file: 'ride_crash.mp3',
        symbol:{src:'images/icons/X.svg'}
      },
      {
        noteStyleId: 'bell',
        file: 'ride_bell.mp3',
        symbol:{src:'images/icons/hollow_diamond.svg'}
      }
    ],
    colourGroup: 'yellow'
  },
  {
    instrumentId: 'crash',
    displayName: 'Crash',
    packedNoteStyles: [
      {
        noteStyleId: 'crash',
        file: 'crash_crash.mp3',
        symbol:{src:'images/icons/X.svg'}
      },
      {
        noteStyleId: 'tap',
        file: 'crash_tap.mp3',
        symbol:{src:'images/icons/o_closed_lower.svg'}
      },
      {
        noteStyleId: 'bell',
        file: 'crash_bell.mp3',
        symbol:{src:'images/icons/hollow_diamond.svg'}
      }
    ],
    colourGroup: 'yellow'
  },
  {
    instrumentId: 'hihat',
    displayName: 'Hi Hat',
    packedNoteStyles: [
      {
        noteStyleId: 'closed',
        file: 'hihat_closed.mp3',
        symbol:{src:'images/icons/x_lower.svg'}
      },
      {
        noteStyleId: 'open',
        file: 'hihat_open.mp3',
        symbol:{src:'images/icons/O.svg'}
      },
      {
        noteStyleId: 'foot',
        file: 'hihat_foot.mp3',
        symbol:{src:'images/icons/o_lower.svg'}
      },
      {
        noteStyleId: 'trash',
        file: 'hihat_trash.mp3',
        symbol:{src:'images/icons/X.svg'}
      }
    ],
    colourGroup: 'yellow'
  },
  {
    instrumentId: 'snare',
    displayName: 'Snare',
    packedNoteStyles: [
      {
        noteStyleId: 'accent',
        file: 'snare_accent.mp3',
        symbol:{src:'images/icons/X.svg'}
      },
      {
        noteStyleId: 'ghost',
        file: 'snare_ghost.mp3',
        symbol:{src:'images/icons/x_lower.svg'}
      },
      {
        noteStyleId: 'rimshot',
        file: 'snare_rimshot.mp3',
        symbol:{src:'images/icons/sun_rise_rays.svg'}
      },
      {
        noteStyleId: 'sidestick',
        file: 'snare_sidestick.mp3',
        symbol:{src:'images/icons/sidestick.svg'}
      }
    ],
    colourGroup: 'green'
  },
  {
    instrumentId: 'kick',
    displayName: 'Kick drum',
    packedNoteStyles: [
      {
        noteStyleId: 'accent',
        file: 'kick_accent.mp3',
        symbol:{src:'images/icons/O_closed.svg'}
      },
      {
        noteStyleId: 'ghost',
        file: 'kick_ghost.mp3',
        symbol:{src:'images/icons/o_closed_lower.svg'}
        // displayName, symbol
      }
    ],
    colourGroup: 'blue'
  },
  {
    instrumentId: 'hightom',
    displayName: 'High Tom',
    packedNoteStyles: [
      {
        noteStyleId: 'accent',
        file: 'hightom_accent.mp3',
        symbol:{src:'images/icons/O_closed.svg'}
      },
      {
        noteStyleId: 'ghost',
        file: 'hightom_ghost.mp3',
        symbol:{src:'images/icons/o_closed_lower.svg'}
      }
    ],
    colourGroup: 'purple'
  },
  {
    instrumentId: 'midtom',
    displayName: 'Mid Tom',
    packedNoteStyles: [
      {
        noteStyleId: 'accent',
        file: 'midtom_accent.mp3',
        symbol:{src:'images/icons/O_closed.svg'}
      },
      {
        noteStyleId: 'ghost',
        file: 'midtom_ghost.mp3',
        symbol:{src:'images/icons/o_closed_lower.svg'}
      }
    ],
    colourGroup: 'purple'
  },
  {
    instrumentId: 'floortom',
    displayName: 'Floor Tom',
    packedNoteStyles: [
      {
        noteStyleId: 'accent',
        file: 'floortom_accent.mp3',
        symbol:{src:'images/icons/O_closed.svg'}
      },
      {
        noteStyleId: 'ghost',
        file: 'floortom_ghost.mp3',
        symbol:{src:'images/icons/o_closed_lower.svg'}
      }
    ],
    colourGroup: 'purple'
  }
];

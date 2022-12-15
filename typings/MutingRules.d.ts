declare namespace Banana {

  type MutingRule = MutingRuleSimple | MutingRuleOtherInstrument

  interface MutingRuleOtherInstrument {
    name: 'otherInstrument'
    id: string
  }

  type MutingRuleSimple = string;
}

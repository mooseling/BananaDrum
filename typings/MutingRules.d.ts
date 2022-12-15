declare namespace Banana {

  type MutingRule = MutingRuleSimple | MutingRuleInstrument

  interface MutingRuleInstrument {
    name: 'instrument'
    id: string
  }

  type MutingRuleSimple = string;
}

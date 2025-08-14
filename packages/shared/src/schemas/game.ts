// Osové typy
export type Axis = 'EI' | 'NS' | 'TF' | 'PJ';
export type PoleEI = 'E' | 'I';
export type PoleNS = 'N' | 'S';
export type PoleTF = 'T' | 'F';
export type PolePJ = 'P' | 'J';
export type Pole = PoleEI | PoleNS | PoleTF | PolePJ;

export interface MBTIEffect {
  axis: Axis;
  toward: Pole;     // např. 'E' nebo 'J'
  weight: number;   // typicky 1–3, drobky 0.5
  reason?: string;  // log pro archiv/debug
}

export type ThemeName =
  | 'synthoma' | 'green-matrix' | 'neon-hellfire' | 'cyber-dystopia' | 'acid-glitch' | 'retro-arcade';

export type EffectType =
  | { type: 'hp'; value: number }
  | { type: 'sanity'; value: number }
  | { type: 'access'; value: number }
  | { type: 'theme'; value: ThemeName }
  | { type: 'toast'; value: 'info'|'success'|'warning'|'error'; message: string }
  | { type: 'overlay'; value: 'loading'|'error'; ms?: number }
  | { type: 'delay'; ms: number }
  | { type: 'modal'; modalId: string } // risk confirm
  | { type: 'mbti'; value: MBTIEffect }; // jemný posun profilu

export type OptionTag =
  | 'analysis' | 'risk' | 'social' | 'symbol'
  | 'plan' | 'improv' | 'empathy' | 'aggression';

export interface Option {
  id: string;
  label: string;
  hint?: string;           // pro popover
  tags?: OptionTag[];      // nové
  effects: EffectType[];
  nextId: string;
  need?: { access?: number; itemId?: string; sanityMin?: number };
  block?: { sanityMax?: number };
}

export interface NodeDef {
  id: string;
  title: string;
  unstable?: boolean;      // zapne GlitchScrambleTitle
  text: string;
  options: Option[];
  onEnter?: EffectType[];  // automatické efekty při vstupu (drifty, teleport, overlay)
  tags?: Array<'glitch'|'memory_trap'|'portal:strach'|'portal:vina'|'portal:pycha'|'portal:zapomneni'|'combat'|'lore'>;
}

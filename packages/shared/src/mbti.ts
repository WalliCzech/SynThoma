export interface MBTICounter {
  E: number; I: number; N: number; S: number; T: number; F: number; P: number; J: number;
  events: Array<{ at: number; axis: 'EI'|'NS'|'TF'|'PJ'; toward: 'E'|'I'|'N'|'S'|'T'|'F'|'P'|'J'; w: number; source: string }>;
  rt: number[];
}

export interface MBTIResult {
  code: string;   // např. "INTP"
  confidence: number; // 0..1 (min margin mezi dvojicemi)
  axes: {
    EI: { E: number; I: number; letter: 'E'|'I'; margin: number };
    NS: { N: number; S: number; letter: 'N'|'S'; margin: number };
    TF: { T: number; F: number; letter: 'T'|'F'; margin: number };
    PJ: { P: number; J: number; letter: 'P'|'J'; margin: number };
  };
  notes: string[];
}

function pick(letter1: keyof MBTICounter, letter2: keyof MBTICounter, mb: MBTICounter) {
  const a = (mb[letter1] as number) || 0;
  const b = (mb[letter2] as number) || 0;
  const letter = a >= b ? (letter1 as any) : (letter2 as any);
  const margin = Math.abs(a - b);
  return { a, b, letter, margin };
}

export function computeMBTI(mb: MBTICounter): MBTIResult {
  const EI = pick('E','I', mb);
  const NS = pick('N','S', mb);
  const TF = pick('T','F', mb);
  const PJ = pick('P','J', mb);

  const code = `${EI.letter}${NS.letter}${TF.letter}${PJ.letter}`;
  const norm = (x: number) => Math.min(1, x / 8); // 8 = zhruba „silný rozdíl“ v běžném runu
  const confidence = Math.min(norm(EI.margin), norm(NS.margin), norm(TF.margin), norm(PJ.margin));

  const notes: string[] = [];
  if (EI.margin < 2) notes.push('Sociální vs. intro směr je vyrovnaný. Další běhy rozhodnou.');
  if (NS.margin < 2) notes.push('Intuice vs. fakta: napínavá remíza.');
  if (TF.margin < 2) notes.push('Rozum vs. cit: používáš obojí, jak se to hodí.');
  if (PJ.margin < 2) notes.push('Plán vs. improvizace: žádná tyranie pořádku ani chaosu.');

  return {
    code,
    confidence,
    axes: {
      EI: { E: mb.E, I: mb.I, letter: EI.letter as any, margin: EI.margin },
      NS: { N: mb.N, S: mb.S, letter: NS.letter as any, margin: NS.margin },
      TF: { T: mb.T, F: mb.F, letter: TF.letter as any, margin: TF.margin },
      PJ: { P: mb.P, J: mb.J, letter: PJ.letter as any, margin: PJ.margin },
    },
    notes,
  };
}

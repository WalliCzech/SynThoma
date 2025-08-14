import type { NodeDef } from '../schemas/game';

export const BASE_NODES: NodeDef[] = [
  {
    id: 'void-boot',
    title: 'PRÁZDNOTA: studený boot',
    unstable: true,
    text: 'Ozón v plicích. V dálce bliká #f6ff00. Hlas: „Vítej, NULL-1.“',
    onEnter: [
      { type: 'toast', value: 'info', message: 'Systém se tě snaží identifikovat…' },
      { type: 'overlay', value: 'loading', ms: 300 },
    ],
    options: [
      {
        id: 'touch-wall',
        label: 'Dotknout se zdi a naslouchat vibracím',
        hint: 'Senzorika místo slov',
        tags: ['symbol'],
        effects: [
          { type: 'sanity', value: +2 },
          { type: 'mbti', value: { axis: 'NS', toward: 'S', weight: 2, reason: 'Somatická/konkrétní volba' } },
        ],
        nextId: 'hub',
      },
      {
        id: 'call-sarkasma',
        label: 'Zavolat Sarkasmu',
        hint: 'Dialog jako nástroj',
        tags: ['social','analysis'],
        effects: [
          { type: 'access', value: +3 },
          { type: 'mbti', value: { axis: 'EI', toward: 'E', weight: 2, reason: 'Sociální interakce' } },
          { type: 'mbti', value: { axis: 'TF', toward: 'T', weight: 1, reason: 'Instrumentální přístup' } },
        ],
        nextId: 'hub',
      },
      {
        id: 'interpret-glitch',
        label: 'Interpretovat glitch jako znamení',
        hint: 'Symboly, ne povrchy',
        tags: ['symbol'],
        effects: [
          { type: 'mbti', value: { axis: 'NS', toward: 'N', weight: 3, reason: 'Abstraktní interpretace' } },
          { type: 'toast', value: 'success', message: 'Intuice spojila body…' },
        ],
        nextId: 'hub',
      },
    ],
  },
  {
    id: 'hub',
    title: 'UZEL: rozcestí',
    text: 'Neon se láme o vodu. Portály pulzují: cyan, magenta, žluť.',
    onEnter: [],
    options: [
      {
        id: 'go-swamp',
        label: 'Prozkoumat Mokřad',
        hint: 'Glitchka zpívá blízko',
        tags: ['symbol'],
        effects: [
          { type: 'toast', value: 'warning', message: 'Lullaby navádí…' },
          { type: 'mbti', value: { axis: 'TF', toward: 'F', weight: 2, reason: 'Srdce nad taktiku' } },
        ],
        nextId: 'swamp',
      },
      {
        id: 'scan-logs',
        label: 'Prohnat logy detektorem chyb',
        hint: 'Inženýrská cesta',
        tags: ['analysis','plan'],
        effects: [
          { type: 'overlay', value: 'loading', ms: 250 },
          { type: 'access', value: +5 },
          { type: 'mbti', value: { axis: 'TF', toward: 'T', weight: 3, reason: 'Analýza nad vztah' } },
          { type: 'mbti', value: { axis: 'PJ', toward: 'J', weight: 2, reason: 'Struktura/plán' } },
        ],
        nextId: 'lab',
      },
      {
        id: 'wander',
        label: 'Jít tam, kde mapa mlčí',
        hint: 'Pochybná svoboda',
        tags: ['improv'],
        effects: [
          { type: 'mbti', value: { axis: 'PJ', toward: 'P', weight: 3, reason: 'Explorace bez plánu' } },
          { type: 'toast', value: 'info', message: 'Mapa přepisuje okraje…' },
        ],
        nextId: 'fog',
      },
    ],
  },
  {
    id: 'swamp',
    title: 'NEONOVÝ MOKŘAD',
    unstable: true,
    text: 'Lullaby. Voda má paměť. Liščí ocas mizí v magentě.',
    onEnter: [
      { type: 'mbti', value: { axis: 'EI', toward: 'I', weight: 1, reason: 'Tichá introspekce' } },
    ],
    options: [
      {
        id: 'follow-glitchka',
        label: 'Následovat Glitchku (risk)',
        hint: 'Modál potvrdí riziko',
        tags: ['risk','improv','symbol'],
        effects: [
          { type: 'modal', modalId: 'modal-run' },
          { type: 'mbti', value: { axis: 'PJ', toward: 'P', weight: 1, reason: 'Risk/otevřenost' } },
          { type: 'mbti', value: { axis: 'TF', toward: 'F', weight: 1 } },
        ],
        nextId: 'den',
      },
      {
        id: 'set-trap',
        label: 'Nastražit past podle manuálu',
        tags: ['plan','analysis'],
        effects: [
          { type: 'mbti', value: { axis: 'PJ', toward: 'J', weight: 2, reason: 'Plán/procedura' } },
          { type: 'mbti', value: { axis: 'NS', toward: 'S', weight: 1 } },
        ],
        nextId: 'den',
      },
    ],
  },
];

export const EXTRA_NODES: NodeDef[] = [
  {
    id: 'lab',
    title: 'LAB: audit logů',
    text: 'Bílé rukavice Archivářů šustí. Terminály pípají rytmem viny.',
    tags: ['lore'],
    onEnter: [
      { type: 'overlay', value: 'loading', ms: 220 },
      { type: 'toast', value: 'info', message: 'Propojení se záznamy…' },
    ],
    options: [
      {
        id: 'parse-protocol',
        label: 'Rozebrat protokol chyb',
        hint: 'Studená analýza',
        tags: ['analysis','plan'],
        effects: [
          { type: 'access', value: +6 },
          { type: 'mbti', value: { axis:'TF', toward:'T', weight: 3, reason:'Analytická volba' } },
          { type: 'mbti', value: { axis:'PJ', toward:'J', weight: 2, reason:'Postup/procedura' } },
        ],
        nextId: 'hub',
      },
      {
        id: 'talk-archivist',
        label: 'Prohodit pár slov s Archivářem',
        hint: 'Možná tě označkuje',
        tags: ['social','plan'],
        effects: [
          { type: 'toast', value: 'warning', message: '„Vstup zaznamenán.“' },
          { type: 'mbti', value: { axis:'EI', toward:'E', weight: 2, reason:'Sociální interakce' } },
          { type: 'mbti', value: { axis:'PJ', toward:'J', weight: 1 } },
        ],
        nextId: 'hub',
      },
      {
        id: 'sabotage-checksum',
        label: 'Sabotovat checksum a sledovat, co upadne',
        hint: 'Risk – modál',
        tags: ['risk','improv','symbol'],
        effects: [
          { type: 'modal', modalId: 'modal-run' },
          { type: 'toast', value: 'error', message: 'Checksum se směje zpátky.' },
          { type: 'mbti', value: { axis:'PJ', toward:'P', weight: 2, reason:'Improvizace/risk' } },
          { type: 'mbti', value: { axis:'NS', toward:'N', weight: 1 } },
        ],
        nextId: 'fog',
      },
    ],
  },
  {
    id: 'fog',
    title: 'DATOVÁ MLHA',
    unstable: true,
    text: 'Mlžná šedá #c0faff pohlcuje hrany. Hlas: „Ztratit se není chyba.“',
    tags: ['glitch','memory_trap'],
    onEnter: [
      { type: 'toast', value: 'info', message: 'Mapa přepisuje okraje…' }
    ],
    options: [
      {
        id: 'stand-still',
        label: 'Zastavit se a poslouchat kroky',
        hint: 'Somatika',
        tags: ['symbol'],
        effects: [
          { type: 'sanity', value: +3 },
          { type: 'mbti', value: { axis:'NS', toward:'S', weight: 2, reason:'Vnímání konkrétních podnětů' } },
        ],
        nextId: 'hub',
      },
      {
        id: 'draw-from-memory',
        label: 'Nakreslit mapu z paměti',
        hint: 'Abstraktní rekonstrukce',
        tags: ['analysis','plan','symbol'],
        effects: [
          { type: 'mbti', value: { axis:'NS', toward:'N', weight: 3 } },
          { type: 'mbti', value: { axis:'PJ', toward:'J', weight: 1 } },
        ],
        nextId: 'lab',
      },
      {
        id: 'call-out',
        label: 'Zavolat do mlhy: „Kdo tam?“',
        hint: 'Možná někdo odpoví',
        tags: ['social','improv'],
        effects: [
          { type: 'mbti', value: { axis:'EI', toward:'E', weight: 2 } },
          { type: 'toast', value: 'warning', message: 'Echo vrací cizí jméno.' },
        ],
        nextId: 'den',
      },
    ],
  },
  {
    id: 'den',
    title: 'NORA GLITCHKY',
    text: 'Liščí chloupky jiskří magentou #ff00ff. Lullaby mění metrum.',
    tags: ['glitch','lore'],
    onEnter: [
      { type: 'mbti', value: { axis:'TF', toward:'F', weight: 1, reason:'Atmosférická empatie' } },
    ],
    options: [
      {
        id: 'confess',
        label: 'Přiznat svůj nejhorší pád',
        hint: 'Upřímnost pálí',
        tags: ['empathy','social'],
        effects: [
          { type: 'sanity', value: -4 },
          { type: 'mbti', value: { axis:'TF', toward:'F', weight: 3 } },
        ],
        nextId: 'cathedral',
      },
      {
        id: 'set-trap-den',
        label: 'Připravit past podle manuálu',
        tags: ['plan','analysis'],
        effects: [
          { type: 'mbti', value: { axis:'PJ', toward:'J', weight: 2 } },
          { type: 'mbti', value: { axis:'NS', toward:'S', weight: 1 } },
          { type: 'toast', value: 'success', message: 'Glitchka mění trasu… zatím.' },
        ],
        nextId: 'cathedral',
      },
      {
        id: 'follow-deeper',
        label: 'Jít hlouběji (risk)',
        hint: 'Modál: „Jistý si opravdu nejsi.“',
        tags: ['risk','improv','symbol'],
        effects: [
          { type: 'modal', modalId: 'modal-run' },
          { type: 'mbti', value: { axis:'PJ', toward:'P', weight: 2 } },
          { type: 'mbti', value: { axis:'NS', toward:'N', weight: 1 } },
          { type: 'sanity', value: -6 },
        ],
        nextId: 'fog',
      },
    ],
  },
  {
    id: 'cathedral',
    title: 'KATEDRÁLA PROMPTŮ',
    unstable: true,
    text: 'Kazatelna systémových hlášek. Bannery #f6ff00 blikají jako výstrahy.',
    tags: ['lore','glitch'],
    onEnter: [
      { type: 'overlay', value: 'loading', ms: 180 },
    ],
    options: [
      {
        id: 'ritual-restart',
        label: 'Zahájit rituál restartu (risk)',
        hint: 'Potvrzení je závazek',
        tags: ['risk','plan'],
        effects: [
          { type: 'modal', modalId: 'modal-run' },
          { type: 'toast', value: 'warning', message: 'Restart nikdy není čistý.' },
          { type: 'mbti', value: { axis:'PJ', toward:'J', weight: 2 } },
        ],
        nextId: 'hub',
      },
      {
        id: 'inject-custom',
        label: 'Vpravit vlastní prompt do liturgie',
        hint: 'Hack a improvizace',
        tags: ['analysis','improv'],
        effects: [
          { type: 'access', value: +7 },
          { type: 'mbti', value: { axis:'TF', toward:'T', weight: 2 } },
          { type: 'mbti', value: { axis:'PJ', toward:'P', weight: 1 } },
          { type: 'toast', value: 'success', message: 'Liturgie se zadrhla. Máš okno.' },
        ],
        nextId: 'hub',
      },
      {
        id: 'refuse',
        label: 'Odmítnout hrát podle pravidel',
        tags: ['improv','symbol'],
        effects: [
          { type: 'mbti', value: { axis:'PJ', toward:'P', weight: 2 } },
          { type: 'mbti', value: { axis:'NS', toward:'N', weight: 1 } },
          { type: 'sanity', value: +2 },
        ],
        nextId: 'hub',
      },
    ],
  },
];

export const NODES: NodeDef[] = [...BASE_NODES, ...EXTRA_NODES];

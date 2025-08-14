import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Option, MBTIEffect, Axis, Pole, ThemeName } from '@shared/schemas/game';

interface MBTICounter {
  E: number; I: number; N: number; S: number; T: number; F: number; P: number; J: number;
  events: { at: number; axis: Axis; toward: Pole; w: number; source: string }[];
  rt: number[]; // reaction times
}

interface RunState {
  nodeId: string;
  hp: number; sanity: number; access: number;
  theme: ThemeName;
  score: number;
  visited: string[];
  lastEnterTs: number | null;
  mbti: MBTICounter;
}

interface RunActions {
  init: (startId: string) => void;
  enterNode: (id: string) => void;
  choose: (opt: Option) => void;
  applyEffect: (e: any, source?: string) => void;
  setTheme: (t: ThemeName) => void;
}

const clamp = (n: number, min=0, max=100) => Math.max(min, Math.min(max, n));

export const useRunStore = create<RunState & RunActions>()(persist((set, get) => ({
  nodeId: 'void-boot',
  hp: 100, sanity: 100, access: 0,
  theme: 'synthoma',
  score: 0,
  visited: [],
  lastEnterTs: null,
  mbti: { E:0,I:0,N:0,S:0,T:0,F:0,P:0,J:0, events: [], rt: [] },

  init(startId) {
    set({ nodeId: startId, visited: [startId], lastEnterTs: (typeof performance !== 'undefined' ? performance.now() : Date.now()),
      hp:100, sanity:100, access:0, score: 0,
      mbti: { E:0,I:0,N:0,S:0,T:0,F:0,P:0,J:0, events: [], rt: [] }
    });
  },

  enterNode(id) {
    set(state => ({
      nodeId: id,
      visited: state.visited.includes(id) ? state.visited : [...state.visited, id],
      lastEnterTs: (typeof performance !== 'undefined' ? performance.now() : Date.now()),
      score: state.score + 1,
      // neon-hellfire sanity drift −2/uzel (UI může zobrazit toast)
      sanity: state.theme === 'neon-hellfire' ? clamp(state.sanity - 2) : state.sanity,
    }));
  },

  choose(opt) {
    const start = get().lastEnterTs;
    if (start) {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const rt = now - start;
      // Heuristika: <3s lehce posílí J, >10s lehce posílí P
      if (rt < 3000) get().applyEffect({ type: 'mbti', value: { axis: 'PJ', toward: 'J', weight: 0.5 } }, 'rt<3s');
      if (rt > 10000) get().applyEffect({ type: 'mbti', value: { axis: 'PJ', toward: 'P', weight: 0.5 } }, 'rt>10s');
      set(s => ({ mbti: { ...s.mbti, rt: [...s.mbti.rt, rt] }}));
    }
    // UI orchestrátor zpracuje modal/toast/overlay/delay. Store aplikuje jen numerické/MBTI/theme.
    for (const e of opt.effects) {
      get().applyEffect(e, `opt:${opt.id}`);
    }
  },

  applyEffect(e, source='') {
    set(state => {
      if (e.type === 'hp') return { hp: clamp(state.hp + e.value) };
      if (e.type === 'sanity') return { sanity: clamp(state.sanity + e.value) };
      if (e.type === 'access') {
        let delta = e.value;
        if (state.theme === 'green-matrix') {
          delta += Math.round(e.value * 0.1); // +10% reward
        }
        return { access: clamp(state.access + delta) };
      }
      if (e.type === 'theme') return { theme: e.value as ThemeName };
      if (e.type === 'mbti') {
        const { axis, toward, weight } = e.value as MBTIEffect;
        const mbti = { ...state.mbti };
        (mbti as any)[toward] = ((mbti as any)[toward] || 0) + weight;
        mbti.events.push({ at: Date.now(), axis, toward, w: weight, source });
        return { mbti };
      }
      return {};
    });

    // Motivové jemné biasy (UI efekty stále mimo store)
    const theme = get().theme;
    if (e.type === 'mbti') return; // nedvojit
    if (theme === 'neon-hellfire' && e.type === 'modal') {
      get().applyEffect({ type:'mbti', value:{ axis:'PJ', toward:'P', weight: 0.5 }}, 'theme:hellfire');
    }
    if (theme === 'cyber-dystopia' && e.type === 'modal') {
      get().applyEffect({ type:'mbti', value:{ axis:'PJ', toward:'J', weight: 0.5 }}, 'theme:dystopia');
    }
    if (theme === 'acid-glitch' && e.type === 'toast' && e.value === 'info') {
      get().applyEffect({ type:'mbti', value:{ axis:'NS', toward:'N', weight: 0.5 }}, 'theme:acid');
    }
    if (theme === 'retro-arcade' && e.type === 'toast' && e.value === 'success') {
      // retro score +E drobek řeší UI; zde jen MBTI drobek
      get().applyEffect({ type:'mbti', value:{ axis:'EI', toward:'E', weight: 0.5 }}, 'theme:retro');
    }
  },

  setTheme(t) { set({ theme: t }); },
}), { name: 'synthoma-run' }));

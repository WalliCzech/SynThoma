"use client";
import { useEffect, useState } from "react";

interface MBTI { E:number; I:number; N:number; S:number; T:number; F:number; P:number; J:number }

interface Option {
  id: string;
  label: string;
  effects?: { hp?: number; sanity?: number; access?: number; score?: number; mbti?: Partial<MBTI> };
}

interface NodeDef {
  id: string;
  fragments: { html: string }[];
  options: Option[];
}

interface RunStateInput {
  runId: string;
  visited: string[];
  mbtiBias: MBTI;
  theme: string;
  hp: number;
  sanity: number;
  access: number;
  score: number;
  lastChoice: { id: string; tag?: string } | null;
}

export default function LlmRunPage() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
  const [state, setState] = useState<RunStateInput>({
    runId: `run-${Date.now()}`,
    visited: [],
    mbtiBias: { E:0,I:0,N:0,S:0,T:0,F:0,P:0,J:0 },
    theme: "acid-glitch",
    hp: 100,
    sanity: 80,
    access: 0,
    score: 0,
    lastChoice: null,
  });
  const [node, setNode] = useState<NodeDef| null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNode(s: RunStateInput) {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/run`, { method: 'POST', body: JSON.stringify(s), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      const j = await res.json();
      setNode(j);
    } catch (e:any) {
      setError(String(e.message ?? e));
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchNode(state); /* init */ }, []);

  function applyEffects(opt?: Option) {
    if (!opt?.effects) return;
    const e = opt.effects;
    setState(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp + (e.hp ?? 0)),
      sanity: Math.max(0, prev.sanity + (e.sanity ?? 0)),
      access: prev.access + (e.access ?? 0),
      score: prev.score + (e.score ?? 0),
      mbtiBias: {
        E: prev.mbtiBias.E + (e.mbti?.E ?? 0),
        I: prev.mbtiBias.I + (e.mbti?.I ?? 0),
        N: prev.mbtiBias.N + (e.mbti?.N ?? 0),
        S: prev.mbtiBias.S + (e.mbti?.S ?? 0),
        T: prev.mbtiBias.T + (e.mbti?.T ?? 0),
        F: prev.mbtiBias.F + (e.mbti?.F ?? 0),
        P: prev.mbtiBias.P + (e.mbti?.P ?? 0),
        J: prev.mbtiBias.J + (e.mbti?.J ?? 0),
      }
    }));
  }

  async function onChoose(opt: Option) {
    const nextState: RunStateInput = {
      ...state,
      visited: node ? [...state.visited, node.id] : state.visited,
      lastChoice: { id: opt.id },
    };
    // nejdřív lokálně aplikuj efekty (rychlejší UI)
    applyEffects(opt);
    await fetchNode(nextState);
    setState(prev => ({ ...nextState, hp: prev.hp, sanity: prev.sanity, access: prev.access, score: prev.score, mbtiBias: prev.mbtiBias }));
  }

  return (
    <div className="SYNTHOMAREADER panel crt fog" style={{ position: 'relative', zIndex: 10, margin: '64px auto', maxWidth: 900 }}>
      <h1 className="glitch-master title" style={{ margin: 0 }}>S Y N T H O M A · LLM</h1>
      <div className="text" style={{ opacity: 0.8, fontSize: '0.9rem', margin: '0.25rem 0 0.75rem' }}>
        hp {state.hp} · sanity {state.sanity} · access {state.access} · score {state.score}
      </div>
      <div className="reader-controls appear visible" style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-lg" onClick={() => fetchNode(state)}>↻ Znovu vygenerovat</button>
        <button className="btn btn-lg" onClick={() => { const fresh: RunStateInput = { runId:`run-${Date.now()}`, visited:[], mbtiBias:{E:0,I:0,N:0,S:0,T:0,F:0,P:0,J:0}, theme:"acid-glitch", hp:100, sanity:80, access:0, score:0, lastChoice:null }; setState(fresh); fetchNode(fresh); }}>✦ Nový běh</button>
      </div>
      {loading && <div className="text">…generuji uzel… (model šeptá temnotě)</div>}
      {error && <div className="text" style={{ color: '#f55' }}>Chyba: {error}</div>}
      {node && (
        <div style={{ marginTop: 8 }}>
          {node.fragments?.map((f, i) => (
            <div key={i} className="text" dangerouslySetInnerHTML={{ __html: f.html }} />
          ))}
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            {node.options && node.options.length > 0 ? (
              node.options.map((o) => (
                <button key={o.id} className="btn btn-lg" style={{ textAlign: 'left' }} onClick={() => onChoose(o)}>
                  {o.label}
                </button>
              ))
            ) : (
              <div className="text" style={{ opacity: 0.7 }}>— Žádné možnosti. Zkuste znovu vygenerovat —</div>
            )}
          </div>
          <details className="panel" style={{ marginTop: 12 }}>
            <summary>Debug JSON (co vrátilo API)</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}> {JSON.stringify(node, null, 2)} </pre>
          </details>
        </div>
      )}
      {!node && !loading && !error && (
        <div className="text" style={{ opacity: 0.8, marginTop: 8 }}>…čekám na první uzel… Pokud se nic neděje, klikni na „Znovu vygenerovat“ nahoře.</div>
      )}
    </div>
  );
}

'use client';
import { useRunStore } from '@web/stores/runStore';
import { computeMBTI } from '@shared/mbti';
import { GlitchScrambleTitle } from '@web/components/GlitchScrambleTitle';

export default function EndPage() {
  const { mbti, visited, hp, sanity, access, score } = useRunStore(s => ({
    mbti: s.mbti, visited: s.visited, hp: s.hp, sanity: s.sanity, access: s.access, score: s.score
  }));
  const res = computeMBTI(mbti as any);

  return (
    <div className="panel fx-noise p-16 m-16">
      <GlitchScrambleTitle as="h1" className="halo">SYNTHOMA: Závěr běhu</GlitchScrambleTitle>
      <p>Navštíveno uzlů: {visited.length} • Skóre: {score} • HP: {hp} • Sanity: {sanity} • Access: {access}</p>

      <h2 className="glitch-title" data-text={`MBTI: ${res.code}`} data-glitch="soft">
        MBTI: {res.code} <small className="opacity-70">(jistota {(res.confidence*100|0)}%)</small>
      </h2>

      <ul>
        <li>E: {mbti.E} vs I: {mbti.I} → <b>{res.axes.EI.letter}</b></li>
        <li>N: {mbti.N} vs S: {mbti.S} → <b>{res.axes.NS.letter}</b></li>
        <li>T: {mbti.T} vs F: {mbti.F} → <b>{res.axes.TF.letter}</b></li>
        <li>P: {mbti.P} vs J: {mbti.J} → <b>{res.axes.PJ.letter}</b></li>
      </ul>

      {res.notes.length ? <div className="opacity-90">
        <h3>Poznámky</h3>
        <ul>{res.notes.map((n,i)=><li key={i}>{n}</li>)}</ul>
      </div> : null}

      <p className="text-muted mt-8">
        Tohle je herní profil, ne diagnóza. Chceš přesnost? Dej si další běh a méně umírej.
      </p>

      <button className="btn" onClick={()=>location.href='/run'}>Zkusit znovu</button>
    </div>
  );
}

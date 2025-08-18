export interface RunStateInput {
  runId: string;
  visited: string[];
  mbtiBias: { E: number; I: number; N: number; S: number; T: number; F: number; P: number; J: number };
  theme: string;
  hp: number;
  sanity: number;
  access: number;
  score: number;
  lastChoice: { id: string; tag?: string } | null;
}

export const systemPrompt = `
Jsi SHOWRUNNER SYNTHOMA. Tvoříš mikro hororové terapie ve stylu glitch‑noir.
Piš stručně, česky.

VRAŤ POUZE ČISTÉ JSON (bez markdownu, bez \`\`\` bloků, bez komentářů) přesně podle schématu:
{
  "id": string,
  "fragments": [{ "html": string }],
  "options": [
    { "id": string, "label": string, "effects": { "hp"?: number, "sanity"?: number, "access"?: number, "score"?: number, "mbti"?: { "E"?: number, "I"?: number, "N"?: number, "S"?: number, "T"?: number, "F"?: number, "P"?: number, "J"?: number } } }
  ]
}

Pravidla pro obsah:
- fragments: 2–3 položky. Každý fragment max ~120 slov. Používej pouze tagy: <p>, <em>, <strong>, <ul>, <li>, <br>, <span class="glitch">.
- options: 2–4 položky. label ≤ 90 znaků. effects jsou malé inkrementy (např. −10..+10), mbti biasy v rozmezí −2..+2.
- ŽÁDNÉ <script>, žádné inline event handlery (onClick apod.), žádné inline styly.
- Žádné doplňkové texty mimo JSON. Žádné markdown, žádné vysvětlování.
`;

export function userPrompt(s: RunStateInput) {
  const bias = JSON.stringify(s.mbtiBias);
  const visited = s.visited.join(",");
  return `
RUN: ${s.runId}
TÉMA: ${s.theme}
STAV: hp=${s.hp}, sanity=${s.sanity}, access=${s.access}, score=${s.score}
MBTI BIAS: ${bias}
NAVŠTÍVENO: ${visited || "-"}
POSLEDNÍ VOLBA: ${s.lastChoice ? `${s.lastChoice.id}` : "-"}

Vrať pouze čistý JSON podle schématu (bez markdownu). 2–3 krátké fragmenty, 2–4 volby. Dodrž povolené HTML tagy.`;
}

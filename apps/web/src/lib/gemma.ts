export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function callGemma(messages: ChatMessage[], responseFormat?: any) {
  const url = process.env.GEMMA_BASE_URL as string | undefined;
  const key = process.env.GEMMA_API_KEY;
  const temperature = Number(process.env.GEMMA_TEMPERATURE ?? 0.8);
  const max_tokens = Number(process.env.GEMMA_MAX_TOKENS ?? 1200);
  const model = process.env.GEMMA_MODEL ?? 'gemma-3';
  const top_p = process.env.GEMMA_TOP_P !== undefined ? Number(process.env.GEMMA_TOP_P) : undefined;
  const top_k = process.env.GEMMA_TOP_K !== undefined ? Number(process.env.GEMMA_TOP_K) : undefined;
  const presence_penalty = process.env.GEMMA_PRESENCE_PENALTY !== undefined ? Number(process.env.GEMMA_PRESENCE_PENALTY) : undefined;
  const frequency_penalty = process.env.GEMMA_FREQUENCY_PENALTY !== undefined ? Number(process.env.GEMMA_FREQUENCY_PENALTY) : undefined;
  const repetition_penalty = process.env.GEMMA_REPETITION_PENALTY !== undefined ? Number(process.env.GEMMA_REPETITION_PENALTY) : undefined;
  const seed = process.env.GEMMA_SEED !== undefined ? Number(process.env.GEMMA_SEED) : undefined;
  const stop = process.env.GEMMA_STOP ? process.env.GEMMA_STOP.split(',').map(s => s.trim()).filter(Boolean) : undefined;

  if (!url) {
    throw new Error('GEMMA_BASE_URL není nastaven. Přidej ho do apps/web/.env.local (např. http://127.0.0.1:8000/v1/chat/completions)');
  }
  if (!model) {
    throw new Error('GEMMA_MODEL není nastaven. Přidej ho do apps/web/.env.local podle ID modelu ve tvém inference serveru.');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const body: any = {
    model,
    messages,
    temperature,
    max_tokens,
  };
  if (top_p !== undefined && !Number.isNaN(top_p)) body.top_p = top_p;
  if (top_k !== undefined && !Number.isNaN(top_k)) body.top_k = top_k;
  if (presence_penalty !== undefined && !Number.isNaN(presence_penalty)) body.presence_penalty = presence_penalty;
  if (frequency_penalty !== undefined && !Number.isNaN(frequency_penalty)) body.frequency_penalty = frequency_penalty;
  if (repetition_penalty !== undefined && !Number.isNaN(repetition_penalty)) body.repetition_penalty = repetition_penalty;
  if (seed !== undefined && !Number.isNaN(seed)) body.seed = seed;
  if (stop && stop.length) body.stop = stop;
  if (responseFormat) body.response_format = responseFormat;

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`Gemma HTTP ${res.status}${txt ? `: ${txt.slice(0, 500)}` : ''}`);
  }
  const j = await res.json();
  const text = j.choices?.[0]?.message?.content ?? j.choices?.[0]?.text ?? '';
  return text;
}

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ''; }
}

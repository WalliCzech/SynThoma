import { NextRequest, NextResponse } from 'next/server';
import { callGemma, type ChatMessage } from '../../../src/lib/gemma';
import { systemPrompt, userPrompt, type RunStateInput } from './prompt';

// velmi jednoduchá sanitizace povolených tagů
function sanitize(html: string) {
  // odstraníme skripty a event handlery
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/ on[a-z]+="[^"]*"/gi, '');
  // povolené tagy jen zhruba – server stejně nevloží nic nebezpečného
  return html;
}

export async function POST(req: NextRequest) {
  try {
    const ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    } as Record<string, string>;
    const state = (await req.json()) as RunStateInput;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt(state) },
    ];

    // Lokální server nepodporuje response_format=json_object → spoléhej na prompt
    const response = await callGemma(messages);
    console.log('[API /api/run] Raw LLM response (head):', String(response).slice(0, 400));

    let node: any;
    try {
      node = JSON.parse(response);
    } catch (e: any) {
      // 1) ```json ... ``` blok
      const codeBlock = response.match(/```json\s*([\s\S]*?)\s*```/i);
      if (codeBlock && codeBlock[1]) {
        try { node = JSON.parse(codeBlock[1]); } catch {}
      }
      // 2) První '{' až poslední '}'
      if (!node) {
        const first = response.indexOf('{');
        const last = response.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          const slice = response.slice(first, last + 1);
          try { node = JSON.parse(slice); } catch {}
        }
      }
      // 3) Původní koncová závorka
      if (!node) {
        const match = response.match(/\{[\s\S]*\}$/);
        if (match) {
          try { node = JSON.parse(match[0]); } catch {}
        }
      }
      if (!node) throw new Error(`Model nevrátil validní JSON. Head: ${String(response).slice(0, 400)}`);
    }

    // debug: vytiskni základní tvar
    console.log('[API /api/run] Parsed keys:', Object.keys(node || {}));
    console.log('[API /api/run] fragments type/len:', Array.isArray(node?.fragments), node?.fragments?.length);
    console.log('[API /api/run] options type/len:', Array.isArray(node?.options), node?.options?.length);

    if (!node || !Array.isArray(node.fragments) || !Array.isArray(node.options)) {
      throw new Error('Neplatný tvar NodeDef');
    }

    node.fragments = node.fragments.map((f: any) => ({ html: sanitize(String(f.html ?? '')) }));

    return NextResponse.json(node, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    const ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    } as Record<string, string>;
    console.error('[API /api/run] Error:', err?.stack || err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  const ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  } as Record<string, string>;
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

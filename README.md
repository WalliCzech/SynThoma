# SYNTHOMA

Psychologický horor s glitchem, neonem a paměťovými jizvami. Pokud to zní jako špatný nápad – je to záměr.

## Monorepo

- apps/web – Next.js 14 + TS, MUI, Zustand, React Query, Framer Motion
- apps/server – FastAPI (REST + WS), Redis, SQLite
- packages/shared – sdílené typy a schémata (Zod)

## Zachované styly a efekty (kanon)

Barvy → CSS proměnné a efekty:

- #00ffff nervové dráhy, „bezpečí", systémové pozadí → `--c-neon-cyan` + efekt `pulseWave`
- #ff00ff trhliny, portály, jizvy → `--c-glitch-magenta` + efekt `riftGlow`
- #f6ff00 acid žluť výstrah/restart → `--c-acid-yellow` + efekt `kernelBlink`
- #000d1a závoj identity, Prázdnota → `--c-void-navy` + efekt `voidVignette`
- #c0faff datová mlha → `--c-data-fog` + efekt `fogNoise`

Doplňkové: `--c-surface-xx`, `--c-ink`, `--c-ghost-white`, `--c-punk-pink`

UI zařízení:

- `components/lore/LoreBookTerminal` – CRT (crtFlicker, scanline, textTypewriter)
- `components/hud/AIWhisperBox` – WS šepoty
- `components/inventory/*` – grid, tooltipy, rodokmen
- `components/combat/*` – tahově/RT + taktický log
- `components/hud/*` – Health/Stamina/Sanity, MiniMap, RunStats, NPCStatusStrip, CharacterBioPanel

Mechaniky: emoce deformují prostor → glitch → portály (cyan/strach, magenta/vina, žluť/pýcha, bledě modrá/zapomnění).

## Definition of Done (DoD)

- Fáze 1: Domovská stránka ukazuje všechny efekty a režimy tématu (default | neon | glitch | sanity_breach). Barvy a efekty viditelné v auditě.
- Fáze 2: HUD reaguje na stav, Inventář a LoreBook fungují, CRT efekt viditelný.
- Fáze 3: MapViewer a volby (min. 3), HUD/Mapa se aktualizují.
- Fáze 4: FastAPI s rozhraními `/run/init`, `/run/choice`, `/ws/whisper`.
- Fáze 5: Persistovaný stav + „paměťová meteorologie“ mění theme.
- Fáze 6: Combat MVP přepínatelný tahově/RT, log.
- Fáze 7: Testy (Vitest/PyTest), Storybook, Playwright.
- Fáze 8: CI/CD – GH Actions, Vercel/Render/Fly.
- Fáze 9: Prompty s guardrails.
- Fáze 10: Style Proof galerie.

> Tip: Nepoužívej inline barvičky jak na dětském karnevalu. Všechno přes `styles/theme.ts` a `styles/effects.css`. Jinak se probudí Glitchka. 😈

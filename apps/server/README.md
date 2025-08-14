# apps/server

FastAPI backend: REST + WebSockety. Místo, kde logika šeptá a SQLite si zapisuje tvoje hříchy.

- Endpoints: `/run/init`, `/run/choice`, `/lore/query`
- WS: `/ws/whisper`
- Providers: `providers/llm.py` (Ollama/LlamaCpp/Remote)
- Persistence: Redis (sessions), SQLite (Archiv selhání)
